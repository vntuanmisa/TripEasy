import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trip, Expense, Category, Currency } from '../types';
import Modal from '../components/Modal';
import { extractInfoFromReceipt } from '../services/geminiService';
import { CURRENCIES } from '../constants';
import { LanguageContext } from '../LanguageContext';
import { formatCurrency } from '../formatters';
import FormattedNumberInput from '../FormattedNumberInput';

interface OutletContext {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
}

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

const ExpensesTab: React.FC = () => {
    const { trip, updateTrip } = useOutletContext<OutletContext>();
    const { t } = useContext(LanguageContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [filters, setFilters] = useState({ paidBy: 'all', category: 'all' });
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    const filteredExpenses = useMemo(() => {
        return trip.expenses.filter(exp => 
            (filters.paidBy === 'all' || exp.paidBy === filters.paidBy) &&
            (filters.category === 'all' || exp.category === filters.category)
        );
    }, [trip.expenses, filters]);

    const groupedExpenses = useMemo(() => {
        return filteredExpenses.reduce<Record<string, { expenses: Expense[], total: number }>>((acc, expense) => {
            const date = expense.date;
            if (!acc[date]) acc[date] = { expenses: [], total: 0 };
            acc[date].expenses.push(expense);
            const amountInDefaultCurrency = expense.currency === trip.currency ? expense.amount : expense.amount * (expense.exchangeRate || 1);
            acc[date].total += amountInDefaultCurrency;
            return acc;
        }, {});
    }, [filteredExpenses, trip.currency]);

    useEffect(() => {
        setExpandedDates(prev => {
            const newState = {...prev};
            Object.keys(groupedExpenses).forEach(date => {
                if (newState[date] === undefined) {
                    newState[date] = true; 
                }
            });
            return newState;
        });
    }, [groupedExpenses]);
    
    const handleToggleDate = (date: string) => {
        setExpandedDates(prev => ({...prev, [date]: !prev[date]}));
    };

    const handleOpenModal = (expense: Expense | null = null) => {
        setIsEditMode(!!expense);
        setCurrentExpense(expense ? { ...expense } : {
            date: new Date().toISOString().split('T')[0],
            currency: trip.currency,
            paidBy: trip.members[0]?.id || '',
            shared: true,
            category: trip.categories[0],
        });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);
    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setCurrentExpense(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setIsScanning(true);
        try {
            const base64 = await fileToBase64(file);
            setCurrentExpense(prev => ({ ...prev, receiptImage: base64 }));
            const result = await extractInfoFromReceipt(base64, file.type);
            if (result) {
                setCurrentExpense(prev => ({ ...prev, amount: result.amount ?? prev.amount, content: result.content ?? prev.content }));
            }
        } catch (error) {
            console.error("Error processing file:", error);
            alert(t('scan_receipt_error'));
        } finally {
            setIsScanning(false);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseToSave = { ...currentExpense, amount: currentExpense.amount || 0 } as Expense;
        if (!expenseToSave.content || !expenseToSave.amount) {
            alert(t('fill_content_amount'));
            return;
        }
        const newExpenses = isEditMode
            ? trip.expenses.map(ex => ex.id === expenseToSave.id ? expenseToSave : ex)
            : [...trip.expenses, { ...expenseToSave, id: new Date().toISOString() }];
        
        newExpenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        updateTrip({ ...trip, expenses: newExpenses });
        handleCloseModal();
    };
    const handleDelete = (expenseId: string) => {
        if(window.confirm(t('confirm_delete_expense'))) {
            updateTrip({ ...trip, expenses: trip.expenses.filter(ex => ex.id !== expenseId) });
        }
    };
    const handleCategoryUpdate = (newCategories: Category[]) => {
        updateTrip({ ...trip, categories: newCategories });
    };

    return (
        <div>
            <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                <div className="grid grid-cols-2 gap-2">
                    <select value={filters.paidBy} onChange={e => setFilters(f => ({...f, paidBy: e.target.value}))} className="w-full bg-gray-100 border-none rounded-md p-2">
                        <option value="all">{t('all_members')}</option>
                        {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="w-full bg-gray-100 border-none rounded-md p-2">
                        <option value="all">{t('all_categories')}</option>
                        {trip.categories.map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                </div>
                 <button onClick={() => setIsCategoryModalOpen(true)} className="text-sm text-primary w-full text-center mt-2">{t('manage_categories')}</button>
            </div>

            {Object.entries(groupedExpenses).map(([date, {expenses, total}]) => (
                <div key={date} className="mb-4">
                     <button onClick={() => handleToggleDate(date)} className="w-full text-left flex justify-between items-baseline mb-2 bg-white p-3 rounded-lg shadow-sm">
                        <h4 className="font-bold text-dark">{new Date(date).toLocaleDateString(t('locale'), {weekday: 'long', day: 'numeric', month: 'short'})}</h4>
                        <div className="flex items-center">
                            <span className="font-semibold text-secondary mr-3">{formatCurrency(total, trip.currency)}</span>
                             <i className={`fa-solid fa-chevron-down transition-transform ${expandedDates[date] ? 'rotate-180' : ''}`}></i>
                        </div>
                    </button>
                    {expandedDates[date] && (
                        <div className="pl-4">
                            {expenses.map(expense => (
                                <div key={expense.id} className="bg-white p-3 rounded-lg shadow-sm mb-2">
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-dark">{expense.content}</p>
                                            <p className="text-sm text-primary font-semibold">{formatCurrency(expense.amount, expense.currency)}</p>
                                            <p className="text-xs text-secondary mt-1">{t('paid_by')} {trip.members.find(m => m.id === expense.paidBy)?.name}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                             <button onClick={() => handleOpenModal(expense)} className="text-gray-400 hover:text-primary"><i className="fas fa-pencil-alt"></i></button>
                                             <button onClick={() => handleDelete(expense.id)} className="text-gray-400 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            
            <button onClick={() => handleOpenModal()} className="fixed bottom-20 right-6 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 z-20">
                <i className="fa-solid fa-plus text-2xl"></i>
            </button>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={t(isEditMode ? "edit_expense" : "add_expense")}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('receipt')}</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                        {isScanning && <p className="text-sm text-blue-500 animate-pulse">{t('scanning')}...</p>}
                    </div>
                    <input type="text" name="content" placeholder={t('expense_content')} value={currentExpense.content || ''} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                    <div className="grid grid-cols-2 gap-4">
                        <FormattedNumberInput value={currentExpense.amount || 0} onChange={(val) => setCurrentExpense(p => ({...p, amount: val}))} />
                        <select name="currency" value={currentExpense.currency} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                     {currentExpense.currency !== trip.currency && <input type="number" name="exchangeRate" placeholder={t('exchange_rate_placeholder', {from: currentExpense.currency, to: trip.currency})} value={currentExpense.exchangeRate || ''} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required step="any" />}
                    <select name="paidBy" value={currentExpense.paidBy} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input type="date" name="date" value={currentExpense.date || ''} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                    <select name="category" value={currentExpense.category} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        {trip.categories.map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                    <select name="activityId" value={currentExpense.activityId || 'none'} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option value="none">{t('no_related_activity')}</option>
                        {trip.itinerary.map(a => <option key={a.id} value={a.id}>{a.date} - {a.activity}</option>)}
                    </select>
                    <div className="flex items-center"><input id="shared" name="shared" type="checkbox" checked={currentExpense.shared} onChange={handleCategoryChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" /><label htmlFor="shared" className="ml-2 block text-sm text-gray-900">{t('share_this_expense')}</label></div>
                    <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600">{t(isEditMode ? "save_changes" : "save_expense")}</button>
                </form>
            </Modal>
            <CategoryManagerModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={trip.categories} onUpdate={handleCategoryUpdate} />
        </div>
    );
};

const CategoryManagerModal: React.FC<{isOpen: boolean, onClose: () => void, categories: Category[], onUpdate: (cats: Category[])=>void}> = ({isOpen, onClose, categories, onUpdate}) => {
    const { t } = useContext(LanguageContext);
    const [newCategory, setNewCategory] = useState('');
    const handleAdd = () => {
        if (newCategory && !categories.includes(newCategory)) {
            onUpdate([...categories, newCategory]);
            setNewCategory('');
        }
    };
    const handleDelete = (catToDelete: Category) => {
        if(window.confirm(t('confirm_delete_category'))) onUpdate(categories.filter(c => c !== catToDelete));
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('manage_categories')}>
            <div className="space-y-2">
                {categories.map(cat => (
                    <div key={cat} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span>{t(cat)}</span>
                        <button onClick={() => handleDelete(cat)} className="text-red-500"><i className="fas fa-trash"></i></button>
                    </div>
                ))}
            </div>
            <div className="flex space-x-2 mt-4">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder={t('new_category_name')} className="flex-grow border border-gray-300 rounded p-2" />
                <button onClick={handleAdd} className="bg-primary text-white px-4 rounded">{t('add')}</button>
            </div>
        </Modal>
    )
}

export default ExpensesTab;