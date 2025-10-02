'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from 'react-query';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Calendar } from 'lucide-react';
import { tripApi } from '@/lib/api';
import { Trip } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function JoinTripPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;
  const t = useTranslations();

  const joinTripMutation = useMutation(
    () => tripApi.getByInviteCode(inviteCode),
    {
      onSuccess: (response) => {
        const trip = response.data;
        toast.success(`Tham gia chuyến đi "${trip.name}" thành công!`);
        router.push(`/trips/${trip.id}`);
      },
      onError: (error: any) => {
        if (error.response?.status === 404) {
          toast.error('Mã mời không hợp lệ hoặc đã hết hạn');
        } else {
          toast.error('Có lỗi xảy ra khi tham gia chuyến đi');
        }
      },
    }
  );

  useEffect(() => {
    if (inviteCode && inviteCode.length >= 8) {
      joinTripMutation.mutate();
    }
  }, [inviteCode]);

  if (joinTripMutation.isLoading) {
    return <LoadingState message="Đang xử lý lời mời..." />;
  }

  if (joinTripMutation.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Lỗi tham gia chuyến đi</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Không thể tham gia chuyến đi với mã mời này.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Về trang chủ
              </Button>
              <Button 
                variant="outline"
                onClick={() => joinTripMutation.mutate()}
                className="w-full"
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state (will redirect automatically)
  if (joinTripMutation.data) {
    const trip = joinTripMutation.data.data;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Tham gia thành công!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {trip.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                {trip.start_date && (
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(trip.start_date)}
                      {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Tiền tệ: {trip.currency}</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">
              Đang chuyển hướng đến chuyến đi...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid invite code
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Mã mời không hợp lệ</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Mã mời "{inviteCode}" không hợp lệ hoặc đã hết hạn.
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
