'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from 'react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { memberApi } from '@/lib/api';
import { MemberFormData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const createMemberSchema = z.object({
  name: z.string().min(1, 'Tên thành viên là bắt buộc').max(255),
  factor: z.number().min(0, 'Hệ số phải >= 0').max(10, 'Hệ số phải <= 10'),
  is_child: z.boolean(),
});

type CreateMemberFormData = z.infer<typeof createMemberSchema>;

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
  childFactor?: number;
}

export function CreateMemberModal({ 
  isOpen, 
  onClose, 
  tripId, 
  childFactor = 0.5 
}: CreateMemberModalProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      factor: 1.0,
      is_child: false,
    },
  });

  const isChild = watch('is_child');

  // Auto-adjust factor when child status changes
  const handleChildChange = (checked: boolean) => {
    setValue('is_child', checked);
    setValue('factor', checked ? childFactor : 1.0);
  };

  const createMemberMutation = useMutation(
    (data: MemberFormData & { trip_id: number }) => memberApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['members', tripId]);
        toast.success('Thêm thành viên thành công!');
        reset();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
      },
    }
  );

  const onSubmit = (data: CreateMemberFormData) => {
    const formData: MemberFormData & { trip_id: number } = {
      ...data,
      trip_id: tripId,
    };
    createMemberMutation.mutate(formData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('member.add')}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('member.name')}
          {...register('name')}
          error={errors.name?.message}
          placeholder="Nhập tên thành viên"
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_child"
            checked={isChild}
            onChange={(e) => handleChildChange(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_child" className="text-sm font-medium text-gray-700">
            {t('member.isChild')}
          </label>
        </div>

        <Input
          label={t('member.factor')}
          type="number"
          step="0.1"
          min="0"
          max="10"
          {...register('factor', { valueAsNumber: true })}
          error={errors.factor?.message}
          helperText={
            isChild 
              ? `Hệ số cho trẻ em (mặc định: ${childFactor})`
              : "Hệ số chia tiền (1.0 = người lớn tiêu chuẩn)"
          }
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Về hệ số chia tiền
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Hệ số 1.0: Người lớn tiêu chuẩn</li>
                  <li>Hệ số {childFactor}: Trẻ em (tự động khi chọn "Là trẻ em")</li>
                  <li>Hệ số cao hơn: Người tiêu nhiều hơn</li>
                  <li>Hệ số thấp hơn: Người tiêu ít hơn</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createMemberMutation.isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={createMemberMutation.isLoading}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
