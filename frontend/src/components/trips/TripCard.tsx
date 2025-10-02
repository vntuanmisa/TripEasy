'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Calendar, Users, MoreVertical } from 'lucide-react';
import { Trip } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export function TripCard({ trip, status }: TripCardProps) {
  const t = useTranslations();

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    upcoming: 'Sắp tới',
    ongoing: 'Đang diễn ra',
    completed: 'Đã hoàn thành',
  };

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card variant="outlined" className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                {trip.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">{trip.destination}</span>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>

          <div className="space-y-2">
            {trip.start_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {formatDate(trip.start_date)}
                  {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>Mã: {trip.invite_code}</span>
              </div>
              <div className="text-sm font-medium text-primary-600">
                {trip.currency}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Tạo: {formatDate(trip.created_at)}</span>
              <MoreVertical className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
