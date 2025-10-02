'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from 'react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { tripApi } from '@/lib/api';
import { CurrencyEnum, TripFormData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const createTripSchema = z.object({
  name: z.string().min(1, 'Tên chuyến đi là bắt buộc').max(255),
  destination: z.string().min(1, 'Điểm đến là bắt buộc').max(255),
  departure_location: z.string().max(255).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  currency: z.nativeEnum(CurrencyEnum),
  child_factor: z.number().min(0).max(1),
  rounding_rule: z.number().min(1),
});

type CreateTripFormData = z.infer<typeof createTripSchema>;

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTripModal({ isOpen, onClose }: CreateTripModalProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      currency: CurrencyEnum.VND,
      child_factor: 0.5,
      rounding_rule: 1000,
    },
  });

  const createTripMutation = useMutation(
    (data: TripFormData) => tripApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trips');
        toast.success('Tạo chuyến đi thành công!');
        reset();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
      },
    }
  );

  const onSubmit = (data: CreateTripFormData) => {
    const formData: TripFormData = {
      ...data,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    };
    createTripMutation.mutate(formData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('trip.create')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('trip.name')}
            {...register('name')}
            error={errors.name?.message}
            placeholder="Nhập tên chuyến đi"
          />

          <Input
            label={t('trip.destination')}
            {...register('destination')}
            error={errors.destination?.message}
            placeholder="Nhập điểm đến"
          />
        </div>

        <Input
          label={t('trip.departure')}
          {...register('departure_location')}
          error={errors.departure_location?.message}
          placeholder="Nhập điểm khởi hành (tùy chọn)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('trip.startDate')}
            type="date"
            {...register('start_date')}
            error={errors.start_date?.message}
          />

          <Input
            label={t('trip.endDate')}
            type="date"
            {...register('end_date')}
            error={errors.end_date?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('trip.currency')}
            </label>
            <select
              {...register('currency')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value={CurrencyEnum.VND}>VND - Việt Nam Đồng</option>
              <option value={CurrencyEnum.USD}>USD - US Dollar</option>
              <option value={CurrencyEnum.EUR}>EUR - Euro</option>
              <option value={CurrencyEnum.JPY}>JPY - Japanese Yen</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>

          <Input
            label={t('trip.childFactor')}
            type="number"
            step="0.1"
            min="0"
            max="1"
            {...register('child_factor', { valueAsNumber: true })}
            error={errors.child_factor?.message}
            helperText="Hệ số chi tiêu cho trẻ em (0-1)"
          />

          <Input
            label={t('trip.roundingRule')}
            type="number"
            min="1"
            {...register('rounding_rule', { valueAsNumber: true })}
            error={errors.rounding_rule?.message}
            helperText="Làm tròn đến (VND)"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createTripMutation.isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={createTripMutation.isLoading}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
