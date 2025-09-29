import React, { useMemo, useState, useContext, FC, ReactNode } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trip } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LanguageContext } from '../LanguageContext';
import { formatCurrency } from '../formatters';

interface OutletContext {
  trip: Trip;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19B2FF'];

const CollapsibleSection: FC<{ title: string; children: ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <h3 className="font-bold text-lg text-dark">{title}</h3>
                <i className={`fa-solid fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && <div className="p-4 border-t border-gray-100">{children}</div>}
        </div>
    );
};

const ReportTab: React.FC = () => {
    const { trip } = useOutletContext<OutletContext>();
    const { t } = useContext(LanguageContext);

    const calculationResults = useMemo(() => {
        const sharedExpenses = trip.expenses.filter(e => e.shared);
        
        const convertToDefaultCurrency = (amount: number, currency: string, exchangeRate?: number) => 
            currency === trip.currency ? amount : amount * (exchangeRate || 1);

        const totalSharedCost = sharedExpenses.reduce((acc, exp) => acc + convertToDefaultCurrency(exp.amount, exp.currency, exp.exchangeRate), 0);
        const totalShares = trip.members.reduce((acc, member) => acc + member.coefficient, 0);
        const costPerShare = totalShares > 0 ? totalSharedCost / totalShares : 0;

        const memberTotals = trip.members.map(member => {
            const paid = trip.expenses
                .filter(e => e.paidBy === member.id)
                .reduce((acc, exp) => acc + convertToDefaultCurrency(exp.amount, exp.currency, exp.exchangeRate), 0);
            const owes = costPerShare * member.coefficient;
            return { member, paid, owes, balance: paid - owes };
        });

        const byCategory = sharedExpenses.reduce((acc, {category, amount, currency, exchangeRate}) => {
            if (!acc[category]) acc[category] = 0;
            acc[category] += convertToDefaultCurrency(amount, currency, exchangeRate);
            return acc;
        }, {} as Record<string, number>);

        const byDay = sharedExpenses.reduce((acc, {date, amount, currency, exchangeRate}) => {
            if (!acc[date]) acc[date] = 0;
            acc[date] += convertToDefaultCurrency(amount, currency, exchangeRate);
            return acc;
        }, {} as Record<string, number>);
        
        const itineraryMap = trip.itinerary.reduce((map, act) => {
            map[act.id] = act.activity;
            return map;
        }, {} as Record<string, string>);

        const byItinerary = sharedExpenses.reduce((acc, {activityId, amount, currency, exchangeRate}) => {
            const key = activityId || 'none';
            if (!acc[key]) acc[key] = { total: 0, name: key === 'none' ? t('no_related_activity') : (itineraryMap[key] || `Activity ${key.substring(0,4)}`) };
            acc[key].total += convertToDefaultCurrency(amount, currency, exchangeRate);
            return acc;
        }, {} as Record<string, {name: string, total: number}>);


        return {
            totalSharedCost,
            memberTotals,
            pieData: Object.entries(byCategory).map(([name, value]) => ({ name: t(name), value })),
            byCategoryData: Object.entries(byCategory).map(([name, total]) => ({ name: t(name), total })),
            byMemberData: memberTotals.map(({ member, paid }) => ({ name: member.name, paid })),
            byDayData: Object.entries(byDay)
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([date, total]) => ({ name: new Date(date).toLocaleDateString(t('locale'), {month: 'short', day: 'numeric'}), total })),
            byItineraryData: Object.values(byItinerary),
        };
    }, [trip, t]);
    
    return (
        <div className="space-y-6">
            <CollapsibleSection title={t('summary')}>
                <h4 className="font-bold text-lg mb-2">{t('total_shared_cost')}</h4>
                <p className="text-3xl font-bold text-primary">{formatCurrency(calculationResults.totalSharedCost, trip.currency)}</p>
            </CollapsibleSection>
            
            <CollapsibleSection title={t('cost_splitting')}>
                 <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-secondary uppercase bg-gray-50"><tr><th className="px-4 py-3">{t('member')}</th><th className="px-4 py-3 text-right">{t('paid')}</th><th className="px-4 py-3 text-right">{t('balance')}</th></tr></thead><tbody>{calculationResults.memberTotals.map(({ member, paid, balance }) => (<tr key={member.id} className="border-b"><td className="px-4 py-3 font-medium text-dark">{member.name}</td><td className="px-4 py-3 text-right">{formatCurrency(paid, trip.currency)}</td><td className={`px-4 py-3 text-right font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{balance >= 0 ? `+` : ''}{formatCurrency(balance, trip.currency)}</td></tr>))}</tbody></table></div>
            </CollapsibleSection>

            <CollapsibleSection title={t('cost_by_category')}>
                {calculationResults.pieData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart><Pie data={calculationResults.pieData} outerRadius={80} fill="#8884d8" dataKey="value" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>{calculationResults.pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value: number) => formatCurrency(value, trip.currency)} /><Legend/></PieChart>
                    </ResponsiveContainer>
                 ) : <p className="text-center text-secondary py-8">{t('no_shared_expenses')}</p>}
            </CollapsibleSection>
            
            <CollapsibleSection title={t('by_itinerary_activity')}>
                 <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={calculationResults.byItineraryData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis type="number" tickFormatter={(val) => formatCurrency(val, trip.currency, 0)} />
                         <YAxis type="category" dataKey="name" width={80} />
                         <Tooltip formatter={(value: number) => formatCurrency(value, trip.currency)} />
                         <Bar dataKey="total" fill="#00C49F" />
                    </BarChart>
                </ResponsiveContainer>
            </CollapsibleSection>

            <CollapsibleSection title={t('by_member')}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={calculationResults.byMemberData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => formatCurrency(val, trip.currency, 0)} />
                        <Tooltip formatter={(value: number) => formatCurrency(value, trip.currency)} />
                        <Bar dataKey="paid" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </CollapsibleSection>
            
            <CollapsibleSection title={t('by_day')}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={calculationResults.byDayData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => formatCurrency(val, trip.currency, 0)} />
                        <Tooltip formatter={(value: number) => formatCurrency(value, trip.currency)} />
                        <Bar dataKey="total" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </CollapsibleSection>
        </div>
    );
};

export default ReportTab;