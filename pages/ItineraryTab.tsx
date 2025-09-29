import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trip, Activity } from '../types';
import Modal from '../components/Modal';
import { LanguageContext } from '../LanguageContext';
import LocationInput from '../components/LocationInput';

interface OutletContext {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
}

const ItineraryTab: React.FC = () => {
    const { trip, updateTrip } = useOutletContext<OutletContext>();
    const { t } = useContext(LanguageContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState<Partial<Activity>>({});
    const [isEditMode, setIsEditMode] = useState(false);
    
    const groupedItinerary = useMemo(() => {
        return trip.itinerary.reduce<Record<string, Activity[]>>((acc, activity) => {
            const date = activity.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(activity);
            return acc;
        }, {});
    }, [trip.itinerary]);
    
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Default new date groups to be expanded
        setExpandedDates(prev => {
            const newState = {...prev};
            Object.keys(groupedItinerary).forEach(date => {
                if (newState[date] === undefined) {
                    newState[date] = true; 
                }
            });
            return newState;
        });
    }, [groupedItinerary]);


    const handleToggleDate = (date: string) => {
        setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
    };

    const handleOpenModal = (activity: Activity | null = null) => {
        if (activity) {
            setCurrentActivity(activity);
            setIsEditMode(true);
        } else {
            setCurrentActivity({
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
            });
            setIsEditMode(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentActivity(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleLocationChange = (value: string) => {
        setCurrentActivity(prev => ({ ...prev, location: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItinerary = isEditMode
            ? trip.itinerary.map(item => item.id === currentActivity.id ? (currentActivity as Activity) : item)
            : [...trip.itinerary, { ...currentActivity, id: new Date().toISOString() } as Activity];
        
        newItinerary.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        updateTrip({ ...trip, itinerary: newItinerary });
        handleCloseModal();
    };
    
    const handleDelete = (activityId: string) => {
        if(window.confirm(t('confirm_delete_activity'))) {
            updateTrip({ ...trip, itinerary: trip.itinerary.filter(item => item.id !== activityId) });
        }
    }

    return (
        <div>
            {Object.keys(groupedItinerary).length > 0 ? (
                Object.entries(groupedItinerary).map(([date, activities]) => (
                    <div key={date} className="mb-6">
                        <button onClick={() => handleToggleDate(date)} className="w-full text-left bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg text-primary">{new Date(date).toLocaleDateString(t('locale'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            <i className={`fa-solid fa-chevron-down transition-transform ${expandedDates[date] ? 'rotate-180' : ''}`}></i>
                        </button>
                        {expandedDates[date] && (
                             <div className="pl-4 border-l-2 border-primary ml-4">
                                {activities.map((item) => (
                                    <div key={item.id} className="relative bg-white p-4 rounded-lg shadow-sm mb-4">
                                        <div className="absolute -left-6 top-4 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-dark">{item.activity}</p>
                                                <p className="text-sm text-secondary">{item.time}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleOpenModal(item)} className="text-gray-400 hover:text-primary"><i className="fas fa-pencil-alt"></i></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2"><i className="fas fa-map-marker-alt mr-2 text-primary"></i>{item.location}</p>
                                        {item.notes && <p className="text-sm bg-gray-100 p-2 mt-2 rounded-md">{item.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-secondary">{t('no_activities_planned')}</p>
                </div>
            )}
            
            <button onClick={() => handleOpenModal()} className="fixed bottom-20 right-6 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 z-20" aria-label={t('add_activity')}>
                <i className="fa-solid fa-plus text-2xl"></i>
            </button>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={t(isEditMode ? "edit_activity" : "add_activity")}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="activity" placeholder={t('activity_placeholder')} value={currentActivity.activity || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" name="date" value={currentActivity.date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
                        <input type="time" name="time" value={currentActivity.time || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <LocationInput placeholder={t('location')} value={currentActivity.location || ''} onChange={handleLocationChange} />
                    <textarea name="notes" placeholder={t('notes')} value={currentActivity.notes || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" rows={3}></textarea>
                    <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600">
                        {t(isEditMode ? "save_changes" : "add_activity")}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ItineraryTab;