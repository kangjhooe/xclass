'use client';

import StudentLayout from '@/components/layouts/StudentLayout';
import EmptyState from '@/components/student/EmptyState';
import { MessageSquare } from 'lucide-react';

export default function StudentMessagesPage() {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Pesan
            </h1>
            <p className="text-gray-600 mt-1">Komunikasi dengan guru dan sekolah</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12">
          <EmptyState
            icon={MessageSquare}
            title="Fitur Pesan"
            description="Fitur pesan akan segera hadir. Anda dapat berkomunikasi dengan guru dan sekolah melalui fitur ini."
          />
        </div>
      </div>
    </StudentLayout>
  );
}

