'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Building, BuildingPayload, Land } from '@/lib/api/infrastructure';

interface BuildingFormValues {
  landId: string;
  name: string;
  floorCount: string;
  lengthM: string;
  widthM: string;
  builtYear: string;
  notes?: string;
}

interface BuildingFormProps {
  lands: Land[];
  initialData?: Building | null;
  onSubmit: (payload: BuildingPayload) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function BuildingForm({
  lands,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: BuildingFormProps) {
  const defaultValues: BuildingFormValues = useMemo(
    () => ({
      landId: initialData?.landId ? initialData.landId.toString() : lands[0]?.id?.toString() ?? '',
      name: initialData?.name ?? '',
      floorCount: initialData?.floorCount?.toString() ?? '1',
      lengthM: initialData?.lengthM?.toString() ?? '',
      widthM: initialData?.widthM?.toString() ?? '',
      builtYear: initialData?.builtYear?.toString() ?? '',
      notes: initialData?.notes ?? '',
    }),
    [initialData, lands],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuildingFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    const payload: BuildingPayload = {
      landId: Number(values.landId),
      name: values.name.trim(),
      floorCount: Number(values.floorCount),
      lengthM: Number(values.lengthM),
      widthM: Number(values.widthM),
      builtYear: Number(values.builtYear),
      notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : null,
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Berdiri di Lahan <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('landId', {
              required: 'Pilih lahan tempat gedung berdiri',
              validate: (value) => (Number(value) > 0 ? true : 'Lahan wajib dipilih'),
            })}
          >
            <option value="">Pilih lahan</option>
            {lands.map((land) => (
              <option key={land.id} value={land.id}>
                {land.name}
              </option>
            ))}
          </select>
          {errors.landId && <p className="mt-1 text-sm text-red-600">{errors.landId.message}</p>}
        </div>

        <Input
          label="Nama Gedung"
          placeholder="Contoh: Gedung A"
          required
          {...register('name', { required: 'Nama gedung wajib diisi' })}
          error={errors.name?.message}
        />

        <Input
          label="Jumlah Lantai"
          type="number"
          min="1"
          max="100"
          required
          {...register('floorCount', {
            required: 'Jumlah lantai wajib diisi',
            validate: (value) => (Number(value) >= 1 ? true : 'Jumlah lantai minimal 1'),
          })}
          error={errors.floorCount?.message}
        />

        <Input
          label="Panjang (m)"
          type="number"
          step="0.01"
          min="0"
          required
          {...register('lengthM', {
            required: 'Ukuran panjang wajib diisi',
            validate: (value) => (Number(value) > 0 ? true : 'Panjang harus lebih besar dari 0'),
          })}
          error={errors.lengthM?.message}
        />

        <Input
          label="Lebar (m)"
          type="number"
          step="0.01"
          min="0"
          required
          {...register('widthM', {
            required: 'Ukuran lebar wajib diisi',
            validate: (value) => (Number(value) > 0 ? true : 'Lebar harus lebih besar dari 0'),
          })}
          error={errors.widthM?.message}
        />

        <Input
          label="Tahun Dibangun"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          required
          {...register('builtYear', {
            required: 'Tahun dibangun wajib diisi',
            validate: (value) => {
              const num = Number(value);
              const currentYear = new Date().getFullYear() + 1;
              if (Number.isNaN(num)) return 'Gunakan angka yang valid';
              if (num < 1900) return 'Tahun minimal 1900';
              if (num > currentYear) return `Tahun tidak boleh melebihi ${currentYear}`;
              return true;
            },
          })}
          error={errors.builtYear?.message}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Catatan Tambahan"
            rows={2}
            placeholder="Informasi tambahan seperti kondisi struktur, renovasi terakhir, dsb."
            {...register('notes')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel ?? 'Simpan'}
        </Button>
      </div>
    </form>
  );
}


