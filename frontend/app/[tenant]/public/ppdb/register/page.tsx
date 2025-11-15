'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { publicPageApi, PPDBFormStatus } from '@/lib/api/public-page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PPDBRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.tenant as string) || (params.tenant as string);
  const [formData, setFormData] = useState({
    studentName: '',
    studentNIK: '',
    studentBirthDate: '',
    studentBirthPlace: '',
    studentGender: '',
    studentAddress: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    desiredClass: '',
    previousSchool: '',
    notes: '',
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => {
      if (typeof tenantId === 'string') {
        return publicPageApi.submitPPDBForm(tenantId as any, data);
      }
      return publicPageApi.submitPPDBForm(tenantId, data);
    },
    onSuccess: () => {
      alert('Pendaftaran berhasil dikirim! Kami akan menghubungi Anda untuk proses selanjutnya.');
      router.push(`/${params.tenant}/public/ppdb`);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal mengirim pendaftaran. Silakan coba lagi.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (
      !formData.studentName ||
      !formData.studentNIK ||
      !formData.studentBirthDate ||
      !formData.studentBirthPlace ||
      !formData.studentGender ||
      !formData.studentAddress ||
      !formData.parentName ||
      !formData.parentPhone ||
      !formData.parentEmail ||
      !formData.desiredClass
    ) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/${params.tenant}/public/ppdb`}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Formulir Pendaftaran PPDB</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Pendaftaran Peserta Didik Baru</h2>
            <p className="text-gray-600">
              Silakan isi formulir di bawah ini dengan data yang benar dan lengkap.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Student Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Data Calon Siswa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nama Lengkap *"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  required
                />

                <Input
                  label="NIK *"
                  value={formData.studentNIK}
                  onChange={(e) => setFormData({ ...formData, studentNIK: e.target.value })}
                  required
                />

                <Input
                  label="Tanggal Lahir *"
                  type="date"
                  value={formData.studentBirthDate}
                  onChange={(e) => setFormData({ ...formData, studentBirthDate: e.target.value })}
                  required
                />

                <Input
                  label="Tempat Lahir *"
                  value={formData.studentBirthPlace}
                  onChange={(e) => setFormData({ ...formData, studentBirthPlace: e.target.value })}
                  required
                />

                <Select
                  label="Jenis Kelamin *"
                  value={formData.studentGender}
                  onChange={(e) => setFormData({ ...formData, studentGender: e.target.value })}
                  required
                  options={[
                    { value: '', label: 'Pilih Jenis Kelamin' },
                    { value: 'L', label: 'Laki-laki' },
                    { value: 'P', label: 'Perempuan' },
                  ]}
                />

                <Input
                  label="Kelas yang Diinginkan *"
                  value={formData.desiredClass}
                  onChange={(e) => setFormData({ ...formData, desiredClass: e.target.value })}
                  required
                  placeholder="e.g., X IPA 1"
                />
              </div>

              <div className="mt-6">
                <Textarea
                  label="Alamat Lengkap *"
                  value={formData.studentAddress}
                  onChange={(e) => setFormData({ ...formData, studentAddress: e.target.value })}
                  required
                  rows={3}
                />
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Data Orang Tua/Wali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nama Orang Tua/Wali *"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  required
                />

                <Input
                  label="Nomor Telepon *"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  required
                />

                <Input
                  label="Email *"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  required
                />

                <Input
                  label="Pekerjaan (Opsional)"
                  value={formData.parentOccupation}
                  onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Informasi Tambahan</h3>
              <div className="space-y-6">
                <Input
                  label="Sekolah Asal (Opsional)"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                />

                <Textarea
                  label="Catatan (Opsional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Informasi tambahan yang perlu diketahui..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link href={`/${params.tenant}/public/ppdb`}>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" loading={submitMutation.isPending} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Kirim Pendaftaran
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

