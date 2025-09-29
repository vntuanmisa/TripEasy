
import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { Trip } from '../types';
import { LanguageContext } from '../LanguageContext';
import Modal from '../components/Modal';

interface DashboardProps {
    trips: Trip[];
    deleteTrip: (tripId: string) => void;
    setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const calculateTotalCost = (trip: Trip): number => {
    return trip.expenses.reduce((acc, expense) => {
        const amountInDefaultCurrency = expense.currency === trip.currency
            ? expense.amount
            : expense.amount * (expense.exchangeRate || 1);
        return acc + amountInDefaultCurrency;
    }, 0);
};

const Dashboard: React.FC<DashboardProps> = ({ trips, deleteTrip, setTrips }) => {
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const handleJoinTrip = () => {
        const tripExists = trips.some(trip => trip.id === joinCode);
        if (tripExists) {
            navigate(`/trip/${joinCode}`);
        } else {
            alert(t('trip_not_found'));
        }
        setIsJoinModalOpen(false);
    };

    const sortedTrips = useMemo(() => {
        return [...trips].sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
    }, [trips]);

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="p-4 md:p-6 pb-24">
                {trips.length === 0 ? (
                    <div className="text-center py-10">
                        <i className="fas fa-suitcase-rolling text-6xl text-gray-300 mb-4"></i>
                        <h2 className="text-xl font-semibold text-dark">{t('no_trips_yet')}</h2>
                        <p className="text-secondary mt-2">{t('start_planning')}</p>
                        <Link to="/new" className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105">
                           {t('create_new_trip')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-0">
                       {sortedTrips.map(trip => (
                            <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} totalCost={calculateTotalCost(trip)} />
                        ))}
                    </div>
                )}
            </main>

            <div className="fixed bottom-6 right-6 z-20 flex flex-col items-center space-y-3">
                 <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="bg-secondary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600 transition-transform transform hover:scale-110"
                    title={t('join_trip')}
                    aria-label={t('join_trip')}
                >
                    <i className="fa-solid fa-right-to-bracket text-xl"></i>
                </button>
                <Link
                    to="/new"
                    className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110"
                    title={t('create_new_trip')}
                    aria-label={t('create_new_trip')}
                >
                    <i className="fa-solid fa-plus text-2xl"></i>
                </Link>
            </div>
            
            <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title={t('join_trip')}>
                <div className="space-y-4">
                    <p className="text-sm text-secondary">{t('join_trip_desc')}</p>
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder={t('enter_trip_code')}
                        className="flex-grow shadow-inner appearance-none border rounded-lg w-full py-2 px-3 text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button onClick={handleJoinTrip} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        {t('join')}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;