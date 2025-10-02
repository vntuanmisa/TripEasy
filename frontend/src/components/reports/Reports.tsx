'use client';

import { useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { settlementApi, expenseApi } from '@/lib/api';
import { SettlementReport, TripStatistics } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Calculator,
  ArrowRight,
  DollarSign
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ReportsProps {
  tripId: number;
}

export function Reports({ tripId }: ReportsProps) {
  const t = useTranslations();

  // Get settlement report
  const { data: settlement, isLoading: settlementLoading } = useQuery<SettlementReport>(
    ['settlement', tripId],
    () => settlementApi.getReport(tripId).then(res => res.data),
    {
      staleTime: 2 * 60 * 1000,
    }
  );

  // Get statistics
  const { data: statistics, isLoading: statisticsLoading } = useQuery<TripStatistics>(
    ['statistics', tripId],
    () => expenseApi.getStatistics(tripId).then(res => res.data),
    {
      staleTime: 2 * 60 * 1000,
    }
  );

  if (settlementLoading || statisticsLoading) {
    return <LoadingState message="Đang tải báo cáo..." />;
  }

  // Prepare chart data
  const categoryChartData = {
    labels: statistics?.expenses_by_category.map(item => item.category) || [],
    datasets: [
      {
        data: statistics?.expenses_by_category.map(item => item.amount) || [],
        backgroundColor: [
          '#3b82f6', // blue
          '#10b981', // green
          '#f59e0b', // yellow
          '#ef4444', // red
          '#8b5cf6', // purple
          '#06b6d4', // cyan
        ],
        borderWidth: 0,
      },
    ],
  };

  const dayChartData = {
    labels: statistics?.expenses_by_day.map(item => 
      new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    ) || [],
    datasets: [
      {
        label: 'Chi tiêu (VND)',
        data: statistics?.expenses_by_day.map(item => item.amount) || [],
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  const memberChartData = {
    labels: statistics?.expenses_by_member.map(item => item.member_name) || [],
    datasets: [
      {
        label: 'Đã trả (VND)',
        data: statistics?.expenses_by_member.map(item => item.amount) || [],
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed?.y || context.parsed;
            return formatCurrency(value, settlement?.currency || 'VND');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value, settlement?.currency || 'VND');
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = statistics?.expenses_by_category[context.dataIndex]?.percentage || 0;
            return `${formatCurrency(value, settlement?.currency || 'VND')} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('report.title')}
        </h2>
        <p className="text-sm text-gray-600">
          Báo cáo chi tiết và phân tích chi tiêu
        </p>
      </div>

      {/* Summary Cards */}
      {settlement && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t('settlement.totalExpenses')}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(settlement.total_expenses, settlement.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {t('settlement.sharedExpenses')}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(settlement.total_shared_expenses, settlement.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calculator className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Giao dịch cần thực hiện
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {settlement.settlement_transactions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category - Pie Chart */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <span>{t('report.expensesByCategory')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '300px' }}>
                <Pie data={categoryChartData} options={pieOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Expenses by Day - Bar Chart */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span>{t('report.expensesByDay')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '300px' }}>
                <Bar data={dayChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Expenses by Member - Bar Chart */}
          <Card variant="outlined" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>{t('report.expensesByMember')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '300px' }}>
                <Bar data={memberChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settlement Table */}
      {settlement && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('settlement.title')}
          </h3>

          {/* Member Balances */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>{t('settlement.memberBalances')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành viên
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('member.totalPaid')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('member.totalOwed')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('member.balance')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {settlement.member_balances.map((member) => (
                      <tr key={member.member_id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.member_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(member.total_paid, settlement.currency)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(member.total_owed, settlement.currency)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`font-medium ${
                            member.balance > 0 
                              ? 'text-green-600' 
                              : member.balance < 0 
                                ? 'text-red-600' 
                                : 'text-gray-500'
                          }`}>
                            {formatCurrency(Math.abs(member.balance), settlement.currency)}
                            {member.balance > 0 && ' (nhận)'}
                            {member.balance < 0 && ' (trả)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Settlement Transactions */}
          {settlement.settlement_transactions.length > 0 && (
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>{t('settlement.transactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settlement.settlement_transactions.map((transaction, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {transaction.from_member_name}
                          </span>
                          <span className="text-gray-500 mx-2">trả</span>
                          <span className="font-medium text-gray-900">
                            {transaction.to_member_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(transaction.amount, settlement.currency)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {settlement.settlement_transactions.length === 0 && (
            <Card variant="outlined">
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('settlement.noTransactions')}
                </h3>
                <p className="text-gray-600">
                  Tất cả thành viên đã cân bằng chi tiêu!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
