<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\SubscriptionBillingHistory;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Display list of all tenant subscriptions
     */
    public function index(Request $request)
    {
        $query = TenantSubscription::with(['tenant', 'subscriptionPlan']);

        // Filter by plan
        if ($request->filled('plan_id')) {
            $query->where('subscription_plan_id', $request->plan_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            if ($request->payment_status === 'paid') {
                $query->where('is_paid', true);
            } else {
                $query->where('is_paid', false);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('tenant', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('npsn', 'like', "%{$search}%");
            });
        }

        $subscriptions = $query->orderBy('created_at', 'desc')->paginate(20);
        $plans = SubscriptionPlan::active()->orderBy('sort_order')->get();

        // Statistics
        $stats = [
            'total' => TenantSubscription::count(),
            'active' => TenantSubscription::where('status', 'active')->count(),
            'expired' => TenantSubscription::where('status', 'expired')->count(),
            'unpaid' => TenantSubscription::where('is_paid', false)->where('status', 'active')->count(),
            'total_revenue' => TenantSubscription::where('is_paid', true)->sum('current_billing_amount'),
        ];

        return view('admin.subscriptions.index', compact('subscriptions', 'plans', 'stats'));
    }

    /**
     * Show subscription details for a tenant
     */
    public function show(Tenant $tenant)
    {
        $subscription = $tenant->subscription;
        
        if (!$subscription) {
            // Create initial subscription
            $subscription = $this->subscriptionService->createInitialSubscription($tenant);
        }

        $billingHistory = $subscription->billingHistory()
            ->orderBy('billing_date', 'desc')
            ->paginate(10);

        $summary = $this->subscriptionService->getBillingSummary($tenant);

        return view('admin.subscriptions.show', compact('tenant', 'subscription', 'billingHistory', 'summary'));
    }

    /**
     * Update student count manually
     */
    public function updateStudentCount(Request $request, Tenant $tenant)
    {
        $request->validate([
            'student_count' => 'required|integer|min:0',
        ]);

        $result = $this->subscriptionService->updateStudentCount($tenant, $request->student_count);

        $message = 'Jumlah siswa berhasil diperbarui.';
        
        if ($result['tier_changed']) {
            $message .= " Tier berubah ke {$result['new_plan']->name}.";
        }
        
        if ($result['threshold_met'] && !$result['tier_changed']) {
            $message .= " Threshold tercapai. Tagihan tambahan telah dibuat.";
        }

        return redirect()->route('admin.subscriptions.show', $tenant)
            ->with('success', $message);
    }

    /**
     * Process subscription renewal
     */
    public function processRenewal(TenantSubscription $subscription)
    {
        try {
            $billingHistory = $this->subscriptionService->processRenewal($subscription);

            return redirect()->route('admin.subscriptions.show', $subscription->tenant)
                ->with('success', 'Renewal berhasil diproses. Invoice: ' . $billingHistory->invoice_number);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal memproses renewal: ' . $e->getMessage());
        }
    }

    /**
     * Mark billing as paid
     */
    public function markAsPaid(Request $request, SubscriptionBillingHistory $billingHistory)
    {
        $request->validate([
            'payment_notes' => 'nullable|string|max:500',
        ]);

        $billingHistory->markAsPaid($request->payment_notes);

        return redirect()->back()
            ->with('success', 'Pembayaran berhasil dicatat.');
    }

    /**
     * Get subscription statistics
     */
    public function statistics()
    {
        $stats = [
            'by_plan' => TenantSubscription::select('subscription_plan_id', DB::raw('count(*) as total'))
                ->with('subscriptionPlan')
                ->groupBy('subscription_plan_id')
                ->get(),
            'revenue_by_plan' => TenantSubscription::select('subscription_plan_id', DB::raw('sum(current_billing_amount) as revenue'))
                ->where('is_paid', true)
                ->with('subscriptionPlan')
                ->groupBy('subscription_plan_id')
                ->get(),
            'upcoming_renewals' => TenantSubscription::where('status', 'active')
                ->where('next_billing_date', '<=', now()->addDays(30))
                ->with(['tenant', 'subscriptionPlan'])
                ->orderBy('next_billing_date')
                ->get(),
        ];

        return view('admin.subscriptions.statistics', compact('stats'));
    }
}

