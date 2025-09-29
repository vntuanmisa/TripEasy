
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TripForm from './pages/TripForm';
import TripDetail from './pages/TripDetail';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Trip } from './types';
import ItineraryTab from './pages/ItineraryTab';
import ExpensesTab from './pages/ExpensesTab';
import ReportTab from './pages/ReportTab';
import MembersTab from './pages/MembersTab';
import { LanguageProvider, LanguageContext } from './LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const AppContent: React.FC = () => {
    const [trips, setTrips] = useLocalStorage<Trip[]>('trips', []);
    const { t } = useContext(LanguageContext);

    const addTrip = (trip: Trip) => {
        setTrips(prevTrips => [...prevTrips, trip]);
    };

    const updateTrip = (updatedTrip: Trip) => {
        setTrips(prevTrips => prevTrips.map(trip => trip.id === updatedTrip.id ? updatedTrip : trip));
    };

    const deleteTrip = (tripId: string) => {
        setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
    };

    return (
        <div className="max-w-screen-md mx-auto font-sans">
            <header className="bg-primary text-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center">
                <div>
                     <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('app_name')}</h1>
                     <p className="text-sm opacity-90">{t('app_subtitle')}</p>
                </div>
                <LanguageSwitcher />
            </header>
            <Routes>
                <Route path="/" element={<Dashboard trips={trips} deleteTrip={deleteTrip} setTrips={setTrips} />} />
                <Route path="/new" element={<TripForm addTrip={addTrip} />} />
                <Route path="/edit/:tripId" element={<TripForm trips={trips} updateTrip={updateTrip} />} />
                <Route path="/trip/:tripId" element={<TripDetail trips={trips} updateTrip={updateTrip} />}>
                    <Route index element={<Navigate to="itinerary" replace />} />
                    <Route path="itinerary" element={<ItineraryTab />} />
                    <Route path="expenses" element={<ExpensesTab />} />
                    <Route path="report" element={<ReportTab />} />
                    <Route path="members" element={<MembersTab />} />
                </Route>
            </Routes>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;