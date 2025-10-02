'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { expenseApi, memberApi } from '@/lib/api';
import { ExpenseFormData, CurrencyEnum, ExpenseCategoryEnum } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const createExpenseSchema = z.object({
  description: z.string().min(1, 'Mô tả chi phí là bắt buộc').max(255),
  amount: z.number().min(0.01, 'Số tiền phải lớn hơn 0'),
  currency: z.nativeEnum(CurrencyEnum),
  exchange_rate: z.number().min(0.01, 'Tỷ giá phải lớn hơn 0'),
  category: z.nativeEnum(ExpenseCategoryEnum),
  paid_by: z.number().min(1, 'Vui lòng chọn người trả'),
  is_shared: z.boolean(),
  expense_date: z.string().optional(),
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
}

export function CreateExpenseModal({ isOpen, onClose, tripId }: CreateExpenseModalProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  // Get members for the paid_by dropdown
  const { data: members } = useQuery(
    ['members', tripId],
    () => memberApi.getByTripId(tripId).then(res => res.data),
    { enabled: isOpen }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      currency: CurrencyEnum.VND,
      exchange_rate: 1.0,
      category: ExpenseCategoryEnum.OTHER,
      is_shared: true,
      expense_date: new Date().toISOString().split('T')[0],
    },
  });

  const currency = watch('currency');

  const createExpenseMutation = useMutation(
    (data: ExpenseFormData & { trip_id: number }) => expenseApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses', tripId]);
        queryClient.invalidateQueries(['settlement', tripId]);
        toast.success('Thêm chi phí thành công!');
        reset();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
      },
    }
  );

  const onSubmit = (data: CreateExpenseFormData) => {
    const formData: ExpenseFormData & { trip_id: number } = {
      ...data,
      trip_id: tripId,
      expense_date: data.expense_date ? new Date(data.expense_date) : new Date(),
    };
    createExpenseMutation.mutate(formData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const categoryOptions = [
    { value: ExpenseCategoryEnum.FOOD, label: t('expense.categories.food') },
    { value: ExpenseCategoryEnum.TRANSPORT, label: t('expense.categories.transport') },
    { value: ExpenseCategoryEnum.ACCOMMODATION, label: t('expense.categories.accommodation') },
    { value: ExpenseCategoryEnum.ENTERTAINMENT, label: t('expense.categories.entertainment') },
    { value: ExpenseCategoryEnum.SHOPPING, label: t('expense.categories.shopping') },
    { value: ExpenseCategoryEnum.OTHER, label: t('expense.categories.other') },
  ];

  const currencyOptions = [
    { value: CurrencyEnum.VND, label: 'VND - Việt Nam Đồng' },
    { value: CurrencyEnum.USD, label: 'USD - US Dollar' },
    { value: CurrencyEnum.EUR, label: 'EUR - Euro' },
    { value: CurrencyEnum.JPY, label: 'JPY - Japanese Yen' },
  ];

  const memberOptions = members?.map(member => ({
    value: member.id,
    label: member.name
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('expense.add')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('expense.description')}
          {...register('description')}
          error={errors.description?.message}
          placeholder="Nhập mô tả chi phí"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('expense.amount')}
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
            placeholder="0.00"
          />

          <Select
            label={t('expense.currency')}
            {...register('currency')}
            options={currencyOptions}
            error={errors.currency?.message}
          />
        </div>

        {currency !== CurrencyEnum.VND && (
          <Input
            label={t('expense.exchangeRate')}
            type="number"
            step="0.0001"
            min="0"
            {...register('exchange_rate', { valueAsNumber: true })}
            error={errors.exchange_rate?.message}
            helperText={`Tỷ giá quy đổi về VND (1 ${currency} = ? VND)`}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('expense.category')}
            {...register('category')}
            options={categoryOptions}
            error={errors.category?.message}
          />

          <Select
            label={t('expense.paidBy')}
            {...register('paid_by', { valueAsNumber: true })}
            options={[
              { value: '', label: 'Chọn người trả' },
              ...memberOptions
            ]}
            error={errors.paid_by?.message}
          />
        </div>

        <Input
          label={t('expense.expenseDate')}
          type="date"
          {...register('expense_date')}
          error={errors.expense_date?.message}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_shared"
            {...register('is_shared')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_shared" className="text-sm font-medium text-gray-700">
            {t('expense.isShared')} (chi phí chung)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createExpenseMutation.isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={createExpenseMutation.isLoading}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
