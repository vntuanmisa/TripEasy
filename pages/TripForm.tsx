
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Trip, Currency, RoundingRule, Member } from '../types';
import { CURRENCIES, ROUNDING_RULES, DEFAULT_CATEGORIES } from '../constants';
import { LanguageContext } from '../LanguageContext';
import LocationInput from '../components/LocationInput';

interface TripFormProps {
    addTrip?: (trip: Trip) => void;
    updateTrip?: (trip: Trip) => void;
    trips?: Trip[];
}

const TripForm: React.FC<TripFormProps> = ({ addTrip, updateTrip, trips }) => {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const { t } = useContext(LanguageContext);
    const isEditMode = !!tripId;
    
    const [trip, setTrip] = useState<Omit<Trip, 'id' | 'members' | 'itinerary' | 'expenses' | 'categories'>>({
        name: '',
        from: '',
        to: '',
        startDate: '',
        endDate: '',
        adults: 1,
        children: 0,
        currency: Currency.VND,
        childCoefficient: 0.5,
        roundingRule: RoundingRule.THOUSAND,
    });
    const [memberNames, setMemberNames] = useState<{adults: string[], children: string[]}>({adults: [''], children: []});

    useEffect(() => {
        if (isEditMode && trips) {
            const existingTrip = trips.find(t => t.id === tripId);
            if (existingTrip) {
                setTrip(existingTrip);
                const adults = existingTrip.members.filter(m => m.coefficient === 1).map(m => m.name);
                const children = existingTrip.members.filter(m => m.coefficient !== 1).map(m => m.name);
                setMemberNames({ adults, children });
            }
        }
    }, [isEditMode, tripId, trips]);

    useEffect(() => {
        const totalAdults = trip.adults || 0;
        const totalChildren = trip.children || 0;
        setMemberNames(prev => ({
            adults: Array.from({length: totalAdults}, (_, i) => prev.adults[i] || `${t('adult')} ${i+1}`),
            children: Array.from({length: totalChildren}, (_, i) => prev.children[i] || `${t('child')} ${i+1}`),
        }));
    }, [trip.adults, trip.children, t]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;

        if (['adults', 'children', 'childCoefficient', 'roundingRule'].includes(name)) {
            processedValue = parseFloat(value);
            if (isNaN(processedValue) || processedValue < 0) processedValue = 0;
        }

        setTrip(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleLocationChange = (name: 'from' | 'to', value: string) => {
        setTrip(prev => ({...prev, [name]: value}));
    };

    const handleMemberNameChange = (type: 'adults' | 'children', index: number, name: string) => {
        setMemberNames(prev => {
            const newNames = [...prev[type]];
            newNames[index] = name;
            return {...prev, [type]: newNames };
        })
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!trip.name || !trip.from || !trip.to) {
            alert(t('fill_required_fields'));
            return;
        }

        const members: Member[] = [
            ...memberNames.adults.map((name, i) => ({ id: `adult-${Date.now()}-${i}`, name, coefficient: 1})),
            ...memberNames.children.map((name, i) => ({ id: `child-${Date.now()}-${i}`, name, coefficient: trip.childCoefficient}))
        ];

        if (isEditMode && updateTrip && tripId) {
            const existingTrip = trips?.find(t => t.id === tripId);
            if (existingTrip) {
                updateTrip({ ...existingTrip, ...trip, members });
                navigate(`/trip/${tripId}`);
            }
        } else if (addTrip) {
            const newTrip: Trip = {
                ...trip,
                id: new Date().toISOString(),
                members,
                itinerary: [],
                expenses: [],
                categories: [...DEFAULT_CATEGORIES],
            };
            addTrip(newTrip);
            navigate(`/trip/${newTrip.id}`);
        }
    };

    const renderInput = (id: string, label: string, type: string, value: string | number, required = false, props = {}, icon?: string) => (
        <div className="mb-6">
            <label htmlFor={id} className="block text-secondary text-sm font-bold mb-2">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    required={required}
                    className={`shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-primary ${icon ? 'pl-10' : ''}`}
                    {...props}
                />
                {icon && <i className={`fa-solid ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`}></i>}
            </div>
        </div>
    );
    
    const renderSelect = <T extends string | number,>(id: string, label: string, value: T, options: {value: T, label: string}[]) => (
         <div className="mb-6">
            <label htmlFor={id} className="block text-secondary text-sm font-bold mb-2">{label}</label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={handleChange}
                className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
                {options.map(opt => <option key={String(opt.value)} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-20">
                 <Link to={isEditMode ? `/trip/${tripId}` : '/'} className="text-primary text-2xl">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <h1 className="text-xl font-bold text-dark mx-auto">{t(isEditMode ? 'edit_trip' : 'create_new_trip')}</h1>
                <div className="w-8"></div>
            </header>
            <form onSubmit={handleSubmit} className="p-6">
                {renderInput('name', t('trip_name'), 'text', trip.name, true)}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                         <label className="block text-secondary text-sm font-bold mb-2">{t('departure_point')}</label>
                         <LocationInput value={trip.from} onChange={(val) => handleLocationChange('from', val)} />
                    </div>
                     <div>
                         <label className="block text-secondary text-sm font-bold mb-2">{t('destination')}</label>
                         <LocationInput value={trip.to} onChange={(val) => handleLocationChange('to', val)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {renderInput('startDate', t('start_date'), 'date', trip.startDate)}
                    {renderInput('endDate', t('end_date'), 'date', trip.endDate)}
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    {renderInput('adults', t('num_adults'), 'number', trip.adults, false, {min: 0})}
                    {renderInput('children', t('num_children'), 'number', trip.children, false, {min: 0})}
                </div>
                
                { (trip.adults > 0 || trip.children > 0) &&
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-secondary mb-2">{t('member_names')}</h3>
                    {memberNames.adults.map((name, i) => 
                        <input key={`adult-${i}`} type="text" value={name} onChange={e => handleMemberNameChange('adults', i, e.target.value)} placeholder={`${t('adult')} ${i+1}`} className="shadow-inner mb-2 border rounded-lg w-full py-2 px-3 text-dark"/>
                    )}
                    {memberNames.children.map((name, i) => 
                        <input key={`child-${i}`} type="text" value={name} onChange={e => handleMemberNameChange('children', i, e.target.value)} placeholder={`${t('child')} ${i+1}`} className="shadow-inner mb-2 border rounded-lg w-full py-2 px-3 text-dark"/>
                    )}
                </div>
                }

                {renderSelect('currency', t('default_currency'), trip.currency, CURRENCIES)}
                {renderInput('childCoefficient', t('child_coeff'), 'number', trip.childCoefficient, false, {step: 0.1, min:0, max: 1})}
                {renderSelect('roundingRule', t('rounding_rule'), trip.roundingRule, ROUNDING_RULES.map(r => ({value: Number(r.value), label: t(r.labelKey)})))}
                
                <button type="submit" className="w-full bg-primary text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors duration-300 mt-4">
                    {t(isEditMode ? 'save_changes' : 'save_trip')}
                </button>
            </form>
        </div>
    );
};

export default TripForm;