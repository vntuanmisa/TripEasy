'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from 'react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { activityApi } from '@/lib/api';
import { ActivityFormData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Map } from '@/components/ui/Map';

const createActivitySchema = z.object({
  name: z.string().min(1, 'Tên hoạt động là bắt buộc').max(255),
  description: z.string().max(1000).optional(),
  location: z.string().max(255).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
});

type CreateActivityFormData = z.infer<typeof createActivitySchema>;

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
}

export function CreateActivityModal({ isOpen, onClose, tripId }: CreateActivityModalProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
  });

  const createActivityMutation = useMutation(
    (data: ActivityFormData & { trip_id: number }) => activityApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['activities', tripId]);
        toast.success('Tạo hoạt động thành công!');
        reset();
        setSelectedLocation(null);
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
      },
    }
  );

  const onSubmit = (data: CreateActivityFormData) => {
    const formData: ActivityFormData & { trip_id: number } = {
      ...data,
      trip_id: tripId,
      start_time: data.start_time ? new Date(data.start_time) : undefined,
      end_time: data.end_time ? new Date(data.end_time) : undefined,
      latitude: selectedLocation?.lat,
      longitude: selectedLocation?.lng,
    };
    createActivityMutation.mutate(formData);
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng, address: address || `${lat}, ${lng}` });
    setValue('location', address || `${lat}, ${lng}`);
    setShowMap(false);
    toast.success('Đã chọn vị trí thành công!');
  };

  const handleClose = () => {
    reset();
    setSelectedLocation(null);
    setShowMap(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('activity.add')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('activity.name')}
          {...register('name')}
          error={errors.name?.message}
          placeholder="Nhập tên hoạt động"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('activity.description')}
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Mô tả hoạt động (tùy chọn)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('activity.location')}
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap(true)}
            >
              Chọn từ bản đồ
            </Button>
          </div>
          <Input
            {...register('location')}
            error={errors.location?.message}
            placeholder="Nhập địa điểm hoặc chọn từ bản đồ"
            readOnly={!!selectedLocation}
          />
          {selectedLocation && (
            <p className="mt-1 text-xs text-green-600">
              ✓ Đã chọn: {selectedLocation.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('activity.startTime')}
            type="datetime-local"
            {...register('start_time')}
            error={errors.start_time?.message}
          />

          <Input
            label={t('activity.endTime')}
            type="datetime-local"
            {...register('end_time')}
            error={errors.end_time?.message}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createActivityMutation.isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={createActivityMutation.isLoading}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>

      {/* Map Modal */}
      <Modal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        title="Chọn vị trí trên bản đồ"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Nhấp vào bản đồ để chọn vị trí cho hoạt động
          </p>
          <Map
            height="500px"
            onLocationSelect={handleLocationSelect}
            markers={selectedLocation ? [{
              id: 'selected',
              position: [selectedLocation.lat, selectedLocation.lng],
              title: 'Vị trí đã chọn',
              description: selectedLocation.address
            }] : []}
          />
        </div>
      </Modal>
    </Modal>
  );
}
