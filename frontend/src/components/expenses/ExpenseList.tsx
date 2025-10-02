'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { 
  Receipt, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  User,
  Tag,
  DollarSign,
  Share,
  Lock
} from 'lucide-react';
import { expenseApi, memberApi } from '@/lib/api';
import { Expense, Member, ExpenseCategoryEnum } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { CreateExpenseModal } from './CreateExpenseModal';

interface ExpenseListProps {
  tripId: number;
}

export function ExpenseList({ tripId }: ExpenseListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    paid_by: '',
    is_shared: '',
    search: '',
  });

  const t = useTranslations();

  // Get members for filter dropdown
  const { data: members } = useQuery<Member[]>(
    ['members', tripId],
    () => memberApi.getByTripId(tripId).then(res => res.data)
  );

  // Get expenses with filters
  const { data: expenses, isLoading, error } = useQuery<Expense[]>(
    ['expenses', tripId, filters],
    () => {
      const queryFilters: any = {};
      if (filters.category) queryFilters.category = filters.category;
      if (filters.paid_by) queryFilters.paid_by = parseInt(filters.paid_by);
      if (filters.is_shared !== '') queryFilters.is_shared = filters.is_shared === 'true';
      
      return expenseApi.getByTripId(tripId, queryFilters).then(res => res.data);
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  if (isLoading) {
    return <LoadingState message="Đang tải chi phí..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải chi phí</p>
      </div>
    );
  }

  // Filter expenses by search term
  const filteredExpenses = expenses?.filter(expense => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return expense.description.toLowerCase().includes(searchTerm);
  }) || [];

  if (!expenses || expenses.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Receipt className="h-12 w-12" />}
          title={t('expense.noExpenses')}
          description={t('expense.noExpensesDesc')}
          action={{
            label: t('expense.add'),
            onClick: () => setShowCreateModal(true),
          }}
        />
        <CreateExpenseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          tripId={tripId}
        />
      </>
    );
  }

  const getMemberName = (memberId: number) => {
    return members?.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getCategoryLabel = (category: ExpenseCategoryEnum) => {
    const categoryMap = {
      [ExpenseCategoryEnum.FOOD]: t('expense.categories.food'),
      [ExpenseCategoryEnum.TRANSPORT]: t('expense.categories.transport'),
      [ExpenseCategoryEnum.ACCOMMODATION]: t('expense.categories.accommodation'),
      [ExpenseCategoryEnum.ENTERTAINMENT]: t('expense.categories.entertainment'),
      [ExpenseCategoryEnum.SHOPPING]: t('expense.categories.shopping'),
      [ExpenseCategoryEnum.OTHER]: t('expense.categories.other'),
    };
    return categoryMap[category] || category;
  };

  const categoryOptions = [
    { value: '', label: 'Tất cả danh mục' },
    { value: ExpenseCategoryEnum.FOOD, label: t('expense.categories.food') },
    { value: ExpenseCategoryEnum.TRANSPORT, label: t('expense.categories.transport') },
    { value: ExpenseCategoryEnum.ACCOMMODATION, label: t('expense.categories.accommodation') },
    { value: ExpenseCategoryEnum.ENTERTAINMENT, label: t('expense.categories.entertainment') },
    { value: ExpenseCategoryEnum.SHOPPING, label: t('expense.categories.shopping') },
    { value: ExpenseCategoryEnum.OTHER, label: t('expense.categories.other') },
  ];

  const memberOptions = [
    { value: '', label: 'Tất cả thành viên' },
    ...(members?.map(member => ({
      value: member.id.toString(),
      label: member.name
    })) || [])
  ];

  const sharedOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'true', label: 'Chi phí chung' },
    { value: 'false', label: 'Chi phí riêng' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý chi phí
          </h2>
          <p className="text-sm text-gray-600">
            {filteredExpenses.length} chi phí
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('expense.add')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card variant="outlined">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Tìm kiếm mô tả..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={<Search className="h-4 w-4" />}
              />

              <Select
                options={categoryOptions}
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              />

              <Select
                options={memberOptions}
                value={filters.paid_by}
                onChange={(e) => setFilters(prev => ({ ...prev, paid_by: e.target.value }))}
              />

              <Select
                options={sharedOptions}
                value={filters.is_shared}
                onChange={(e) => setFilters(prev => ({ ...prev, is_shared: e.target.value }))}
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ category: '', paid_by: '', is_shared: '', search: '' })}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} variant="outlined" className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {expense.description}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {expense.is_shared ? (
                        <Share className="h-4 w-4 text-green-500" title="Chi phí chung" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" title="Chi phí riêng" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
                        {expense.exchange_rate !== 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (≈ {formatCurrency(expense.amount * expense.exchange_rate, 'VND')})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{getMemberName(expense.paid_by)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{getCategoryLabel(expense.category)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(parseISO(expense.expense_date), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <Button variant="ghost" size="sm">
                    Sửa
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    Xóa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && expenses && expenses.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không tìm thấy chi phí nào phù hợp với bộ lọc</p>
        </div>
      )}

      {/* Create Expense Modal */}
      <CreateExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        tripId={tripId}
      />
    </div>
  );
}
