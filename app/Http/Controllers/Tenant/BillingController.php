<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Display billing dashboard for tenant
     */
    public function index()
    {
        try {
            $tenant = tenant();
        } catch (\Exception $e) {
            abort(404, 'Tenant not found');
        }

        $summary = $this->subscriptionService->getBillingSummary($tenant);
        
        $subscription = null;
        $billingHistory = collect();
        
        if (!$summary['has_subscription']) {
            // Create initial subscription
            $subscription = $this->subscriptionService->createInitialSubscription($tenant);
            $summary = $this->subscriptionService->getBillingSummary($tenant);
        }

        $subscription = $tenant->subscription;
        
        if ($subscription) {
            $billingHistory = $subscription->billingHistory()
                ->orderBy('billing_date', 'desc')
                ->take(10)
                ->get();
        }

        return view('tenant.billing.index', compact('summary', 'subscription', 'billingHistory'));
    }

    /**
     * Show billing history
     */
    public function history()
    {
        try {
            $tenant = tenant();
        } catch (\Exception $e) {
            abort(404, 'Tenant not found');
        }
        
        $subscription = $tenant->subscription;
        
        if (!$subscription) {
            return redirect()->route('tenant.billing.index')
                ->with('error', 'Subscription tidak ditemukan');
        }

        $billingHistory = $subscription->billingHistory()
            ->orderBy('billing_date', 'desc')
            ->paginate(20);

        return view('tenant.billing.history', compact('subscription', 'billingHistory'));
    }
}

