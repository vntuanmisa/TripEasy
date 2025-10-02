'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import { Plus, MapPin, Users, Receipt, Calendar } from 'lucide-react';
import { tripApi } from '@/lib/api';
import { Trip } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatCurrency } from '@/lib/utils';
import { TripCard } from '@/components/trips/TripCard';
import { CreateTripModal } from '@/components/trips/CreateTripModal';
import { JoinTripModal } from '@/components/trips/JoinTripModal';

export function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const t = useTranslations();

  const { data: trips, isLoading, error } = useQuery<Trip[]>(
    'trips',
    () => tripApi.getAll().then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('common.error')}</p>
      </div>
    );
  }

  const upcomingTrips = trips?.filter(trip => {
    if (!trip.start_date) return true;
    return new Date(trip.start_date) > new Date();
  }) || [];

  const ongoingTrips = trips?.filter(trip => {
    if (!trip.start_date || !trip.end_date) return false;
    const now = new Date();
    return new Date(trip.start_date) <= now && new Date(trip.end_date) >= now;
  }) || [];

  const completedTrips = trips?.filter(trip => {
    if (!trip.end_date) return false;
    return new Date(trip.end_date) < new Date();
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('nav.dashboard')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý tất cả chuyến đi của bạn
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowJoinModal(true)}
          >
            {t('trip.joinTrip')}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('trip.create')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {trips && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Tổng chuyến đi</p>
                  <p className="text-2xl font-semibold text-gray-900">{trips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Sắp tới</p>
                  <p className="text-2xl font-semibold text-gray-900">{upcomingTrips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Đang diễn ra</p>
                  <p className="text-2xl font-semibold text-gray-900">{ongoingTrips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedTrips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trips List */}
      {!trips || trips.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          title={t('trip.noTrips')}
          description={t('trip.noTripsDesc')}
          action={{
            label: t('trip.create'),
            onClick: () => setShowCreateModal(true),
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Ongoing Trips */}
          {ongoingTrips.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chuyến đi đang diễn ra
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ongoingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} status="ongoing" />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chuyến đi sắp tới
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} status="upcoming" />
                ))}
              </div>
            </div>
          )}

          {/* Completed Trips */}
          {completedTrips.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chuyến đi đã hoàn thành
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} status="completed" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <JoinTripModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
}
