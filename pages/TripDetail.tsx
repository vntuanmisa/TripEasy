
import React, { useContext } from 'react';
import { useParams, Outlet, Link, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Trip } from '../types';
import { LanguageContext } from '../LanguageContext';

interface TripDetailProps {
    trips: Trip[];
    updateTrip: (trip: Trip) => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trips, updateTrip }) => {
    const { tripId } = useParams<{ tripId: string }>();
    const location = useLocation();
    const { t } = useContext(LanguageContext);
    
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-xl text-secondary">{t('trip_not_found')}</p>
                <Link to="/" className="mt-4 text-primary hover:underline">{t('go_to_dashboard')}</Link>
            </div>
        );
    }
    
    const getTabTitle = () => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case 'itinerary': return t('itinerary');
            case 'expenses': return t('expenses');
            case 'report': return t('report_and_split');
            case 'members': return t('members');
            default: return t('trip_details');
        }
    };

    return (
        <div className="pb-20 bg-gray-50 min-h-screen">
            <header className="bg-white p-4 sticky top-0 z-30 shadow-sm flex items-center">
                <Link to="/" className="text-primary text-2xl" aria-label={t('back_to_dashboard')}>
                    <i className="fa-solid fa-chevron-left"></i>
                </Link>
                <div className="flex flex-col items-center flex-grow">
                    <h1 className="text-lg font-bold text-dark">{trip.name}</h1>
                    <h2 className="text-sm font-semibold text-secondary">{getTabTitle()}</h2>
                </div>
                <div className="w-6"></div>
            </header>
            
            <main className="p-4">
                <Outlet context={{ trip, updateTrip }} />
            </main>

            <BottomNav tripId={trip.id} />
        </div>
    );
};

export default TripDetail;
