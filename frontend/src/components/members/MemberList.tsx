'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  Plus, 
  Share, 
  Copy,
  UserCheck,
  Baby,
  Edit,
  Trash2
} from 'lucide-react';
import { memberApi, tripApi } from '@/lib/api';
import { Member, Trip } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { copyToClipboard, generateInviteUrl } from '@/lib/utils';
import { CreateMemberModal } from './CreateMemberModal';
import toast from 'react-hot-toast';

interface MemberListProps {
  tripId: number;
}

export function MemberList({ tripId }: MemberListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const t = useTranslations();

  // Get trip info for invite code and child factor
  const { data: trip } = useQuery<Trip>(
    ['trip', tripId],
    () => tripApi.getById(tripId).then(res => res.data)
  );

  // Get members
  const { data: members, isLoading, error } = useQuery<Member[]>(
    ['members', tripId],
    () => memberApi.getByTripId(tripId).then(res => res.data),
    {
      staleTime: 2 * 60 * 1000,
    }
  );

  if (isLoading) {
    return <LoadingState message="Đang tải thành viên..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải thành viên</p>
      </div>
    );
  }

  const handleCopyInviteCode = async () => {
    if (!trip?.invite_code) return;
    
    try {
      await copyToClipboard(trip.invite_code);
      toast.success('Đã sao chép mã mời!');
    } catch (error) {
      toast.error('Không thể sao chép mã mời');
    }
  };

  const handleCopyInviteUrl = async () => {
    if (!trip?.invite_code) return;
    
    try {
      const url = generateInviteUrl(trip.invite_code);
      await copyToClipboard(url);
      toast.success('Đã sao chép link mời!');
    } catch (error) {
      toast.error('Không thể sao chép link mời');
    }
  };

  const handleShareInvite = async () => {
    if (!trip?.invite_code) return;

    const shareData = {
      title: `Tham gia chuyến đi: ${trip.name}`,
      text: `Bạn được mời tham gia chuyến đi "${trip.name}". Sử dụng mã mời: ${trip.invite_code}`,
      url: generateInviteUrl(trip.invite_code),
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying
      handleCopyInviteUrl();
    }
  };

  if (!members || members.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Chưa có thành viên nào"
          description="Thêm thành viên đầu tiên cho chuyến đi của bạn"
          action={{
            label: t('member.add'),
            onClick: () => setShowCreateModal(true),
          }}
        />
        <CreateMemberModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          tripId={tripId}
          childFactor={trip?.child_factor}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý thành viên
          </h2>
          <p className="text-sm text-gray-600">
            {members.length} thành viên
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('member.add')}
        </Button>
      </div>

      {/* Invite Section */}
      {trip && (
        <Card variant="outlined">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share className="h-5 w-5 text-primary-600" />
              <span>Mời thành viên mới</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã mời chuyến đi
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-semibold text-center">
                    {trip.invite_code}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInviteCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyInviteUrl}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép link
                </Button>
                <Button
                  onClick={handleShareInvite}
                  className="flex-1"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Chia sẻ mã mời hoặc link này với bạn bè để họ tham gia chuyến đi
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id} variant="outlined" className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {member.is_child ? (
                      <Baby className="h-5 w-5 text-pink-500" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {member.is_child ? 'Trẻ em' : 'Người lớn'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hệ số chia tiền:</span>
                  <span className="font-medium text-gray-900">
                    {member.factor}x
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tham gia:</span>
                  <span className="text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {member.factor !== 1.0 && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    {member.factor < 1.0 
                      ? `Sẽ trả ít hơn ${((1 - member.factor) * 100).toFixed(0)}% so với người lớn`
                      : `Sẽ trả nhiều hơn ${((member.factor - 1) * 100).toFixed(0)}% so với người lớn`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Member Modal */}
      <CreateMemberModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        tripId={tripId}
        childFactor={trip?.child_factor}
      />
    </div>
  );
}
