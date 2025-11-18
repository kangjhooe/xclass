'use client';

import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Button } from '@/components/ui/Button';
import { healthApi, HealthRecord } from '@/lib/api/health';
import { studentsApi } from '@/lib/api/students';
import { formatDate } from '@/lib/utils/date';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { ArrowLeft, Heart, Activity, Thermometer, Scale, Ruler, FileText } from 'lucide-react';
import { LineChartComponent } from '@/components/ui/Charts';

export default function StudentHealthHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = useTenantId();
  const studentId = params.studentId ? Number(params.studentId) : null;

  // Fetch student data
  const { data: studentData } = useQuery({
    queryKey: ['student', tenantId, studentId],
    queryFn: () => studentsApi.getById(tenantId!, studentId!),
    enabled: !!tenantId && !!studentId,
  });

  // Fetch all health records for this student
  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['health-records-student', tenantId, studentId],
    queryFn: () =>
      healthApi.getAll(tenantId!, {
        studentId: studentId!,
        limit: 1000, // Get all records
      }),
    enabled: !!tenantId && !!studentId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500 text-white';
      case 'sick':
        return 'bg-red-500 text-white';
      case 'recovering':
        return 'bg-yellow-500 text-white';
      case 'chronic':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Sehat';
      case 'sick':
        return 'Sakit';
      case 'recovering':
        return 'Pulih';
      case 'chronic':
        return 'Kronis';
      default:
        return status;
    }
  };

  // Prepare chart data for height and weight trends
  const heightWeightData = recordsData?.data
    ?.filter((r) => r.height && r.weight)
    .map((record) => ({
      date: formatDate(record.checkupDate),
      height: record.height,
      weight: record.weight,
      bmi: record.height && record.weight
        ? (record.weight / Math.pow(record.height / 100, 2)).toFixed(1)
        : null,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    }) || [];

  const temperatureData = recordsData?.data
    ?.filter((r) => r.temperature)
    .map((record) => ({
      date: formatDate(record.checkupDate),
      temperature: record.temperature,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    }) || [];

  const latestRecord = recordsData?.data?.[0];
  const totalRecords = recordsData?.total || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Riwayat Kesehatan
              </h1>
              <p className="text-gray-600">
                {studentData?.name || 'Siswa'} - {totalRecords} catatan kesehatan
              </p>
            </div>
            <Button
              onClick={() => router.push(`/${params.tenant as string}/health`)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Kembali ke Daftar
            </Button>
          </div>
        </div>

        {/* Latest Record Summary */}
        {latestRecord && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status Terakhir</p>
                  <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(latestRecord.healthStatus)}`}>
                    {getStatusLabel(latestRecord.healthStatus)}
                  </span>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tinggi Badan</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {latestRecord.height ? `${latestRecord.height} cm` : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Berat Badan</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {latestRecord.weight ? `${latestRecord.weight} kg` : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Suhu Tubuh</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {latestRecord.temperature ? `${latestRecord.temperature}°C` : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {heightWeightData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Perkembangan Tinggi & Berat Badan</h3>
              <div className="h-80">
                <LineChartComponent
                  data={heightWeightData}
                  dataKey="height"
                  lines={[
                    { key: 'height', name: 'Tinggi (cm)', color: '#3b82f6' },
                    { key: 'weight', name: 'Berat (kg)', color: '#8b5cf6' },
                  ]}
                  height={320}
                />
              </div>
            </div>

            {temperatureData.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Perkembangan Suhu Tubuh</h3>
                <div className="h-80">
                  <LineChartComponent
                    data={temperatureData}
                    dataKey="temperature"
                    lines={[{ key: 'temperature', name: 'Suhu (°C)', color: '#f59e0b' }]}
                    height={320}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* BMI Chart */}
        {heightWeightData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Perkembangan BMI (Body Mass Index)</h3>
            <div className="h-80">
              <LineChartComponent
                data={heightWeightData.map((d) => ({
                  ...d,
                  bmi: d.bmi ? parseFloat(d.bmi) : null,
                })).filter((d) => d.bmi !== null)}
                dataKey="bmi"
                lines={[{ key: 'bmi', name: 'BMI', color: '#10b981' }]}
                height={320}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="font-semibold text-red-600">Kurus</p>
                <p className="text-xs text-gray-600">&lt; 18.5</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="font-semibold text-green-600">Normal</p>
                <p className="text-xs text-gray-600">18.5 - 24.9</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <p className="font-semibold text-yellow-600">Gemuk</p>
                <p className="text-xs text-gray-600">25 - 29.9</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="font-semibold text-red-600">Obesitas</p>
                <p className="text-xs text-gray-600">&gt; 30</p>
              </div>
            </div>
          </div>
        )}

        {/* Records List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Daftar Catatan Kesehatan</h3>
          </div>
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : recordsData?.data && recordsData.data.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recordsData.data.map((record) => (
                <div
                  key={record.id}
                  className="p-6 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(record.healthStatus)}`}>
                          {getStatusLabel(record.healthStatus)}
                        </span>
                        <span className="text-sm text-gray-600">{formatDate(record.checkupDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {record.height && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tinggi Badan</p>
                        <p className="font-semibold text-gray-800">{record.height} cm</p>
                      </div>
                    )}
                    {record.weight && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Berat Badan</p>
                        <p className="font-semibold text-gray-800">{record.weight} kg</p>
                      </div>
                    )}
                    {record.temperature && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Suhu Tubuh</p>
                        <p className="font-semibold text-gray-800">{record.temperature}°C</p>
                      </div>
                    )}
                    {record.bloodPressure && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tekanan Darah</p>
                        <p className="font-semibold text-gray-800">{record.bloodPressure}</p>
                      </div>
                    )}
                  </div>
                  {record.symptoms && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Gejala</p>
                      <p className="text-sm text-gray-800">{record.symptoms}</p>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Diagnosis</p>
                      <p className="text-sm text-gray-800">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Pengobatan</p>
                      <p className="text-sm text-gray-800">{record.treatment}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Catatan</p>
                      <p className="text-sm text-gray-800">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Belum ada catatan kesehatan</p>
            </div>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}

