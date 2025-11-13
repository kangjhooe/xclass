'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { ModulePageShell } from '@/components/layouts/ModulePageShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { examsApi } from '@/lib/api/exams';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';
import { useAuthStore } from '@/lib/store/auth';

export default function QuestionBanksPage() {
  const tenantId = useTenantId();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormData, setImportFormData] = useState({
    targetBankId: undefined as number | undefined,
    name: '',
    subjectId: undefined as number | undefined,
    classId: undefined as number | undefined,
    overwriteExisting: false,
  });
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: undefined as number | undefined,
    classId: undefined as number | undefined,
    isShared: false,
  });

  const queryClient = useQueryClient();

  const { data: banks, isLoading } = useQuery({
    queryKey: ['question-banks', tenantId],
    queryFn: () => examsApi.getQuestionBanks(),
    enabled: !!tenantId,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes', tenantId],
    queryFn: () => classesApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', tenantId],
    queryFn: () => subjectsApi.getAll(tenantId!),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => examsApi.createQuestionBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-banks', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => examsApi.updateQuestionBank(selectedBank!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-banks', tenantId] });
      setIsModalOpen(false);
      resetForm();
      setSelectedBank(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bankId: number) => examsApi.deleteQuestionBank(bankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-banks', tenantId] });
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: { file: File; formData: typeof importFormData }) =>
      examsApi.importQuestionBank(data.file, data.formData),
    onSuccess: (result) => {
      alert(result.message || 'Bank soal berhasil diimpor!');
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportFormData({
        targetBankId: undefined,
        name: '',
        subjectId: undefined,
        classId: undefined,
        overwriteExisting: false,
      });
      queryClient.invalidateQueries({ queryKey: ['question-banks', tenantId] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal mengimpor bank soal');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subjectId: undefined,
      classId: undefined,
      isShared: false,
    });
    setSelectedBank(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBank) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <TenantLayout>
      <ModulePageShell
        moduleKey="exams"
        title="Bank Soal"
        description="Kelola bank soal Anda"
        actions={({ themeConfig }) => (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/exams/question-shares`}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Permintaan Berbagi
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setImportFile(null);
                setImportFormData({
                  targetBankId: undefined,
                  name: '',
                  subjectId: undefined,
                  classId: undefined,
                  overwriteExisting: false,
                });
                setIsImportModalOpen(true);
              }}
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Bank Soal
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className={themeConfig.primaryButton}
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Bank Soal
            </Button>
          </div>
        )}
      >
        {({ themeConfig }) => (
          <>
            {isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.accentBorder}`}></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Nama Bank Soal</TableHead>
                        <TableHead className="font-semibold text-gray-700">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                        <TableHead className="font-semibold text-gray-700">Jumlah Soal</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {banks?.map((bank: any) => (
                        <TableRow key={bank.id} className="hover:bg-violet-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{bank.name}</TableCell>
                          <TableCell>{bank.subject?.name || '-'}</TableCell>
                          <TableCell>{bank.classRoom?.name || '-'}</TableCell>
                          <TableCell>{bank.questions?.length || 0} soal</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              bank.isShared
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-400 text-white'
                            }`}>
                              {bank.isShared ? 'Dibagikan' : 'Private'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/exams/question-banks/${bank.id}`}
                                className="hover:bg-violet-50 hover:border-violet-300 transition-colors"
                              >
                                Kelola Soal
                              </Button>
                              {bank.teacherId === user?.id && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBank(bank);
                                      setFormData({
                                        name: bank.name,
                                        description: bank.description || '',
                                        subjectId: bank.subjectId,
                                        classId: bank.classId,
                                        isShared: bank.isShared || false,
                                      });
                                      setIsModalOpen(true);
                                    }}
                                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Hapus bank soal "${bank.name}"?`)) {
                                        examsApi.deleteQuestionBank(bank.id).then(() => {
                                          queryClient.invalidateQueries({ queryKey: ['question-banks', tenantId] });
                                        });
                                      }
                                    }}
                                    className="hover:bg-red-600 transition-colors"
                                  >
                                    Hapus
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!banks || banks.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada bank soal</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </ModulePageShell>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedBank ? 'Edit Bank Soal' : 'Tambah Bank Soal'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Bank Soal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Contoh: Bank Soal TIK Kelas 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi bank soal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
              <select
                value={formData.subjectId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjectsData?.data?.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select
                value={formData.classId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, classId: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Kelas</option>
                {classesData?.data?.map((classItem: any) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isShared"
              checked={formData.isShared}
              onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isShared" className="text-sm text-gray-700">
              Bagikan dengan guru lain dalam tenant
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {selectedBank ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportFile(null);
          setImportFormData({
            targetBankId: undefined,
            name: '',
            subjectId: undefined,
            classId: undefined,
            overwriteExisting: false,
          });
        }}
        title="Import Bank Soal"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!importFile) {
              alert('Pilih file ZIP terlebih dahulu');
              return;
            }
            if (!importFormData.targetBankId && !importFormData.name) {
              alert('Pilih bank soal tujuan atau masukkan nama bank baru');
              return;
            }
            importMutation.mutate({ file: importFile, formData: importFormData });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File ZIP <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (!file.name.endsWith('.zip')) {
                    alert('File harus berformat ZIP');
                    return;
                  }
                  setImportFile(file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Pilih file ZIP yang berisi bank soal (dari export bank soal)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Import ke Bank Soal</label>
            <select
              value={importFormData.targetBankId || ''}
              onChange={(e) =>
                setImportFormData({
                  ...importFormData,
                  targetBankId: e.target.value ? parseInt(e.target.value) : undefined,
                  name: '', // Clear name if selecting existing bank
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Buat Bank Soal Baru</option>
              {banks?.map((bank: any) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} {bank.subject?.name && `(${bank.subject.name})`}
                </option>
              ))}
            </select>
          </div>

          {!importFormData.targetBankId && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Bank Soal Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={importFormData.name}
                  onChange={(e) => setImportFormData({ ...importFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama bank soal"
                  required={!importFormData.targetBankId}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={importFormData.subjectId || ''}
                    onChange={(e) =>
                      setImportFormData({
                        ...importFormData,
                        subjectId: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih mata pelajaran</option>
                    {subjectsData?.data?.map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select
                    value={importFormData.classId || ''}
                    onChange={(e) =>
                      setImportFormData({
                        ...importFormData,
                        classId: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih kelas</option>
                    {classesData?.data?.map((classRoom: any) => (
                      <option key={classRoom.id} value={classRoom.id}>
                        {classRoom.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="overwriteExisting"
              checked={importFormData.overwriteExisting}
              onChange={(e) =>
                setImportFormData({ ...importFormData, overwriteExisting: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="overwriteExisting" className="ml-2 text-sm text-gray-700">
              Overwrite soal yang sudah ada (ganti dengan soal dari import)
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> File stimulus (gambar, PDF, dll) akan di-upload otomatis ke storage. Soal yang sudah ada akan di-skip kecuali Anda centang "Overwrite".
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportFile(null);
                setImportFormData({
                  targetBankId: undefined,
                  name: '',
                  subjectId: undefined,
                  classId: undefined,
                  overwriteExisting: false,
                });
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={importMutation.isPending}>
              Import Bank Soal
            </Button>
          </div>
        </form>
      </Modal>
    </TenantLayout>
  );
}

