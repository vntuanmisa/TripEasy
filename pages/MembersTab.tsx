
import React, { useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trip, Member } from '../types';
import Modal from '../components/Modal';
import { LanguageContext } from '../LanguageContext';

interface OutletContext {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
}

const MembersTab: React.FC = () => {
    const { trip, updateTrip } = useOutletContext<OutletContext>();
    const { t } = useContext(LanguageContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const handleOpenModal = (member: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
    };

    const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingMember) return;
        const { name, value } = e.target;
        setEditingMember({ ...editingMember, [name]: name === 'coefficient' ? parseFloat(value) : value });
    };

    const handleSaveMember = () => {
        if (!editingMember) return;
        const updatedMembers = trip.members.map(m => m.id === editingMember.id ? editingMember : m);
        updateTrip({ ...trip, members: updatedMembers });
        handleCloseModal();
    };
    
    const handleAddMember = () => {
        const newMember: Member = {
            id: new Date().toISOString(),
            name: `${t('new_member')} ${trip.members.length + 1}`,
            coefficient: 1.0,
        };
        updateTrip({ ...trip, members: [...trip.members, newMember] });
    };

    const handleDeleteMember = (memberId: string) => {
        if (window.confirm(t('confirm_delete_member'))) {
            const updatedMembers = trip.members.filter(m => m.id !== memberId);
            updateTrip({ ...trip, members: updatedMembers });
        }
    };

    const copyInviteInfo = () => {
        const inviteText = t('invite_text', { tripName: trip.name, tripId: trip.id });
        navigator.clipboard.writeText(inviteText)
            .then(() => alert(t('invite_copied')))
            .catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">{t('member_list')}</h3>
                <div className="space-y-3">
                    {trip.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <div>
                                <p className="font-semibold text-dark">{member.name}</p>
                                <p className="text-xs text-secondary">{t('coefficient')}: {member.coefficient}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => handleOpenModal(member)} className="text-sm text-primary hover:underline">{t('edit')}</button>
                                <button onClick={() => handleDeleteMember(member.id)} className="text-sm text-red-500 hover:underline">{t('delete')}</button>
                            </div>
                        </div>
                    ))}
                </div>
                 <button onClick={handleAddMember} className="w-full mt-4 bg-blue-100 text-primary font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
                    <i className="fas fa-plus mr-2"></i>{t('add_member')}
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-bold text-lg mb-2">{t('invite_friends')}</h3>
                <p className="text-secondary text-sm mb-4">{t('invite_friends_desc')}</p>
                <div className="bg-gray-100 p-3 rounded-lg inline-block font-mono text-dark mb-4">
                    {trip.id}
                </div>
                <br/>
                <button onClick={copyInviteInfo} className="bg-primary text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-blue-600 transition-colors">
                    <i className="fas fa-copy mr-2"></i>{t('copy_invite_info')}
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={t('edit_member')}>
                {editingMember && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
                            <input type="text" id="name" name="name" value={editingMember.name} onChange={handleMemberChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
                        </div>
                        <div>
                            <label htmlFor="coefficient" className="block text-sm font-medium text-gray-700">{t('child_coeff')}</label>
                            <input type="number" id="coefficient" name="coefficient" value={editingMember.coefficient} onChange={handleMemberChange} step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
                        </div>
                        <button onClick={handleSaveMember} className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600">{t('save')}</button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MembersTab;
