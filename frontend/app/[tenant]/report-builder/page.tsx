'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { LazyReportBuilder } from './lazy';
import { reportBuilderApi } from '@/lib/api/report-builder';
import { useToastStore } from '@/lib/store/toast';
import { ReportBuilderConfig } from '@/components/report-builder/types';
import { useTenantId } from '@/lib/hooks/useTenant';
import { SkeletonPage } from '@/components/ui/Skeleton';

export default function ReportBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const { success, error, promise } = useToastStore();

  const handleSave = async (config: ReportBuilderConfig) => {
    try {
      await promise(
        reportBuilderApi.createTemplate(
          {
            name: `Report ${new Date().toLocaleDateString()}`,
            category: 'general',
            config,
          },
          resolvedTenantId
        ),
        {
          loading: 'Menyimpan template...',
          success: 'Template berhasil disimpan!',
          error: (err) => `Gagal menyimpan template: ${err.message}`,
        }
      );
    } catch (err: any) {
      error(err.message || 'Gagal menyimpan template');
    }
  };

  const handlePreview = async (config: ReportBuilderConfig) => {
    try {
      const result = await promise(
        reportBuilderApi.previewReport(config, {}, resolvedTenantId),
        {
          loading: 'Membuat preview...',
          success: 'Preview berhasil dibuat!',
          error: (err) => `Gagal membuat preview: ${err.message}`,
        }
      );
      // TODO: Open preview in modal or new window
      console.log('Preview result:', result);
    } catch (err: any) {
      error(err.message || 'Gagal membuat preview');
    }
  };

  const handleExport = async (config: ReportBuilderConfig, format: 'pdf' | 'excel' | 'html') => {
    try {
      // TODO: Implement export functionality
      success(`Fitur export ${format.toUpperCase()} akan segera tersedia`);
    } catch (err: any) {
      error(err.message || 'Gagal mengekspor laporan');
    }
  };

  return (
    <TenantLayout>
      <div className="h-screen overflow-hidden">
        <Suspense fallback={<SkeletonPage />}>
          <LazyReportBuilder
            onSave={handleSave}
            onPreview={handlePreview}
            onExport={handleExport}
          />
        </Suspense>
      </div>
    </TenantLayout>
  );
}

