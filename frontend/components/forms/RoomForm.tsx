'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Building, Room, RoomCondition, RoomPayload, RoomUsageType } from '@/lib/api/infrastructure';

interface RoomFormValues {
  buildingId: string;
  name: string;
  usageType: RoomUsageType;
  areaM2: string;
  condition: RoomCondition;
  floorNumber: string;
  capacity?: string;
  notes?: string;
}

interface RoomFormProps {
  buildings: Building[];
  initialData?: Room | null;
  onSubmit: (payload: RoomPayload) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const USAGE_OPTIONS: { value: RoomUsageType; label: string }[] = [
  { value: 'ruang_kelas', label: 'Ruang Kelas' },
  { value: 'kantor', label: 'Kantor' },
  { value: 'laboratorium', label: 'Laboratorium' },
  { value: 'perpustakaan', label: 'Perpustakaan' },
  { value: 'gudang', label: 'Gudang' },
  { value: 'aula', label: 'Ruang Serbaguna / Aula' },
  { value: 'lainnya', label: 'Lainnya' },
];

const CONDITION_OPTIONS: { value: RoomCondition; label: string; description: string }[] = [
  { value: 'baik', label: 'Baik', description: 'Struktur utuh, instalasi berfungsi, cat terawat.' },
  { value: 'rusak_ringan', label: 'Rusak Ringan', description: 'Kerusakan minor (cat, plafon) tidak mengganggu kegiatan.' },
  { value: 'rusak_sedang', label: 'Rusak Sedang', description: 'Butuh perbaikan sebagian (instalasi, struktur ringan).' },
  { value: 'rusak_berat', label: 'Rusak Berat', description: 'Kerusakan mayor mengganggu fungsi utama ruang.' },
  { value: 'rusak_total', label: 'Rusak Total', description: 'Tidak layak pakai, struktur utama gagal.' },
];

export function RoomForm({ buildings, initialData, onSubmit, onCancel, isSubmitting, submitLabel }: RoomFormProps) {
  const defaultValues: RoomFormValues = useMemo(
    () => ({
      buildingId: initialData?.buildingId ? initialData.buildingId.toString() : buildings[0]?.id?.toString() ?? '',
      name: initialData?.name ?? '',
      usageType: initialData?.usageType ?? 'ruang_kelas',
      areaM2: initialData?.areaM2?.toString() ?? '',
      condition: initialData?.condition ?? 'baik',
      floorNumber: initialData?.floorNumber?.toString() ?? '1',
      capacity: initialData?.capacity !== null && initialData?.capacity !== undefined ? String(initialData.capacity) : '',
      notes: initialData?.notes ?? '',
    }),
    [initialData, buildings],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RoomFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedBuildingId = watch('buildingId');
  const selectedBuilding = buildings.find((building) => building.id === Number(selectedBuildingId));

  const handleFormSubmit = handleSubmit(async (values) => {
    const payload: RoomPayload = {
      buildingId: Number(values.buildingId),
      name: values.name.trim(),
      usageType: values.usageType,
      areaM2: Number(values.areaM2),
      condition: values.condition,
      floorNumber: Number(values.floorNumber),
      capacity:
        values.capacity && values.capacity.trim() !== '' ? Number(values.capacity.trim()) : undefined,
      notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : null,
    };

    await onSubmit(payload);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi Gedung <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('buildingId', {
              required: 'Pilih gedung tempat ruangan berada',
              validate: (value) => (Number(value) > 0 ? true : 'Gedung wajib dipilih'),
            })}
          >
            <option value="">Pilih gedung</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          {errors.buildingId && <p className="mt-1 text-sm text-red-600">{errors.buildingId.message}</p>}
        </div>

        <Input
          label="Nama Ruangan"
          placeholder="Contoh: Ruang Kelas 7A"
          required
          {...register('name', { required: 'Nama ruangan wajib diisi' })}
          error={errors.name?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Digunakan untuk <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('usageType', { required: true })}
          >
            {USAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Luas (m²)"
          type="number"
          step="0.01"
          min="0"
          required
          {...register('areaM2', {
            required: 'Luas ruangan wajib diisi',
            validate: (value) => (Number(value) > 0 ? true : 'Luas harus lebih besar dari 0'),
          })}
          error={errors.areaM2?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kondisi Ruang <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('condition', { required: true })}
          >
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            {CONDITION_OPTIONS.find((option) => option.value === watch('condition'))?.description}
          </p>
        </div>

        <Input
          label={`Lantai Ke-${selectedBuilding ? ` (maks ${selectedBuilding.floorCount})` : ''}`}
          type="number"
          min="1"
          required
          {...register('floorNumber', {
            required: 'Nomor lantai wajib diisi',
            validate: (value) => {
              const num = Number(value);
              if (Number.isNaN(num) || num < 1) return 'Nomor lantai minimal 1';
              if (selectedBuilding && num > selectedBuilding.floorCount) {
                return `Nomor lantai tidak boleh melebihi ${selectedBuilding.floorCount}`;
              }
              return true;
            },
          })}
          error={errors.floorNumber?.message}
        />

        <Input
          label="Kapasitas (opsional)"
          type="number"
          min="1"
          {...register('capacity', {
            validate: (value) => {
              if (!value) return true;
              return Number(value) > 0 ? true : 'Kapasitas harus lebih besar dari 0';
            },
          })}
          error={errors.capacity?.message}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Catatan Tambahan"
            rows={2}
            placeholder="Fasilitas ruangan, kebutuhan perbaikan, jadwal perawatan, dsb."
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


