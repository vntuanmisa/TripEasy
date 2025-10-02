'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { tripApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface JoinTripFormData {
  inviteCode: string;
}

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinTripModal({ isOpen, onClose }: JoinTripModalProps) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinTripFormData>();

  const joinTripMutation = useMutation(
    (inviteCode: string) => tripApi.getByInviteCode(inviteCode),
    {
      onSuccess: (response) => {
        const trip = response.data;
        queryClient.invalidateQueries('trips');
        toast.success(`Tham gia chuyến đi "${trip.name}" thành công!`);
        reset();
        onClose();
        router.push(`/trips/${trip.id}`);
      },
      onError: (error: any) => {
        if (error.response?.status === 404) {
          toast.error('Mã mời không hợp lệ');
        } else {
          toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
        }
      },
    }
  );

  const onSubmit = (data: JoinTripFormData) => {
    joinTripMutation.mutate(data.inviteCode.trim().toUpperCase());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('trip.joinTrip')}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('trip.enterInviteCode')}
          {...register('inviteCode', { 
            required: 'Mã mời là bắt buộc',
            minLength: { value: 8, message: 'Mã mời phải có ít nhất 8 ký tự' }
          })}
          error={errors.inviteCode?.message}
          placeholder="Nhập mã mời (ví dụ: ABC12345)"
          className="uppercase"
          maxLength={50}
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
                Thông tin về mã mời
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Mã mời được tạo tự động khi tạo chuyến đi mới. 
                  Hãy yêu cầu người tạo chuyến đi chia sẻ mã mời với bạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={joinTripMutation.isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={joinTripMutation.isLoading}
          >
            Tham gia
          </Button>
        </div>
      </form>
    </Modal>
  );
}
