
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Trip } from '../types';
import { formatCurrency } from '../formatters';
import { LanguageContext } from '../LanguageContext';

interface TripCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
  totalCost: number;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, totalCost }) => {
    const { t } = useContext(LanguageContext);

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(t('confirm_delete_trip', { tripName: trip.name }))) {
            onDelete(trip.id);
        }
    };
    
    return (
        <div className="relative">
            <Link to={`/trip/${trip.id}`} className="block bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-2">{trip.name}</h2>
                        <div className="flex items-center text-secondary text-md mb-4">
                            <i className="fa-solid fa-plane-departure mr-2"></i>
                            <span>{trip.from}</span>
                            <i className="fa-solid fa-arrow-right-long mx-3"></i>
                            <i className="fa-solid fa-plane-arrival mr-2"></i>
                            <span>{trip.to}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link to={`/edit/${trip.id}`} onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-primary p-2 rounded-full transition-colors" aria-label={t('edit_trip')}>
                            <i className="fa-solid fa-pencil"></i>
                        </Link>
                         <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors" aria-label={t('delete_trip')}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                        <i className="fa-solid fa-calendar-days mr-2 text-primary"></i>
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>
                    <div className="flex items-center">
                        <i className="fa-solid fa-users mr-2 text-primary"></i>
                        <span>{trip.adults} {t('adults')}, {trip.children} {t('children')}</span>
                    </div>
                </div>
                 <div className="bg-blue-50 text-primary font-bold p-3 rounded-lg mt-4 flex justify-between items-center">
                    <span>{t('total_cost')}</span>
                    <span>{formatCurrency(totalCost, trip.currency)}</span>
                </div>
            </Link>
        </div>
    );
};

export default TripCard;
