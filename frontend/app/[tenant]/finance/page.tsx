'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantLayout from '@/components/layouts/TenantLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/ui/ExportButton';
import { financeApi, SPP, SPPCreateData, Savings, SavingsCreateData, OtherBill, OtherBillCreateData, IncomeExpense, IncomeExpenseCreateData, Scholarship, ScholarshipCreateData, PaymentReminders, ReminderSummary } from '@/lib/api/finance';
import { studentsApi } from '@/lib/api/students';
import { formatDate } from '@/lib/utils/date';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantId } from '@/lib/hooks/useTenant';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function FinancePage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const resolvedTenantId = tenantId ?? undefined;
  const [activeTab, setActiveTab] = useState<'spp' | 'savings' | 'other-bills' | 'income-expense' | 'scholarships'>('spp');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSPP, setSelectedSPP] = useState<SPP | null>(null);
  const [selectedSavings, setSelectedSavings] = useState<Savings | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<SPPCreateData>({
    studentId: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    dueDate: '',
    notes: '',
  });

  const [savingsFormData, setSavingsFormData] = useState<SavingsCreateData>({
    studentId: 0,
    transactionType: 'deposit',
    amount: 0,
    description: '',
    receiptNumber: '',
  });

  const [otherBillFormData, setOtherBillFormData] = useState<OtherBillCreateData>({
    studentId: 0,
    category: 'other',
    title: '',
    description: '',
    amount: 0,
    dueDate: '',
    notes: '',
  });

  const [incomeExpenseFormData, setIncomeExpenseFormData] = useState<IncomeExpenseCreateData>({
    transactionType: 'income',
    category: 'donation',
    title: '',
    description: '',
    amount: 0,
    transactionDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    vendor: '',
    recipient: '',
    notes: '',
  });

  const [scholarshipFormData, setScholarshipFormData] = useState<ScholarshipCreateData>({
    studentId: 0,
    scholarshipType: 'full',
    title: '',
    description: '',
    amount: undefined,
    percentage: undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    status: 'active',
    sponsor: '',
    requirements: '',
    notes: '',
  });

  const [selectedOtherBill, setSelectedOtherBill] = useState<OtherBill | null>(null);
  const [selectedIncomeExpense, setSelectedIncomeExpense] = useState<IncomeExpense | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'income' | 'expense' | 'all'>('all');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['spp', resolvedTenantId, currentPage],
    queryFn: () => financeApi.getAllSPP(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined && activeTab === 'spp',
  });

  const { data: savingsData, isLoading: savingsLoading } = useQuery({
    queryKey: ['savings', resolvedTenantId, currentPage],
    queryFn: () => financeApi.getAllSavings(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined && activeTab === 'savings',
  });

  const { data: otherBillsData, isLoading: otherBillsLoading } = useQuery({
    queryKey: ['other-bills', resolvedTenantId, currentPage],
    queryFn: () => financeApi.getAllOtherBills(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined && activeTab === 'other-bills',
  });

  const { data: incomeExpenseData, isLoading: incomeExpenseLoading } = useQuery({
    queryKey: ['income-expenses', resolvedTenantId, currentPage, transactionTypeFilter],
    queryFn: () => financeApi.getAllIncomeExpenses(resolvedTenantId!, {
      type: transactionTypeFilter !== 'all' ? transactionTypeFilter : undefined,
    }),
    enabled: resolvedTenantId !== undefined && activeTab === 'income-expense',
  });

  const { data: incomeExpenseSummary } = useQuery({
    queryKey: ['income-expense-summary', resolvedTenantId],
    queryFn: () => financeApi.getIncomeExpenseSummary(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined && activeTab === 'income-expense',
  });

  const { data: scholarshipsData, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['scholarships', resolvedTenantId, currentPage],
    queryFn: () => financeApi.getAllScholarships(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined && activeTab === 'scholarships',
  });

  const { data: scholarshipStatistics } = useQuery({
    queryKey: ['scholarship-statistics', resolvedTenantId],
    queryFn: () => financeApi.getScholarshipStatistics(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined && activeTab === 'scholarships',
  });

  const { data: reminderSummary } = useQuery({
    queryKey: ['reminder-summary', resolvedTenantId],
    queryFn: () => financeApi.getReminderSummary(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: paymentReminders } = useQuery({
    queryKey: ['payment-reminders', resolvedTenantId],
    queryFn: () => financeApi.getPaymentReminders(resolvedTenantId!, 7),
    enabled: resolvedTenantId !== undefined && isReminderModalOpen,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', resolvedTenantId],
    queryFn: () => studentsApi.getAll(resolvedTenantId!),
    enabled: resolvedTenantId !== undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: SPPCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createSPP(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spp', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SPPCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateSPP(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spp', resolvedTenantId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.deleteSPP(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spp', resolvedTenantId] });
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ id, paidDate }: { id: number; paidDate: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.paySPP(resolvedTenantId, id, paidDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spp', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['reminder-summary', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['payment-reminders', resolvedTenantId] });
    },
  });

  // Savings mutations
  const createSavingsMutation = useMutation({
    mutationFn: (data: SavingsCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createSavings(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', resolvedTenantId] });
      setIsModalOpen(false);
      resetSavingsForm();
    },
  });

  const updateSavingsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SavingsCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateSavings(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', resolvedTenantId] });
      setIsModalOpen(false);
      resetSavingsForm();
    },
  });

  const deleteSavingsMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.deleteSavings(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', resolvedTenantId] });
    },
  });

  // Other Bills mutations
  const createOtherBillMutation = useMutation({
    mutationFn: (data: OtherBillCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createOtherBill(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-bills', resolvedTenantId] });
      setIsModalOpen(false);
      resetOtherBillForm();
    },
  });

  const updateOtherBillMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OtherBillCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateOtherBill(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-bills', resolvedTenantId] });
      setIsModalOpen(false);
      resetOtherBillForm();
    },
  });

  const deleteOtherBillMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.deleteOtherBill(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-bills', resolvedTenantId] });
    },
  });

  const payOtherBillMutation = useMutation({
    mutationFn: ({ id, paidDate }: { id: number; paidDate: string }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.payOtherBill(resolvedTenantId, id, paidDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-bills', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['reminder-summary', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['payment-reminders', resolvedTenantId] });
    },
  });

  // Income & Expense mutations
  const createIncomeExpenseMutation = useMutation({
    mutationFn: (data: IncomeExpenseCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createIncomeExpense(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['income-expense-summary', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
      setIsModalOpen(false);
      resetIncomeExpenseForm();
    },
  });

  const updateIncomeExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IncomeExpenseCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateIncomeExpense(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['income-expense-summary', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
      setIsModalOpen(false);
      resetIncomeExpenseForm();
    },
  });

  const deleteIncomeExpenseMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.deleteIncomeExpense(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['income-expense-summary', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budgets', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', resolvedTenantId] });
    },
  });

  // Scholarship mutations
  const createScholarshipMutation = useMutation({
    mutationFn: (data: ScholarshipCreateData) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.createScholarship(resolvedTenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-statistics', resolvedTenantId] });
      setIsModalOpen(false);
      resetScholarshipForm();
    },
  });

  const updateScholarshipMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ScholarshipCreateData> }) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.updateScholarship(resolvedTenantId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-statistics', resolvedTenantId] });
      setIsModalOpen(false);
      resetScholarshipForm();
    },
  });

  const deleteScholarshipMutation = useMutation({
    mutationFn: (id: number) => {
      if (!resolvedTenantId) {
        throw new Error('Tenant ID tidak tersedia.');
      }
      return financeApi.deleteScholarship(resolvedTenantId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships', resolvedTenantId] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-statistics', resolvedTenantId] });
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: 0,
      dueDate: '',
      notes: '',
    });
    setSelectedSPP(null);
  };

  const resetSavingsForm = () => {
    setSavingsFormData({
      studentId: 0,
      transactionType: 'deposit',
      amount: 0,
      description: '',
      receiptNumber: '',
    });
    setSelectedSavings(null);
  };

  const resetOtherBillForm = () => {
    setOtherBillFormData({
      studentId: 0,
      category: 'other',
      title: '',
      description: '',
      amount: 0,
      dueDate: '',
      notes: '',
    });
    setSelectedOtherBill(null);
  };

  const resetIncomeExpenseForm = () => {
    setIncomeExpenseFormData({
      transactionType: 'income',
      category: 'donation',
      title: '',
      description: '',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      vendor: '',
      recipient: '',
      notes: '',
    });
    setSelectedIncomeExpense(null);
  };

  const resetScholarshipForm = () => {
    setScholarshipFormData({
      studentId: 0,
      scholarshipType: 'full',
      title: '',
      description: '',
      amount: undefined,
      percentage: undefined,
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      status: 'active',
      sponsor: '',
      requirements: '',
      notes: '',
    });
    setSelectedScholarship(null);
  };

  const handleEdit = (spp: SPP) => {
    setSelectedSPP(spp);
    setFormData({
      studentId: spp.studentId,
      month: spp.month,
      year: spp.year,
      amount: spp.amount,
      dueDate: spp.dueDate,
      notes: spp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedSPP) {
      // Update existing SPP
      updateMutation.mutate({ id: selectedSPP.id, data: formData });
    } else {
      // Create new SPP
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus SPP ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSavings = (savings: Savings) => {
    setSelectedSavings(savings);
    setSavingsFormData({
      studentId: savings.studentId,
      transactionType: savings.transactionType,
      amount: savings.amount,
      description: savings.description || '',
      receiptNumber: savings.receiptNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitSavings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedSavings) {
      updateSavingsMutation.mutate({ id: selectedSavings.id, data: savingsFormData });
    } else {
      createSavingsMutation.mutate(savingsFormData);
    }
  };

  const handleDeleteSavings = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus transaksi tabungan ini?')) {
      deleteSavingsMutation.mutate(id);
    }
  };

  const handleEditOtherBill = (bill: OtherBill) => {
    setSelectedOtherBill(bill);
    setOtherBillFormData({
      studentId: bill.studentId,
      category: bill.category,
      title: bill.title,
      description: bill.description || '',
      amount: bill.amount,
      dueDate: bill.dueDate,
      notes: bill.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitOtherBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedOtherBill) {
      updateOtherBillMutation.mutate({ id: selectedOtherBill.id, data: otherBillFormData });
    } else {
      createOtherBillMutation.mutate(otherBillFormData);
    }
  };

  const handleDeleteOtherBill = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) {
      deleteOtherBillMutation.mutate(id);
    }
  };

  const handlePayOtherBill = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    const paidDate = prompt('Masukkan tanggal pembayaran (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (paidDate) {
      payOtherBillMutation.mutate({ id, paidDate });
    }
  };

  const handleEditIncomeExpense = (transaction: IncomeExpense) => {
    setSelectedIncomeExpense(transaction);
    setIncomeExpenseFormData({
      transactionType: transaction.transactionType,
      category: transaction.category,
      title: transaction.title,
      description: transaction.description || '',
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      referenceNumber: transaction.referenceNumber || '',
      vendor: transaction.vendor || '',
      recipient: transaction.recipient || '',
      notes: transaction.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitIncomeExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedIncomeExpense) {
      updateIncomeExpenseMutation.mutate({ id: selectedIncomeExpense.id, data: incomeExpenseFormData });
    } else {
      createIncomeExpenseMutation.mutate(incomeExpenseFormData);
    }
  };

  const handleDeleteIncomeExpense = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteIncomeExpenseMutation.mutate(id);
    }
  };

  const handleEditScholarship = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setScholarshipFormData({
      studentId: scholarship.studentId,
      scholarshipType: scholarship.scholarshipType,
      title: scholarship.title,
      description: scholarship.description || '',
      amount: scholarship.amount,
      percentage: scholarship.percentage,
      startDate: scholarship.startDate,
      endDate: scholarship.endDate,
      status: scholarship.status,
      sponsor: scholarship.sponsor || '',
      requirements: scholarship.requirements || '',
      notes: scholarship.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (selectedScholarship) {
      updateScholarshipMutation.mutate({ id: selectedScholarship.id, data: scholarshipFormData });
    } else {
      createScholarshipMutation.mutate(scholarshipFormData);
    }
  };

  const handleDeleteScholarship = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus beasiswa ini?')) {
      deleteScholarshipMutation.mutate(id);
    }
  };

  const handlePay = (id: number) => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    const paidDate = prompt('Masukkan tanggal pembayaran (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (paidDate) {
      payMutation.mutate({ id, paidDate });
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!resolvedTenantId) {
      alert('Tenant belum siap. Silakan coba lagi.');
      return;
    }
    console.log(`Exporting to ${format}...`);
    alert(`Fitur ekspor ${format.toUpperCase()} akan segera tersedia.`);
  };

  const totalPages = activeTab === 'spp' 
    ? (data ? Math.ceil((data.total || 0) / itemsPerPage) : 1)
    : activeTab === 'savings'
    ? (savingsData ? Math.ceil((savingsData.total || 0) / itemsPerPage) : 1)
    : activeTab === 'other-bills'
    ? (otherBillsData ? Math.ceil((otherBillsData.total || 0) / itemsPerPage) : 1)
    : activeTab === 'income-expense'
    ? (incomeExpenseData ? Math.ceil((incomeExpenseData.total || 0) / itemsPerPage) : 1)
    : (scholarshipsData ? Math.ceil((scholarshipsData.total || 0) / itemsPerPage) : 1);
  
  const paginatedData = activeTab === 'spp'
    ? (data?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [])
    : activeTab === 'savings'
    ? (savingsData?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [])
    : activeTab === 'other-bills'
    ? (otherBillsData?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [])
    : activeTab === 'income-expense'
    ? (incomeExpenseData?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [])
    : (scholarshipsData?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Belum Lunas', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Terlambat', className: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <TenantLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-800">Keuangan</h1>
            {reminderSummary && reminderSummary.totalReminders > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsReminderModalOpen(true)}
                className="relative"
              >
                <span>Reminder</span>
                {reminderSummary.overdueCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {reminderSummary.overdueCount}
                  </span>
                )}
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/${tenantId}/finance/reports`);
              }}
            >
              Laporan Keuangan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/${tenantId}/finance/budget`);
              }}
            >
              Anggaran
            </Button>
            <ExportButton onExport={handleExport} filename={activeTab} />
            <Button
              onClick={() => {
                if (activeTab === 'spp') {
                  resetForm();
                } else if (activeTab === 'savings') {
                  resetSavingsForm();
                } else if (activeTab === 'other-bills') {
                  resetOtherBillForm();
                } else if (activeTab === 'income-expense') {
                  resetIncomeExpenseForm();
                } else {
                  resetScholarshipForm();
                }
                setIsModalOpen(true);
              }}
            >
              {activeTab === 'spp' ? 'Tambah SPP' : 
               activeTab === 'savings' ? 'Tambah Transaksi' : 
               activeTab === 'other-bills' ? 'Tambah Tagihan' : 
               activeTab === 'income-expense' ? 'Tambah Transaksi' :
               'Tambah Beasiswa'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('spp');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'spp'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SPP
            </button>
            <button
              onClick={() => {
                setActiveTab('savings');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'savings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tabungan Siswa
            </button>
            <button
              onClick={() => {
                setActiveTab('other-bills');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'other-bills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tagihan Lainnya
            </button>
            <button
              onClick={() => {
                setActiveTab('income-expense');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'income-expense'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pemasukan & Pengeluaran
            </button>
            <button
              onClick={() => {
                setActiveTab('scholarships');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scholarships'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Beasiswa & Bantuan
            </button>
          </nav>
        </div>

        {activeTab === 'spp' ? (
          <>
            {isLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Bulan</TableHead>
                        <TableHead>Tahun</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead>Tanggal Bayar</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((spp: SPP) => (
                        <TableRow key={spp.id}>
                          <TableCell className="font-medium">
                            {spp.student?.name || `Siswa #${spp.studentId}`}
                          </TableCell>
                          <TableCell>{MONTHS[spp.month - 1]}</TableCell>
                          <TableCell>{spp.year}</TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              Rp {spp.amount.toLocaleString('id-ID')}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(spp.dueDate)}</TableCell>
                          <TableCell>{spp.paidDate ? formatDate(spp.paidDate) : '-'}</TableCell>
                          <TableCell>{getStatusBadge(spp.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {spp.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePay(spp.id)}
                                >
                                  Bayar
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(spp)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(spp.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            Tidak ada data SPP
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {data && data.total > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={data.total || 0}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {savingsLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead>No. Kwitansi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((savings: Savings) => (
                        <TableRow key={savings.id}>
                          <TableCell className="font-medium">
                            {savings.student?.name || `Siswa #${savings.studentId}`}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              savings.transactionType === 'deposit'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {savings.transactionType === 'deposit' ? 'Setoran' : 'Penarikan'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${
                              savings.transactionType === 'deposit' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {savings.transactionType === 'deposit' ? '+' : '-'} Rp {savings.amount.toLocaleString('id-ID')}
                            </span>
                          </TableCell>
                          <TableCell>{savings.description || '-'}</TableCell>
                          <TableCell>{savings.receiptNumber || '-'}</TableCell>
                          <TableCell>{savings.created_at ? formatDate(savings.created_at) : '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSavings(savings)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSavings(savings.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Tidak ada data tabungan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {savingsData && savingsData.total > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={savingsData.total || 0}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {otherBillsLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead>Tanggal Bayar</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((bill: OtherBill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">
                            {bill.student?.name || `Siswa #${bill.studentId}`}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {bill.category === 'exam' ? 'Ujian' :
                               bill.category === 'activity' ? 'Kegiatan' :
                               bill.category === 'uniform' ? 'Seragam' :
                               bill.category === 'book' ? 'Buku' :
                               bill.category === 'osis' ? 'OSIS' :
                               bill.category === 'practicum' ? 'Praktikum' :
                               bill.category === 'field_trip' ? 'Study Tour' :
                               bill.category === 'graduation' ? 'Wisuda' :
                               'Lainnya'}
                            </span>
                          </TableCell>
                          <TableCell>{bill.title}</TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              Rp {bill.amount.toLocaleString('id-ID')}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(bill.dueDate)}</TableCell>
                          <TableCell>{bill.paidDate ? formatDate(bill.paidDate) : '-'}</TableCell>
                          <TableCell>{getStatusBadge(bill.paymentStatus)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {bill.paymentStatus === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePayOtherBill(bill.id)}
                                >
                                  Bayar
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditOtherBill(bill)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteOtherBill(bill.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            Tidak ada data tagihan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {otherBillsData && otherBillsData.total > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={otherBillsData.total || 0}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Summary Cards */}
            {incomeExpenseSummary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Total Pemasukan</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    Rp {incomeExpenseSummary.totalIncome.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">Total Pengeluaran</div>
                  <div className="text-2xl font-bold text-red-700 mt-1">
                    Rp {incomeExpenseSummary.totalExpense.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className={`border rounded-lg p-4 ${
                  incomeExpenseSummary.balance >= 0 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className={`text-sm font-medium ${
                    incomeExpenseSummary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    Saldo
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${
                    incomeExpenseSummary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    Rp {incomeExpenseSummary.balance.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="mb-4 flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={transactionTypeFilter}
                onChange={(e) => {
                  setTransactionTypeFilter(e.target.value as 'income' | 'expense' | 'all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            {incomeExpenseLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Vendor/Penerima</TableHead>
                        <TableHead>No. Referensi</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((transaction: IncomeExpense) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.transactionType === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {transaction.category === 'donation' ? 'Donasi' :
                               transaction.category === 'sponsor' ? 'Sponsor' :
                               transaction.category === 'activity_revenue' ? 'Hasil Kegiatan' :
                               transaction.category === 'tuition' ? 'Uang Pangkal' :
                               transaction.category === 'grant' ? 'Bantuan' :
                               transaction.category === 'salary' ? 'Gaji' :
                               transaction.category === 'operational' ? 'Operasional' :
                               transaction.category === 'maintenance' ? 'Maintenance' :
                               transaction.category === 'utilities' ? 'Listrik/Air' :
                               transaction.category === 'supplies' ? 'Perlengkapan' :
                               transaction.category === 'activity' ? 'Kegiatan' :
                               transaction.category === 'facility' ? 'Fasilitas' :
                               transaction.category}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{transaction.title}</TableCell>
                          <TableCell>
                            <span className={`font-semibold ${
                              transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.transactionType === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                          <TableCell>
                            {transaction.transactionType === 'income' 
                              ? (transaction.recipient || '-')
                              : (transaction.vendor || '-')}
                          </TableCell>
                          <TableCell>{transaction.referenceNumber || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditIncomeExpense(transaction)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteIncomeExpense(transaction.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            Tidak ada data transaksi
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {incomeExpenseData && incomeExpenseData.total > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={incomeExpenseData.total || 0}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Summary Cards */}
            {scholarshipStatistics && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Total Beasiswa</div>
                  <div className="text-2xl font-bold text-blue-700 mt-1">
                    {scholarshipStatistics.total}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Aktif</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    {scholarshipStatistics.active}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm text-orange-600 font-medium">Berakhir</div>
                  <div className="text-2xl font-bold text-orange-700 mt-1">
                    {scholarshipStatistics.expired}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">Total Nilai</div>
                  <div className="text-2xl font-bold text-purple-700 mt-1">
                    Rp {scholarshipStatistics.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            )}

            {scholarshipsLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Tanggal Mulai</TableHead>
                        <TableHead>Tanggal Berakhir</TableHead>
                        <TableHead>Sponsor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((scholarship: Scholarship) => (
                        <TableRow key={scholarship.id}>
                          <TableCell className="font-medium">
                            {scholarship.student?.name || `Siswa #${scholarship.studentId}`}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {scholarship.scholarshipType === 'full' ? 'Beasiswa Penuh' :
                               scholarship.scholarshipType === 'partial' ? 'Beasiswa Parsial' :
                               scholarship.scholarshipType === 'tuition' ? 'Bebas SPP' :
                               scholarship.scholarshipType === 'book' ? 'Bantuan Buku' :
                               scholarship.scholarshipType === 'uniform' ? 'Bantuan Seragam' :
                               scholarship.scholarshipType === 'transport' ? 'Bantuan Transport' :
                               scholarship.scholarshipType === 'meal' ? 'Bantuan Makan' :
                               'Bantuan Lainnya'}
                            </span>
                          </TableCell>
                          <TableCell>{scholarship.title}</TableCell>
                          <TableCell>
                            {scholarship.amount ? (
                              <span className="font-semibold text-green-600">
                                Rp {scholarship.amount.toLocaleString('id-ID')}
                              </span>
                            ) : scholarship.percentage ? (
                              <span className="font-semibold text-blue-600">
                                {scholarship.percentage}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(scholarship.startDate)}</TableCell>
                          <TableCell>{scholarship.endDate ? formatDate(scholarship.endDate) : '-'}</TableCell>
                          <TableCell>{scholarship.sponsor || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              scholarship.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : scholarship.status === 'expired'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {scholarship.status === 'active' ? 'Aktif' :
                               scholarship.status === 'expired' ? 'Berakhir' :
                               'Dibatalkan'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditScholarship(scholarship)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteScholarship(scholarship.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            Tidak ada data beasiswa
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {scholarshipsData && scholarshipsData.total > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={scholarshipsData.total || 0}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (activeTab === 'spp') {
              resetForm();
            } else if (activeTab === 'savings') {
              resetSavingsForm();
            } else if (activeTab === 'other-bills') {
              resetOtherBillForm();
            } else if (activeTab === 'income-expense') {
              resetIncomeExpenseForm();
            } else {
              resetScholarshipForm();
            }
          }}
          title={
            activeTab === 'spp'
              ? (selectedSPP ? 'Edit SPP' : 'Tambah SPP')
              : activeTab === 'savings'
              ? (selectedSavings ? 'Edit Transaksi Tabungan' : 'Tambah Transaksi Tabungan')
              : activeTab === 'other-bills'
              ? (selectedOtherBill ? 'Edit Tagihan' : 'Tambah Tagihan')
              : activeTab === 'income-expense'
              ? (selectedIncomeExpense ? 'Edit Transaksi' : 'Tambah Transaksi')
              : (selectedScholarship ? 'Edit Beasiswa' : 'Tambah Beasiswa')
          }
          size="lg"
        >
          {activeTab === 'spp' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="0">Pilih Siswa</option>
                  {studentsData?.data?.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {MONTHS.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jatuh Tempo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedSPP ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
          ) : activeTab === 'savings' ? (
            <form onSubmit={handleSubmitSavings} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Siswa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={savingsFormData.studentId}
                    onChange={(e) => setSavingsFormData({ ...savingsFormData, studentId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="0">Pilih Siswa</option>
                    {studentsData?.data?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Transaksi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={savingsFormData.transactionType}
                    onChange={(e) => setSavingsFormData({ ...savingsFormData, transactionType: e.target.value as 'deposit' | 'withdrawal' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="deposit">Setoran</option>
                    <option value="withdrawal">Penarikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={savingsFormData.amount}
                    onChange={(e) => setSavingsFormData({ ...savingsFormData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={savingsFormData.description}
                    onChange={(e) => setSavingsFormData({ ...savingsFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Keterangan transaksi (opsional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Kwitansi</label>
                  <input
                    type="text"
                    value={savingsFormData.receiptNumber}
                    onChange={(e) => setSavingsFormData({ ...savingsFormData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nomor kwitansi (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetSavingsForm();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={createSavingsMutation.isPending || updateSavingsMutation.isPending}
                >
                  {selectedSavings ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          ) : activeTab === 'other-bills' ? (
            <form onSubmit={handleSubmitOtherBill} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Siswa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={otherBillFormData.studentId}
                    onChange={(e) => setOtherBillFormData({ ...otherBillFormData, studentId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="0">Pilih Siswa</option>
                    {studentsData?.data?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={otherBillFormData.category}
                    onChange={(e) => setOtherBillFormData({ ...otherBillFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="exam">Ujian</option>
                    <option value="activity">Kegiatan</option>
                    <option value="uniform">Seragam</option>
                    <option value="book">Buku</option>
                    <option value="osis">Iuran OSIS</option>
                    <option value="practicum">Praktikum</option>
                    <option value="field_trip">Study Tour</option>
                    <option value="graduation">Wisuda</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Tagihan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otherBillFormData.title}
                    onChange={(e) => setOtherBillFormData({ ...otherBillFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Ujian Semester Genap"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={otherBillFormData.description}
                    onChange={(e) => setOtherBillFormData({ ...otherBillFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Keterangan tagihan (opsional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={otherBillFormData.amount}
                      onChange={(e) => setOtherBillFormData({ ...otherBillFormData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jatuh Tempo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={otherBillFormData.dueDate}
                      onChange={(e) => setOtherBillFormData({ ...otherBillFormData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={otherBillFormData.notes}
                    onChange={(e) => setOtherBillFormData({ ...otherBillFormData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetOtherBillForm();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={createOtherBillMutation.isPending || updateOtherBillMutation.isPending}
                >
                  {selectedOtherBill ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          ) : activeTab === 'income-expense' ? (
            <form onSubmit={handleSubmitIncomeExpense} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Transaksi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={incomeExpenseFormData.transactionType}
                    onChange={(e) => {
                      const newType = e.target.value as 'income' | 'expense';
                      setIncomeExpenseFormData({
                        ...incomeExpenseFormData,
                        transactionType: newType,
                        category: newType === 'income' ? 'donation' : 'operational',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={incomeExpenseFormData.category}
                    onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {incomeExpenseFormData.transactionType === 'income' ? (
                      <>
                        <option value="donation">Donasi</option>
                        <option value="sponsor">Sponsor</option>
                        <option value="activity_revenue">Hasil Kegiatan</option>
                        <option value="tuition">Uang Pangkal/SPP</option>
                        <option value="grant">Bantuan Pemerintah</option>
                        <option value="other_income">Pemasukan Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="salary">Gaji</option>
                        <option value="operational">Operasional</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="utilities">Listrik, Air, Internet</option>
                        <option value="supplies">Perlengkapan</option>
                        <option value="activity">Kegiatan</option>
                        <option value="facility">Fasilitas</option>
                        <option value="other_expense">Pengeluaran Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={incomeExpenseFormData.title}
                    onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Donasi dari PT ABC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={incomeExpenseFormData.description}
                    onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Keterangan transaksi (opsional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={incomeExpenseFormData.amount}
                      onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={incomeExpenseFormData.transactionDate}
                      onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, transactionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {incomeExpenseFormData.transactionType === 'income' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Penerima</label>
                      <input
                        type="text"
                        value={incomeExpenseFormData.recipient}
                        onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, recipient: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama penerima (opsional)"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Supplier</label>
                      <input
                        type="text"
                        value={incomeExpenseFormData.vendor}
                        onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, vendor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama vendor (opsional)"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Referensi</label>
                    <input
                      type="text"
                      value={incomeExpenseFormData.referenceNumber}
                      onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, referenceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="No. invoice/kwitansi (opsional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={incomeExpenseFormData.notes}
                    onChange={(e) => setIncomeExpenseFormData({ ...incomeExpenseFormData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetIncomeExpenseForm();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={createIncomeExpenseMutation.isPending || updateIncomeExpenseMutation.isPending}
                >
                  {selectedIncomeExpense ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitScholarship} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Siswa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scholarshipFormData.studentId}
                    onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, studentId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="0">Pilih Siswa</option>
                    {studentsData?.data?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Beasiswa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scholarshipFormData.scholarshipType}
                    onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, scholarshipType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="full">Beasiswa Penuh</option>
                    <option value="partial">Beasiswa Parsial</option>
                    <option value="tuition">Bebas SPP</option>
                    <option value="book">Bantuan Buku</option>
                    <option value="uniform">Bantuan Seragam</option>
                    <option value="transport">Bantuan Transport</option>
                    <option value="meal">Bantuan Makan</option>
                    <option value="other">Bantuan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Beasiswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scholarshipFormData.title}
                    onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Beasiswa Prestasi 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={scholarshipFormData.description}
                    onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi beasiswa (opsional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={scholarshipFormData.amount || ''}
                      onChange={(e) => setScholarshipFormData({ 
                        ...scholarshipFormData, 
                        amount: e.target.value ? parseFloat(e.target.value) : undefined,
                        percentage: undefined,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jumlah beasiswa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Persentase (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={scholarshipFormData.percentage || ''}
                      onChange={(e) => setScholarshipFormData({ 
                        ...scholarshipFormData, 
                        percentage: e.target.value ? parseFloat(e.target.value) : undefined,
                        amount: undefined,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Persentase beasiswa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={scholarshipFormData.startDate}
                      onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir</label>
                    <input
                      type="date"
                      value={scholarshipFormData.endDate || ''}
                      onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, endDate: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={scholarshipFormData.status}
                      onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="expired">Berakhir</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor/Pemberi</label>
                    <input
                      type="text"
                      value={scholarshipFormData.sponsor || ''}
                      onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, sponsor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama sponsor/pemberi (opsional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Syarat Beasiswa</label>
                  <textarea
                    value={scholarshipFormData.requirements || ''}
                    onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, requirements: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Syarat dan ketentuan beasiswa (opsional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={scholarshipFormData.notes || ''}
                    onChange={(e) => setScholarshipFormData({ ...scholarshipFormData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetScholarshipForm();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  loading={createScholarshipMutation.isPending || updateScholarshipMutation.isPending}
                >
                  {selectedScholarship ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Reminder Modal */}
        <Modal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          title="Reminder Pembayaran"
          size="lg"
        >
          {paymentReminders ? (
            <div className="space-y-6">
              {/* Overdue Section */}
              {paymentReminders.overdue.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    Terlambat ({paymentReminders.overdue.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {paymentReminders.overdue.map((reminder) => (
                      <div
                        key={`${reminder.type}-${reminder.id}`}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{reminder.title}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {reminder.student?.name || `Siswa #${reminder.studentId}`}
                            </div>
                            <div className="text-xs text-red-600 mt-1">
                              Jatuh tempo: {formatDate(reminder.dueDate)} ({Math.abs(reminder.daysUntilDue)} hari terlambat)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-red-600">
                              Rp {reminder.amount.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Total: Rp {paymentReminders.summary.overdueTotal.toLocaleString('id-ID')}
                  </div>
                </div>
              )}

              {/* Upcoming Section */}
              {paymentReminders.upcoming.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">
                    Akan Jatuh Tempo ({paymentReminders.upcoming.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {paymentReminders.upcoming.map((reminder) => (
                      <div
                        key={`${reminder.type}-${reminder.id}`}
                        className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{reminder.title}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {reminder.student?.name || `Siswa #${reminder.studentId}`}
                            </div>
                            <div className="text-xs text-orange-600 mt-1">
                              Jatuh tempo: {formatDate(reminder.dueDate)} ({reminder.daysUntilDue} hari lagi)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-orange-600">
                              Rp {reminder.amount.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Total: Rp {paymentReminders.summary.upcomingTotal.toLocaleString('id-ID')}
                  </div>
                </div>
              )}

              {paymentReminders.overdue.length === 0 && paymentReminders.upcoming.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada reminder pembayaran
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setIsReminderModalOpen(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">Memuat reminder...</div>
          )}
        </Modal>
      </div>
    </TenantLayout>
  );
}

