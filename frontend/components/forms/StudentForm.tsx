'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { StudentCreateData } from '@/lib/api/students';

interface StudentFormProps {
  initialData?: Partial<StudentCreateData>;
  onSubmit: (data: StudentCreateData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function StudentForm({ initialData, onSubmit, onCancel, isLoading }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentCreateData>({
    defaultValues: initialData || {
      name: '',
      nisn: '',
      nis: '',
      email: '',
      phone: '',
      gender: '',
      birth_place: '',
      birth_date: '',
      address: '',
      status: 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Nama"
            {...register('name', { required: 'Nama wajib diisi' })}
            error={errors.name?.message}
            required
          />
        </div>

        <div>
          <Input
            label="NISN"
            {...register('nisn')}
            error={errors.nisn?.message}
          />
        </div>

        <div>
          <Input
            label="NIS"
            {...register('nis')}
            error={errors.nis?.message}
          />
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
          <select
            {...register('gender')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div>
          <Input
            label="Tanggal Lahir"
            type="date"
            {...register('birth_date')}
            error={errors.birth_date?.message}
          />
        </div>

        <div>
          <Input
            label="Tempat Lahir"
            {...register('birth_place')}
            error={errors.birth_place?.message}
          />
        </div>

        <div>
          <Input
            label="No. Telepon"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="col-span-2">
          <Textarea
            label="Alamat"
            {...register('address')}
            error={errors.address?.message}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          Simpan
        </Button>
      </div>
    </form>
  );
}

