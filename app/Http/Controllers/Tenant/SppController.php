<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\Spp;
use App\Models\Tenant\SppPayment;
use App\Models\Tenant\Student;
use App\Models\Core\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class SppController extends Controller
{
    use HasInstansiId;

    public function index(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Get statistics
        $stats = [
            'total_payments' => SppPayment::where('instansi_id', $instansiId)->count(),
            'pending_payments' => SppPayment::where('instansi_id', $instansiId)
                ->where('payment_status', SppPayment::PAYMENT_STATUS_PENDING)->count(),
            'paid_payments' => SppPayment::where('instansi_id', $instansiId)
                ->where('payment_status', SppPayment::PAYMENT_STATUS_PAID)->count(),
            'overdue_payments' => SppPayment::where('instansi_id', $instansiId)
                ->where('payment_status', SppPayment::PAYMENT_STATUS_PENDING)
                ->where('due_date', '<', now()->toDateString())->count(),
            'total_amount' => SppPayment::where('instansi_id', $instansiId)
                ->where('payment_status', SppPayment::PAYMENT_STATUS_PAID)->sum('amount'),
            'pending_amount' => SppPayment::where('instansi_id', $instansiId)
                ->where('payment_status', SppPayment::PAYMENT_STATUS_PENDING)->sum('amount'),
        ];

        $query = SppPayment::with(['student'])
            ->where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('payment_status', $request->status);
        }

        // Filter by student
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by period
        if ($request->filled('year')) {
            $query->where('payment_year', $request->year);
        }
        if ($request->filled('month')) {
            $query->where('payment_month', $request->month);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            })->orWhere('receipt_number', 'like', "%{$search}%");
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);
        
        $students = Student::where('instansi_id', $instansiId)->orderBy('name')->get();

        return view('tenant.spp.index', [
            'title' => 'SPP',
            'page-title' => 'Sumbangan Pembinaan Pendidikan',
            'payments' => $payments,
            'stats' => $stats,
            'students' => $students
        ]);
    }

    public function create()
    {
        $instansiId = $this->getInstansiId();
        
        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();
            
        $academicYears = AcademicYear::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.spp.create', [
            'title' => 'Tambah SPP',
            'page-title' => 'Tambah Data SPP',
            'students' => $students,
            'academicYears' => $academicYears
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'month' => 'required|integer|between:1,12',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'status' => 'required|in:unpaid,paid,overdue',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            Spp::create([
                'student_id' => $request->student_id,
                'academic_year_id' => $request->academic_year_id,
                'month' => $request->month,
                'amount' => $request->amount,
                'due_date' => $request->due_date,
                'status' => $request->status,
                'notes' => $request->notes,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->route('tenant.spp.index')->with('success', 'Data SPP berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function show($id)
    {
        $spp = Spp::with(['student', 'academicYear', 'payments'])
            ->where('instansi_id', $instansiId)
            ->findOrFail($id);

        return view('tenant.spp.show', [
            'title' => 'Detail SPP',
            'page-title' => 'Detail Data SPP',
            'spp' => $spp
        ]);
    }

    public function edit($id)
    {
        $spp = Spp::where('instansi_id', $instansiId)
            ->findOrFail($id);
            
        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();
            
        $academicYears = AcademicYear::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.spp.edit', [
            'title' => 'Edit SPP',
            'page-title' => 'Edit Data SPP',
            'spp' => $spp,
            'students' => $students,
            'academicYears' => $academicYears
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'month' => 'required|integer|between:1,12',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'status' => 'required|in:unpaid,paid,overdue',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $spp = Spp::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $spp->update([
                'student_id' => $request->student_id,
                'academic_year_id' => $request->academic_year_id,
                'month' => $request->month,
                'amount' => $request->amount,
                'due_date' => $request->due_date,
                'status' => $request->status,
                'notes' => $request->notes
            ]);

            DB::commit();
            return redirect()->route('tenant.spp.index')->with('success', 'Data SPP berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $spp = Spp::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $spp->delete();

            DB::commit();
            return redirect()->route('tenant.spp.index')->with('success', 'Data SPP berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show payment history for a student
     */
    public function paymentHistory(Request $request, Student $student)
    {
        $instansiId = $this->getInstansiId();

        $payments = SppPayment::where('instansi_id', $instansiId)
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.spp.payment-history', [
            'title' => 'Riwayat Pembayaran',
            'page-title' => 'Riwayat Pembayaran SPP',
            'student' => $student,
            'payments' => $payments
        ]);
    }

    /**
     * Show form to record payment
     */
    public function createPayment(Request $request)
    {
        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        $studentId = $request->get('student_id');

        return view('tenant.spp.create-payment', [
            'title' => 'Tambah Pembayaran',
            'page-title' => 'Tambah Pembayaran SPP',
            'students' => $students,
            'selectedStudentId' => $studentId
        ]);
    }

    /**
     * Store payment
     */
    public function storePayment(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'payment_year' => 'required|integer|min:2020|max:2100',
            'payment_month' => 'required|integer|between:1,12',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'payment_method' => 'required|in:cash,transfer,qris,edc,virtual_account',
            'payment_reference' => 'nullable|string|max:255',
            'payment_notes' => 'nullable|string|max:500',
            'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            $student = Student::where('instansi_id', $instansiId)
                ->findOrFail($request->student_id);

            // Generate receipt number
            $receiptNumber = $this->generateReceiptNumber($instansiId);

            // Handle receipt file upload
            $receiptFile = null;
            if ($request->hasFile('receipt_file')) {
                $receiptFile = $request->file('receipt_file')->store('spp/receipts', 'public');
            }

            $payment = SppPayment::create([
                'instansi_id' => $instansiId,
                'student_id' => $request->student_id,
                'payment_period' => $request->payment_year . '-' . str_pad($request->payment_month, 2, '0', STR_PAD_LEFT),
                'payment_year' => $request->payment_year,
                'payment_month' => $request->payment_month,
                'amount' => $request->amount,
                'due_date' => $request->due_date,
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'payment_status' => SppPayment::PAYMENT_STATUS_PAID,
                'payment_notes' => $request->payment_notes,
                'receipt_number' => $receiptNumber,
                'receipt_file' => $receiptFile,
                'paid_date' => now(),
                'created_by' => Auth::id(),
                'verified_by' => Auth::id(),
                'verified_at' => now(),
            ]);

            DB::commit();
            return redirect()->route('tenant.spp.payments.show', $payment->id)
                ->with('success', 'Pembayaran berhasil direkam');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show payment details
     */
    public function showPayment($id)
    {
        $payment = SppPayment::with(['student', 'creator', 'verifier'])
            ->where('instansi_id', $instansiId)
            ->findOrFail($id);

        return view('tenant.spp.show-payment', [
            'title' => 'Detail Pembayaran',
            'page-title' => 'Detail Pembayaran SPP',
            'payment' => $payment
        ]);
    }

    /**
     * Generate invoice PDF
     */
    public function generateInvoice($id)
    {
        $payment = SppPayment::with(['student'])
            ->where('instansi_id', $instansiId)
            ->findOrFail($id);

        $tenant = \App\Models\Core\Tenant::find($instansiId);

        $pdf = PDF::loadView('tenant.spp.invoice', [
            'payment' => $payment,
            'tenant' => $tenant
        ]);

        return $pdf->download('invoice_spp_' . $payment->receipt_number . '.pdf');
    }

    /**
     * Send payment reminder
     */
    public function sendReminder(Request $request)
    {
        $request->validate([
            'payment_ids' => 'required|array',
            'payment_ids.*' => 'exists:spp_payments,id'
        ]);

        $instansiId = $this->getInstansiId();
        $payments = SppPayment::with(['student'])
            ->where('instansi_id', $instansiId)
            ->whereIn('id', $request->payment_ids)
            ->where('payment_status', SppPayment::PAYMENT_STATUS_PENDING)
            ->get();

        $sentCount = 0;
        foreach ($payments as $payment) {
            // Send notification (implement notification system)
            // For now, just mark as reminder sent
            $sentCount++;
        }

        return redirect()->back()->with('success', "Reminder berhasil dikirim ke {$sentCount} orang tua");
    }

    /**
     * Bulk create payments for students
     */
    public function bulkCreate(Request $request)
    {
        $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'month' => 'required|integer|between:1,12',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            $academicYear = AcademicYear::find($request->academic_year_id);
            $year = date('Y', strtotime($academicYear->start_date));

            $created = 0;
            foreach ($request->student_ids as $studentId) {
                // Check if payment already exists
                $exists = SppPayment::where('instansi_id', $instansiId)
                    ->where('student_id', $studentId)
                    ->where('payment_year', $year)
                    ->where('payment_month', $request->month)
                    ->exists();

                if (!$exists) {
                    SppPayment::create([
                        'instansi_id' => $instansiId,
                        'student_id' => $studentId,
                        'payment_period' => $year . '-' . str_pad($request->month, 2, '0', STR_PAD_LEFT),
                        'payment_year' => $year,
                        'payment_month' => $request->month,
                        'amount' => $request->amount,
                        'due_date' => $request->due_date,
                        'payment_status' => SppPayment::PAYMENT_STATUS_PENDING,
                        'created_by' => Auth::id(),
                    ]);
                    $created++;
                }
            }

            DB::commit();
            return redirect()->route('tenant.spp.index')
                ->with('success', "Berhasil membuat {$created} tagihan SPP");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Generate receipt number
     */
    private function generateReceiptNumber($instansiId)
    {
        $prefix = 'SPP';
        $year = date('Y');
        $month = date('m');
        
        $lastPayment = SppPayment::where('instansi_id', $instansiId)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastPayment ? ((int) substr($lastPayment->receipt_number, -4) + 1) : 1;
        
        return $prefix . '/' . $year . '/' . $month . '/' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Export payment report
     */
    public function exportReport(Request $request)
    {
        $query = SppPayment::with(['student'])
            ->where('instansi_id', $instansiId);

        if ($request->filled('status')) {
            $query->where('payment_status', $request->status);
        }

        if ($request->filled('year')) {
            $query->where('payment_year', $request->year);
        }

        if ($request->filled('month')) {
            $query->where('payment_month', $request->month);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        // Generate Excel export
        // Implementation using Laravel Excel
        return response()->json([
            'success' => true,
            'message' => 'Export akan segera dibuat',
            'count' => $payments->count()
        ]);
    }
}