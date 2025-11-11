'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { elearningApi, Material, MaterialCreateData, Assignment, AssignmentCreateData } from '@/lib/api/elearning';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function ELearningPage() {
  const tenantId = useTenantId();
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('materials');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [materialFormData, setMaterialFormData] = useState<MaterialCreateData>({
    title: '',
    description: '',
    content: '',
    subject_id: undefined,
    class_id: undefined,
    file_url: '',
    type: 'text',
    status: 'draft',
  });
  const [assignmentFormData, setAssignmentFormData] = useState<AssignmentCreateData>({
    title: '',
    description: '',
    subject_id: undefined,
    class_id: undefined,
    due_date: '',
    max_score: 100,
    status: 'draft',
  });

  const queryClient = useQueryClient();

  const { data: materialsData, isLoading: materialsLoading } = useQuery({
    queryKey: ['elearning-materials', tenantId],
    queryFn: () => elearningApi.getAllMaterials(tenantId!),
    enabled: activeTab === 'materials' && !!tenantId,
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['elearning-assignments', tenantId],
    queryFn: () => elearningApi.getAllAssignments(tenantId!),
    enabled: activeTab === 'assignments' && !!tenantId,
  });

  const createMaterialMutation = useMutation({
    mutationFn: (data: MaterialCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return elearningApi.createMaterial(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elearning-materials', tenantId] });
      setIsMaterialModalOpen(false);
      resetMaterialForm();
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaterialCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return elearningApi.updateMaterial(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elearning-materials', tenantId] });
      setIsMaterialModalOpen(false);
      setSelectedMaterial(null);
      resetMaterialForm();
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return elearningApi.deleteMaterial(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elearning-materials', tenantId] });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: AssignmentCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return elearningApi.createAssignment(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elearning-assignments', tenantId] });
      setIsAssignmentModalOpen(false);
      resetAssignmentForm();
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AssignmentCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return elearningApi.updateAssignment(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elearning-assignments', tenantId] });
      setIsAssignmentModalOpen(false);
      setSelectedAssignment(null);
      resetAssignmentForm();
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return elearningApi.deleteAssignment(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elearning-assignments', tenantId] });
    },
  });

  const resetMaterialForm = () => {
    setMaterialFormData({
      title: '',
      description: '',
      content: '',
      subject_id: undefined,
      class_id: undefined,
      file_url: '',
      type: 'text',
      status: 'draft',
    });
    setSelectedMaterial(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      title: '',
      description: '',
      subject_id: undefined,
      class_id: undefined,
      due_date: '',
      max_score: 100,
      status: 'draft',
    });
    setSelectedAssignment(null);
  };

  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setMaterialFormData({
      title: material.title,
      description: material.description || '',
      content: material.content || '',
      subject_id: material.subject_id,
      class_id: material.class_id,
      file_url: material.file_url || '',
      type: material.type || 'text',
      status: material.status || 'draft',
    });
    setIsMaterialModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentFormData({
      title: assignment.title,
      description: assignment.description || '',
      subject_id: assignment.subject_id,
      class_id: assignment.class_id,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      max_score: assignment.max_score || 100,
      status: assignment.status || 'draft',
    });
    setIsAssignmentModalOpen(true);
  };

  const totalMaterials = materialsData?.data?.length || 0;
  const publishedMaterials = materialsData?.data?.filter((m) => m.status === 'published').length || 0;
  const totalAssignments = assignmentsData?.data?.length || 0;
  const publishedAssignments = assignmentsData?.data?.filter((a) => a.status === 'published').length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                E-Learning
              </h1>
              <p className="text-gray-600">Manajemen materi dan tugas pembelajaran</p>
            </div>
            {activeTab === 'materials' ? (
              <Button
                onClick={() => {
                  resetMaterialForm();
                  setIsMaterialModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Materi
              </Button>
            ) : (
              <Button
                onClick={() => {
                  resetAssignmentForm();
                  setIsAssignmentModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Tugas
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Materi</p>
                <p className="text-3xl font-bold text-blue-600">{totalMaterials}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Materi Dipublikasikan</p>
                <p className="text-3xl font-bold text-green-600">{publishedMaterials}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tugas</p>
                <p className="text-3xl font-bold text-purple-600">{totalAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tugas Dipublikasikan</p>
                <p className="text-3xl font-bold text-green-600">{publishedAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'materials'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Materi
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'assignments'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tugas
            </button>
          </div>
        </div>

        {activeTab === 'materials' ? (
          <>
            {materialsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead className="font-semibold text-gray-700">Judul</TableHead>
                        <TableHead className="font-semibold text-gray-700">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materialsData?.data?.map((material) => (
                        <TableRow key={material.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{material.title}</TableCell>
                          <TableCell>{material.subject_name || '-'}</TableCell>
                          <TableCell>{material.class_name || '-'}</TableCell>
                          <TableCell>
                            {material.type === 'text' ? 'Teks' :
                             material.type === 'video' ? 'Video' :
                             material.type === 'document' ? 'Dokumen' :
                             material.type === 'link' ? 'Link' : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              material.status === 'published' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-yellow-500 text-white'
                            }`}>
                              {material.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMaterial(material)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
                                    deleteMaterialMutation.mutate(material.id);
                                  }
                                }}
                                className="hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {materialsData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada materi</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Modal
              isOpen={isMaterialModalOpen}
              onClose={() => {
                setIsMaterialModalOpen(false);
                resetMaterialForm();
              }}
              title={selectedMaterial ? 'Edit Materi' : 'Tambah Materi'}
              size="lg"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!tenantId) {
                  alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                  return;
                }
                if (selectedMaterial) {
                  updateMaterialMutation.mutate({ id: selectedMaterial.id, data: materialFormData });
                } else {
                  createMaterialMutation.mutate(materialFormData);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={materialFormData.title}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={materialFormData.description}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <textarea
                    value={materialFormData.content}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select
                      value={materialFormData.type}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Teks</option>
                      <option value="video">Video</option>
                      <option value="document">Dokumen</option>
                      <option value="link">Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={materialFormData.status}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Dipublikasikan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL File</label>
                  <input
                    type="url"
                    value={materialFormData.file_url}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, file_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsMaterialModalOpen(false);
                      resetMaterialForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createMaterialMutation.isPending || updateMaterialMutation.isPending}
                  >
                    {selectedMaterial ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        ) : (
          <>
            {assignmentsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead className="font-semibold text-gray-700">Judul</TableHead>
                        <TableHead className="font-semibold text-gray-700">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-gray-700">Kelas</TableHead>
                        <TableHead className="font-semibold text-gray-700">Batas Waktu</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nilai Maks</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignmentsData?.data?.map((assignment) => (
                        <TableRow key={assignment.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{assignment.title}</TableCell>
                          <TableCell>{assignment.subject_name || '-'}</TableCell>
                          <TableCell>{assignment.class_name || '-'}</TableCell>
                          <TableCell>{assignment.due_date ? formatDate(assignment.due_date) : '-'}</TableCell>
                          <TableCell>{assignment.max_score || 100}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              assignment.status === 'published' 
                                ? 'bg-green-500 text-white' 
                                : assignment.status === 'closed'
                                ? 'bg-gray-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }`}>
                              {assignment.status === 'published' ? 'Dipublikasikan' :
                               assignment.status === 'closed' ? 'Ditutup' :
                               assignment.status === 'draft' ? 'Draft' : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAssignment(assignment)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                                    deleteAssignmentMutation.mutate(assignment.id);
                                  }
                                }}
                                className="hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {assignmentsData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada tugas</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Modal
              isOpen={isAssignmentModalOpen}
              onClose={() => {
                setIsAssignmentModalOpen(false);
                resetAssignmentForm();
              }}
              title={selectedAssignment ? 'Edit Tugas' : 'Tambah Tugas'}
              size="lg"
            >
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!tenantId) {
              alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
              return;
            }
            if (selectedAssignment) {
              updateAssignmentMutation.mutate({ id: selectedAssignment.id, data: assignmentFormData });
            } else {
              createAssignmentMutation.mutate(assignmentFormData);
            }
          }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignmentFormData.title}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={assignmentFormData.description}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu</label>
                    <input
                      type="date"
                      value={assignmentFormData.due_date}
                      onChange={(e) => setAssignmentFormData({ ...assignmentFormData, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Maksimum</label>
                    <input
                      type="number"
                      value={assignmentFormData.max_score}
                      onChange={(e) => setAssignmentFormData({ ...assignmentFormData, max_score: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={assignmentFormData.status}
                      onChange={(e) => setAssignmentFormData({ ...assignmentFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Dipublikasikan</option>
                      <option value="closed">Ditutup</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsAssignmentModalOpen(false);
                      resetAssignmentForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
                  >
                    {selectedAssignment ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </div>
    </TenantLayout>
  );
}
