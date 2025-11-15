'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StudentLayout from '@/components/layouts/StudentLayout';
import { DashboardSkeleton } from '@/components/student/LoadingSkeleton';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const { user } = useAuthStore();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/mobile/dashboard', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });

        if (response.data.success && response.data.data) {
          const studentData = response.data.data.student;
          setStudent(studentData);
          setFormData({
            email: studentData.email || user?.email || '',
            phone: studentData.phone || '',
            address: studentData.address || '',
          });
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [tenantId]);

  const handleSave = async () => {
    try {
      // Update profile via API
      const response = await apiClient.patch('/student-portal/profile', formData, {
        headers: {
          'X-Tenant-NPSN': tenantId,
        },
      });
      
      if (response.data) {
        setEditing(false);
        // Update local student data
        setStudent({ ...student, ...formData });
        alert('Profil berhasil diperbarui');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui profil';
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <DashboardSkeleton />
      </StudentLayout>
    );
  }

  if (error || !student) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Data tidak ditemukan'}</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-8 h-8 text-blue-600" />
              Profil Siswa
            </h1>
            <p className="text-gray-600 mt-1">Kelola informasi profil Anda</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profil
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {student.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-600">NIS: {student.studentNumber}</p>
              <p className="text-gray-600">Kelas: {student.class || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.email || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telepon
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Alamat
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.address || '-'}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

