'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import { format, parseISO, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';
import { activityApi } from '@/lib/api';
import { Activity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { CreateActivityModal } from './CreateActivityModal';

interface ActivityListProps {
  tripId: number;
}

export function ActivityList({ tripId }: ActivityListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const t = useTranslations();

  const { data: activities, isLoading, error } = useQuery<Activity[]>(
    ['activities', tripId],
    () => activityApi.getByTripId(tripId).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return <LoadingState message="Đang tải hoạt động..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải hoạt động</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title={t('activity.noActivities')}
          description={t('activity.noActivitiesDesc')}
          action={{
            label: t('activity.add'),
            onClick: () => setShowCreateModal(true),
          }}
        />
        <CreateActivityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          tripId={tripId}
        />
      </>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    if (!activity.start_time) {
      const key = 'no-date';
      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
      return groups;
    }

    const date = format(parseISO(activity.start_time), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  // Sort activities within each day by start time
  Object.keys(groupedActivities).forEach(date => {
    groupedActivities[date].sort((a, b) => {
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  });

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === 'no-date') return 'Chưa xác định thời gian';
    try {
      return format(parseISO(dateStr), 'EEEE, dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Lịch trình hoạt động
        </h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('activity.add')}
        </Button>
      </div>

      {/* Activities grouped by date */}
      <div className="space-y-4">
        {Object.entries(groupedActivities)
          .sort(([a], [b]) => {
            if (a === 'no-date') return 1;
            if (b === 'no-date') return -1;
            return a.localeCompare(b);
          })
          .map(([date, dayActivities]) => {
            const isExpanded = expandedDays.has(date);
            
            return (
              <Card key={date} variant="outlined">
                <CardContent className="p-0">
                  {/* Date Header */}
                  <button
                    onClick={() => toggleDay(date)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">
                          {formatDateHeader(date)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {dayActivities.length} hoạt động
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                    </div>
                  </button>

                  {/* Activities List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {dayActivities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className={`p-4 ${
                            index < dayActivities.length - 1 
                              ? 'border-b border-gray-50' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {activity.name}
                                </h4>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
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

                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {activity.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                {activity.start_time && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {format(parseISO(activity.start_time), 'HH:mm')}
                                      {activity.end_time && 
                                        ` - ${format(parseISO(activity.end_time), 'HH:mm')}`
                                      }
                                    </span>
                                  </div>
                                )}

                                {activity.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate max-w-xs">
                                      {activity.location}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Create Activity Modal */}
      <CreateActivityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        tripId={tripId}
      />
    </div>
  );
}
