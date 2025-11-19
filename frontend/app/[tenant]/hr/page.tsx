'use client';

import { useState } from 'react';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { hrApi, Employee, EmployeeCreateData, Attendance, AttendanceCreateData, Payroll, PayrollCreateData, PayrollItem, Department, DepartmentCreateData, PerformanceReview, PerformanceReviewCreateData } from '@/lib/api/hr';
import { PositionsSection } from './positions-section';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

export default function HrPage() {
  const tenantId = useTenantId();
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'positions' | 'payroll' | 'departments' | 'performance'>('employees');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceReview | null>(null);
  const [formData, setFormData] = useState<EmployeeCreateData>({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: '',
    salary: 0,
    status: 'active',
    gender: '',
    birth_date: '',
    address: '',
  });
  const [attendanceData, setAttendanceData] = useState<AttendanceCreateData>({
    employeeId: 0,
    attendanceDate: new Date().toISOString().split('T')[0],
    checkInTime: '',
    checkOutTime: '',
    status: 'present',
    notes: '',
  });
  const [payrollData, setPayrollData] = useState<PayrollCreateData>({
    employeeId: 0,
    employeeType: 'employee',
    payrollDate: new Date().toISOString().split('T')[0],
    basicSalary: 0,
    allowances: [],
    deductions: [],
    notes: '',
  });
  const [departmentData, setDepartmentData] = useState<DepartmentCreateData>({
    name: '',
    description: '',
    isActive: true,
  });
  const [performanceData, setPerformanceData] = useState<PerformanceReviewCreateData>({
    employeeId: 0,
    reviewDate: new Date().toISOString().split('T')[0],
    reviewPeriod: '',
    rating: 1,
    strengths: '',
    weaknesses: '',
    goals: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['hr-employees', tenantId],
    queryFn: () => hrApi.getAllEmployees(tenantId!),
    enabled: activeTab === 'employees' && !!tenantId,
  });

  const { data: attendanceDataQuery, isLoading: attendanceLoading } = useQuery({
    queryKey: ['hr-attendance', tenantId],
    queryFn: () => hrApi.getAllAttendance(tenantId!),
    enabled: activeTab === 'attendance' && !!tenantId,
  });

  const { data: payrollsData, isLoading: payrollsLoading } = useQuery({
    queryKey: ['hr-payrolls', tenantId],
    queryFn: () => hrApi.getAllPayrolls(tenantId!),
    enabled: activeTab === 'payroll' && !!tenantId,
  });

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['hr-departments', tenantId],
    queryFn: () => hrApi.getAllDepartments(tenantId!),
    enabled: (activeTab === 'departments' || activeTab === 'employees') && !!tenantId,
  });

  const { data: performanceReviewsData, isLoading: performanceLoading } = useQuery({
    queryKey: ['hr-performance', tenantId],
    queryFn: () => hrApi.getAllPerformanceReviews(tenantId!),
    enabled: activeTab === 'performance' && !!tenantId,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: EmployeeCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.createEmployee(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees', tenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmployeeCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.updateEmployee(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees', tenantId] });
      setIsModalOpen(false);
      setSelectedEmployee(null);
      resetForm();
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.deleteEmployee(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees', tenantId] });
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: (data: AttendanceCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.createAttendance(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attendance', tenantId] });
      setIsAttendanceModalOpen(false);
      resetAttendanceForm();
    },
  });

  const createPayrollMutation = useMutation({
    mutationFn: (data: PayrollCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.createPayroll(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-payrolls', tenantId] });
      setIsPayrollModalOpen(false);
      setPayrollData({
        employeeId: 0,
        employeeType: 'employee',
        payrollDate: new Date().toISOString().split('T')[0],
        basicSalary: 0,
        allowances: [],
        deductions: [],
        notes: '',
      });
    },
  });

  const updatePayrollMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PayrollCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.updatePayroll(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-payrolls', tenantId] });
      setIsPayrollModalOpen(false);
      setSelectedPayroll(null);
    },
  });

  const deletePayrollMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.deletePayroll(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-payrolls', tenantId] });
    },
  });

  const createDepartmentMutation = useMutation({
    mutationFn: (data: DepartmentCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.createDepartment(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-departments', tenantId] });
      setIsDepartmentModalOpen(false);
      setDepartmentData({ name: '', description: '', isActive: true });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepartmentCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.updateDepartment(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-departments', tenantId] });
      setIsDepartmentModalOpen(false);
      setSelectedDepartment(null);
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.deleteDepartment(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-departments', tenantId] });
    },
  });

  const createPerformanceMutation = useMutation({
    mutationFn: (data: PerformanceReviewCreateData) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.createPerformanceReview(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-performance', tenantId] });
      setIsPerformanceModalOpen(false);
      setPerformanceData({
        employeeId: 0,
        reviewDate: new Date().toISOString().split('T')[0],
        reviewPeriod: '',
        rating: 1,
        strengths: '',
        weaknesses: '',
        goals: '',
        notes: '',
      });
    },
  });

  const updatePerformanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PerformanceReviewCreateData> }) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.updatePerformanceReview(tenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-performance', tenantId] });
      setIsPerformanceModalOpen(false);
      setSelectedPerformance(null);
    },
  });

  const deletePerformanceMutation = useMutation({
    mutationFn: (id: number) => {
      if (!tenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return hrApi.deletePerformanceReview(tenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-performance', tenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      hire_date: '',
      salary: 0,
      status: 'active',
      gender: '',
      birth_date: '',
      address: '',
    });
    setSelectedEmployee(null);
  };

  const resetAttendanceForm = () => {
    setAttendanceData({
      employeeId: 0,
      attendanceDate: new Date().toISOString().split('T')[0],
      checkInTime: '',
      checkOutTime: '',
      status: 'present',
      notes: '',
    });
    setSelectedAttendance(null);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employee_id: employee.employee_id || '',
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
      salary: employee.salary || 0,
      status: employee.status || 'active',
      gender: employee.gender || '',
      birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
      address: employee.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
      return;
    }
    if (selectedEmployee) {
      updateEmployeeMutation.mutate({ id: selectedEmployee.id, data: formData });
    } else {
      createEmployeeMutation.mutate(formData);
    }
  };

  const totalEmployees = employeesData?.data?.length || 0;
  const activeEmployees = employeesData?.data?.filter((e) => e.status === 'active').length || 0;
  const totalAttendance = attendanceDataQuery?.length || 0;

  return (
    <TenantLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                HR / SDM
              </h1>
              <p className="text-gray-600">Manajemen sumber daya manusia</p>
            </div>
            {activeTab === 'employees' && (
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Karyawan
              </Button>
            )}
            {activeTab === 'attendance' && (
              <Button
                onClick={() => {
                  resetAttendanceForm();
                  setIsAttendanceModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Input Absensi
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Karyawan</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Karyawan Aktif</p>
                <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
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
                <p className="text-sm text-gray-600 mb-1">Total Absensi</p>
                <p className="text-3xl font-bold text-purple-600">{totalAttendance}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('employees')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'employees'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Karyawan
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Absensi
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'positions'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Jabatan
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'payroll'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Penggajian
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'departments'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Departemen
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'performance'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kinerja
            </button>
          </div>
        </div>

        {activeTab === 'employees' && (
          <>
            {employeesLoading ? (
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
                        <TableHead className="font-semibold text-gray-700">ID Karyawan</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nama</TableHead>
                        <TableHead className="font-semibold text-gray-700">Posisi</TableHead>
                        <TableHead className="font-semibold text-gray-700">Departemen</TableHead>
                        <TableHead className="font-semibold text-gray-700">Email</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeesData?.data?.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{employee.employee_id || '-'}</TableCell>
                          <TableCell className="font-medium text-gray-800">{employee.name}</TableCell>
                          <TableCell>{employee.position || '-'}</TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>{employee.email || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              employee.status === 'active' 
                                ? 'bg-green-500 text-white' 
                                : employee.status === 'inactive'
                                ? 'bg-gray-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}>
                              {employee.status === 'active' ? 'Aktif' :
                               employee.status === 'inactive' ? 'Tidak Aktif' :
                               employee.status === 'resigned' ? 'Resign' : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEmployee(employee)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
                                    deleteEmployeeMutation.mutate(employee.id);
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
                      {employeesData?.data?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data karyawan</p>
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
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              title={selectedEmployee ? 'Edit Karyawan' : 'Tambah Karyawan'}
              size="lg"
            >
              <form onSubmit={handleSubmitEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Karyawan</label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gaji</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="resigned">Resign</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                  <Button
                    type="submit"
                    loading={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                  >
                    {selectedEmployee ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
        {activeTab === 'attendance' && (
          <>
            {attendanceLoading ? (
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
                        <TableHead className="font-semibold text-gray-700">Karyawan</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                        <TableHead className="font-semibold text-gray-700">Check In</TableHead>
                        <TableHead className="font-semibold text-gray-700">Check Out</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceDataQuery?.map((attendance) => (
                        <TableRow key={attendance.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-800">{attendance.employee?.name || attendance.employee_name || '-'}</TableCell>
                          <TableCell>{formatDate(attendance.attendanceDate)}</TableCell>
                          <TableCell>{attendance.checkInTime || '-'}</TableCell>
                          <TableCell>{attendance.checkOutTime || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              attendance.status === 'present' 
                                ? 'bg-green-500 text-white' 
                                : attendance.status === 'absent'
                                ? 'bg-red-500 text-white'
                                : attendance.status === 'late'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                              {attendance.status === 'present' ? 'Hadir' :
                               attendance.status === 'absent' ? 'Tidak Hadir' :
                               attendance.status === 'late' ? 'Terlambat' :
                               attendance.status === 'excused' ? 'Izin' : '-'}
                            </span>
                          </TableCell>
                          <TableCell>{attendance.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {(!attendanceDataQuery || attendanceDataQuery.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">Belum ada data absensi</p>
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
              isOpen={isAttendanceModalOpen}
              onClose={() => {
                setIsAttendanceModalOpen(false);
                resetAttendanceForm();
              }}
              title="Input Absensi"
              size="md"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!tenantId) {
                  alert('Tenant belum siap. Silakan tunggu beberapa saat dan coba lagi.');
                  return;
                }
                createAttendanceMutation.mutate(attendanceData);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Karyawan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={attendanceData.employeeId}
                    onChange={(e) => setAttendanceData({ ...attendanceData, employeeId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="0">Pilih Karyawan</option>
                    {employeesData?.data?.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={attendanceData.attendanceDate}
                    onChange={(e) => setAttendanceData({ ...attendanceData, attendanceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                    <input
                      type="time"
                      value={attendanceData.checkInTime}
                      onChange={(e) => setAttendanceData({ ...attendanceData, checkInTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                    <input
                      type="time"
                      value={attendanceData.checkOutTime}
                      onChange={(e) => setAttendanceData({ ...attendanceData, checkOutTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={attendanceData.status}
                    onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="present">Hadir</option>
                    <option value="absent">Tidak Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="excused">Izin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={attendanceData.notes}
                    onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsAttendanceModalOpen(false);
                      resetAttendanceForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    loading={createAttendanceMutation.isPending}
                  >
                    Simpan
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
        {activeTab === 'positions' && (
          <PositionsSection />
        )}
        {activeTab === 'payroll' && (
          <>
            {payrollsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b">
                  <h2 className="text-xl font-bold">Data Penggajian</h2>
                  <Button
                    onClick={() => {
                      setPayrollData({
                        employeeId: 0,
                        employeeType: 'employee',
                        payrollDate: new Date().toISOString().split('T')[0],
                        basicSalary: 0,
                        allowances: [],
                        deductions: [],
                        notes: '',
                      });
                      setSelectedPayroll(null);
                      setIsPayrollModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    Tambah Penggajian
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Gaji Pokok</TableHead>
                        <TableHead>Tunjangan</TableHead>
                        <TableHead>Potongan</TableHead>
                        <TableHead>Gaji Bersih</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollsData && payrollsData.length > 0 ? (
                        payrollsData.map((payroll) => (
                          <TableRow key={payroll.id}>
                            <TableCell>{payroll.employee?.name || '-'}</TableCell>
                            <TableCell>{formatDate(payroll.payrollDate)}</TableCell>
                            <TableCell>Rp {payroll.basicSalary.toLocaleString('id-ID')}</TableCell>
                            <TableCell>Rp {payroll.totalAllowances.toLocaleString('id-ID')}</TableCell>
                            <TableCell>Rp {payroll.totalDeductions.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="font-bold">Rp {payroll.netSalary.toLocaleString('id-ID')}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                payroll.status === 'paid' ? 'bg-green-100 text-green-800' :
                                payroll.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                payroll.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {payroll.status === 'paid' ? 'Dibayar' :
                                 payroll.status === 'approved' ? 'Disetujui' :
                                 payroll.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setPayrollData({
                                    employeeId: payroll.employeeId,
                                    employeeType: payroll.employeeType,
                                    payrollDate: typeof payroll.payrollDate === 'string' ? payroll.payrollDate.split('T')[0] : new Date(payroll.payrollDate).toISOString().split('T')[0],
                                    basicSalary: payroll.basicSalary,
                                    allowances: payroll.items?.filter(i => i.type === 'allowance') || [],
                                    deductions: payroll.items?.filter(i => i.type === 'deduction') || [],
                                    notes: payroll.notes || '',
                                  });
                                  setIsPayrollModalOpen(true);
                                }}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => {
                                  if (confirm('Hapus data penggajian ini?')) {
                                    deletePayrollMutation.mutate(payroll.id);
                                  }
                                }}>Hapus</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">Belum ada data penggajian</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <Modal
              isOpen={isPayrollModalOpen}
              onClose={() => {
                setIsPayrollModalOpen(false);
                setSelectedPayroll(null);
              }}
              title={selectedPayroll ? 'Edit Penggajian' : 'Tambah Penggajian'}
              size="lg"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedPayroll) {
                  updatePayrollMutation.mutate({ id: selectedPayroll.id, data: payrollData });
                } else {
                  createPayrollMutation.mutate(payrollData);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Karyawan *</label>
                    <select
                      value={payrollData.employeeId}
                      onChange={(e) => setPayrollData({ ...payrollData, employeeId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="0">Pilih Karyawan</option>
                      {employeesData?.data?.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipe *</label>
                    <select
                      value={payrollData.employeeType}
                      onChange={(e) => setPayrollData({ ...payrollData, employeeType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="employee">Karyawan</option>
                      <option value="teacher">Guru</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal *</label>
                    <input
                      type="date"
                      value={payrollData.payrollDate}
                      onChange={(e) => setPayrollData({ ...payrollData, payrollDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gaji Pokok *</label>
                    <input
                      type="number"
                      value={payrollData.basicSalary}
                      onChange={(e) => setPayrollData({ ...payrollData, basicSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Catatan</label>
                  <textarea
                    value={payrollData.notes}
                    onChange={(e) => setPayrollData({ ...payrollData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsPayrollModalOpen(false)}>Batal</Button>
                  <Button type="submit" loading={createPayrollMutation.isPending || updatePayrollMutation.isPending}>
                    {selectedPayroll ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
        {activeTab === 'departments' && (
          <>
            {departmentsLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b">
                  <h2 className="text-xl font-bold">Data Departemen</h2>
                  <Button
                    onClick={() => {
                      setDepartmentData({ name: '', description: '', isActive: true });
                      setSelectedDepartment(null);
                      setIsDepartmentModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    Tambah Departemen
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead>Nama</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jumlah Karyawan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentsData && departmentsData.length > 0 ? (
                        departmentsData.map((dept) => (
                          <TableRow key={dept.id}>
                            <TableCell className="font-semibold">{dept.name}</TableCell>
                            <TableCell>{dept.description || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {dept.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </TableCell>
                            <TableCell>{dept.employees?.length || 0}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedDepartment(dept);
                                  setDepartmentData({
                                    name: dept.name,
                                    description: dept.description || '',
                                    isActive: dept.isActive,
                                  });
                                  setIsDepartmentModalOpen(true);
                                }}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => {
                                  if (confirm('Hapus departemen ini?')) {
                                    deleteDepartmentMutation.mutate(dept.id);
                                  }
                                }}>Hapus</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">Belum ada data departemen</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <Modal
              isOpen={isDepartmentModalOpen}
              onClose={() => {
                setIsDepartmentModalOpen(false);
                setSelectedDepartment(null);
              }}
              title={selectedDepartment ? 'Edit Departemen' : 'Tambah Departemen'}
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedDepartment) {
                  updateDepartmentMutation.mutate({ id: selectedDepartment.id, data: departmentData });
                } else {
                  createDepartmentMutation.mutate(departmentData);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama *</label>
                  <input
                    type="text"
                    value={departmentData.name}
                    onChange={(e) => setDepartmentData({ ...departmentData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea
                    value={departmentData.description}
                    onChange={(e) => setDepartmentData({ ...departmentData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={departmentData.isActive}
                      onChange={(e) => setDepartmentData({ ...departmentData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Aktif</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsDepartmentModalOpen(false)}>Batal</Button>
                  <Button type="submit" loading={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}>
                    {selectedDepartment ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Modal>
          </>
        )}
        {activeTab === 'performance' && (
          <>
            {performanceLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b">
                  <h2 className="text-xl font-bold">Penilaian Kinerja</h2>
                  <Button
                    onClick={() => {
                      setPerformanceData({
                        employeeId: 0,
                        reviewDate: new Date().toISOString().split('T')[0],
                        reviewPeriod: '',
                        rating: 1,
                        strengths: '',
                        weaknesses: '',
                        goals: '',
                        notes: '',
                      });
                      setSelectedPerformance(null);
                      setIsPerformanceModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    Tambah Penilaian
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Kekuatan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performanceReviewsData && performanceReviewsData.length > 0 ? (
                        performanceReviewsData.map((perf) => (
                          <TableRow key={perf.id}>
                            <TableCell className="font-semibold">{perf.employee?.name || '-'}</TableCell>
                            <TableCell>{formatDate(perf.reviewDate)}</TableCell>
                            <TableCell>{perf.reviewPeriod}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                {perf.rating}/5
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{perf.strengths}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedPerformance(perf);
                                  setPerformanceData({
                                    employeeId: perf.employeeId,
                                    reviewDate: typeof perf.reviewDate === 'string' ? perf.reviewDate.split('T')[0] : new Date(perf.reviewDate).toISOString().split('T')[0],
                                    reviewPeriod: perf.reviewPeriod,
                                    rating: perf.rating,
                                    strengths: perf.strengths,
                                    weaknesses: perf.weaknesses || '',
                                    goals: perf.goals || '',
                                    notes: perf.notes || '',
                                  });
                                  setIsPerformanceModalOpen(true);
                                }}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => {
                                  if (confirm('Hapus penilaian ini?')) {
                                    deletePerformanceMutation.mutate(perf.id);
                                  }
                                }}>Hapus</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">Belum ada data penilaian</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <Modal
              isOpen={isPerformanceModalOpen}
              onClose={() => {
                setIsPerformanceModalOpen(false);
                setSelectedPerformance(null);
              }}
              title={selectedPerformance ? 'Edit Penilaian Kinerja' : 'Tambah Penilaian Kinerja'}
              size="lg"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedPerformance) {
                  updatePerformanceMutation.mutate({ id: selectedPerformance.id, data: performanceData });
                } else {
                  createPerformanceMutation.mutate(performanceData);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Karyawan *</label>
                    <select
                      value={performanceData.employeeId}
                      onChange={(e) => setPerformanceData({ ...performanceData, employeeId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="0">Pilih Karyawan</option>
                      {employeesData?.data?.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal *</label>
                    <input
                      type="date"
                      value={performanceData.reviewDate}
                      onChange={(e) => setPerformanceData({ ...performanceData, reviewDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Periode *</label>
                    <input
                      type="text"
                      value={performanceData.reviewPeriod}
                      onChange={(e) => setPerformanceData({ ...performanceData, reviewPeriod: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Contoh: Q1 2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating (1-5) *</label>
                    <input
                      type="number"
                      value={performanceData.rating}
                      onChange={(e) => setPerformanceData({ ...performanceData, rating: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="5"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kekuatan *</label>
                  <textarea
                    value={performanceData.strengths}
                    onChange={(e) => setPerformanceData({ ...performanceData, strengths: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kelemahan</label>
                  <textarea
                    value={performanceData.weaknesses}
                    onChange={(e) => setPerformanceData({ ...performanceData, weaknesses: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tujuan</label>
                  <textarea
                    value={performanceData.goals}
                    onChange={(e) => setPerformanceData({ ...performanceData, goals: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Catatan</label>
                  <textarea
                    value={performanceData.notes}
                    onChange={(e) => setPerformanceData({ ...performanceData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsPerformanceModalOpen(false)}>Batal</Button>
                  <Button type="submit" loading={createPerformanceMutation.isPending || updatePerformanceMutation.isPending}>
                    {selectedPerformance ? 'Update' : 'Simpan'}
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
