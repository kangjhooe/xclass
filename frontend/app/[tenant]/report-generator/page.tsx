'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';

export default function ReportGeneratorPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenant as string);

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Generator Laporan</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Halaman Generator Laporan sedang dalam pengembangan.</p>
        </div>
      </div>
    </TenantLayout>
  );
}

