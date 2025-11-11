'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Land, LandOwnershipStatus, LandPayload } from '@/lib/api/infrastructure';

interface LandFormValues {
  name: string;
  areaM2: string;
  ownershipStatus: LandOwnershipStatus;
  ownershipDocumentFile?: FileList;
  address?: string;
  notes?: string;
}

interface LandFormProps {
  initialData?: Land | null;
  onSubmit: (payload: LandPayload, documentFile?: File | null) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const OWNERSHIP_OPTIONS: { value: LandOwnershipStatus; label: string }[] = [
  { value: 'milik_sendiri', label: 'Milik Sendiri' },
  { value: 'sewa', label: 'Sewa' },
  { value: 'hibah', label: 'Hibah' },
  { value: 'lainnya', label: 'Lainnya' },
];

export function LandForm({ initialData, onSubmit, onCancel, isSubmitting, submitLabel }: LandFormProps) {
  const defaultValues: LandFormValues = useMemo(
    () => ({
      name: initialData?.name ?? '',
      areaM2: initialData?.areaM2 ? initialData.areaM2.toString() : '',
      ownershipStatus: initialData?.ownershipStatus ?? 'milik_sendiri',
      address: initialData?.address ?? '',
      notes: initialData?.notes ?? '',
    }),
    [initialData],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LandFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    const documentFile = values.ownershipDocumentFile?.[0] ?? null;
    const payload: LandPayload = {
      name: values.name.trim(),
      areaM2: Number(values.areaM2),
      ownershipStatus: values.ownershipStatus,
      address: values.address && values.address.trim() !== '' ? values.address.trim() : null,
      notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : null,
    };

    await onSubmit(payload, documentFile);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Nama Lahan"
          placeholder="Contoh: Lahan Utama"
          required
          {...register('name', { required: 'Nama lahan wajib diisi' })}
          error={errors.name?.message}
        />

        <Input
          label="Luas (m²)"
          type="number"
          min="0"
          step="0.01"
          placeholder="Contoh: 1200"
          required
          {...register('areaM2', {
            required: 'Luas lahan wajib diisi',
            validate: (value) => (Number(value) > 0 ? true : 'Luas harus lebih besar dari 0'),
          })}
          error={errors.areaM2?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Kepemilikan <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('ownershipStatus', { required: true })}
          >
            {OWNERSHIP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          label="Bukti Kepemilikan (PDF/JPG/PNG)"
          {...register('ownershipDocumentFile')}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Alamat / Lokasi"
            rows={2}
            placeholder="Tuliskan alamat lengkap atau titik koordinat"
            {...register('address')}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Catatan Tambahan"
            rows={2}
            placeholder="Catatan kondisi lahan, akses jalan, dsb."
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


