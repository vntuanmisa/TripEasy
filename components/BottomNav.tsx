
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';

interface BottomNavProps {
    tripId: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ tripId }) => {
    const { t } = useContext(LanguageContext);

    const navItems = [
        { path: 'itinerary', icon: 'fa-route', labelKey: 'itinerary' },
        { path: 'expenses', icon: 'fa-wallet', labelKey: 'expenses' },
        { path: 'report', icon: 'fa-chart-pie', labelKey: 'report' },
        { path: 'members', icon: 'fa-users', labelKey: 'members' },
    ];

    const navLinkClasses = "flex flex-col items-center justify-center w-full pt-2 pb-1 text-secondary transition-colors duration-200";
    const activeLinkClasses = "text-primary";

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-screen-md mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-gray-200">
            <div className="flex justify-around h-16">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={`/trip/${tripId}/${item.path}`}
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <i className={`fa-solid ${item.icon} text-xl`}></i>
                        <span className="text-xs mt-1">{t(item.labelKey)}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
