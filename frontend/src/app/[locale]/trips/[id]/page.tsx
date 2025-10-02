'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Receipt, 
  BarChart3,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { tripApi } from '@/lib/api';
import { Trip } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { ActivityList } from '@/components/activities/ActivityList';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { MemberList } from '@/components/members/MemberList';
import { Reports } from '@/components/reports/Reports';

type TabType = 'activities' | 'expenses' | 'members' | 'reports';

export default function TripDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const params = useParams();
  const tripId = parseInt(params.id as string);
  const t = useTranslations();

  const { data: trip, isLoading, error } = useQuery<Trip>(
    ['trip', tripId],
    () => tripApi.getById(tripId).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return <LoadingState message="Đang tải thông tin chuyến đi..." />;
  }

  if (error || !trip) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Không tìm thấy chuyến đi</p>
        <Link href="/">
          <Button className="mt-4">Quay về trang chủ</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      id: 'activities' as TabType,
      name: 'Lịch trình',
      icon: Calendar,
      count: null,
    },
    {
      id: 'expenses' as TabType,
      name: 'Chi phí',
      icon: Receipt,
      count: null,
    },
    {
      id: 'members' as TabType,
      name: 'Thành viên',
      icon: Users,
      count: null,
    },
    {
      id: 'reports' as TabType,
      name: 'Báo cáo',
      icon: BarChart3,
      count: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          </Link>
        </div>

        <Card variant="outlined">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {trip.name}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.destination}</span>
                  </div>
                  {trip.start_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(trip.start_date)}
                        {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Tiền tệ:</span>
                    <span>{trip.currency}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }
                    `}
                  />
                  <span>{tab.name}</span>
                  {tab.count !== null && (
                    <span
                      className={`
                        ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                        ${activeTab === tab.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'activities' && <ActivityList tripId={tripId} />}
        {activeTab === 'expenses' && <ExpenseList tripId={tripId} />}
        {activeTab === 'members' && <MemberList tripId={tripId} />}
        {activeTab === 'reports' && <Reports tripId={tripId} />}
      </div>
    </div>
  );
}
