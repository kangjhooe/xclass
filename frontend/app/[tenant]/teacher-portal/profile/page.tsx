'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import { useAuthStore } from '@/lib/store/auth';
import apiClient from '@/lib/api/client';
import { User, Save, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function TeacherProfilePage() {
  const params = useParams();
  const tenantId = params.tenant as string;
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    fetchProfile();
  }, [tenantId]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile', {
        headers: { 'X-Tenant-NPSN': tenantId },
      });
      if (response.data.data) {
        setProfile({
          name: response.data.data.name || '',
          email: response.data.data.email || '',
          phone: response.data.data.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(
        '/auth/profile',
        profile,
        { headers: { 'X-Tenant-NPSN': tenantId } }
      );
      alert('Profil berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Pribadi</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nama
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                No. Telepon
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

