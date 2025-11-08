<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Core\Tenant;
use App\Services\TenantOnboardingService;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class TenantOnboardingController extends Controller
{
    protected TenantOnboardingService $onboardingService;

    public function __construct(TenantOnboardingService $onboardingService)
    {
        $this->onboardingService = $onboardingService;
    }

    /**
     * Show onboarding wizard for tenant
     */
    public function show(Tenant $tenant): View
    {
        // Initialize steps if not exists
        if ($tenant->onboardingSteps()->count() === 0) {
            $this->onboardingService->initializeSteps($tenant);
        }

        $steps = $this->onboardingService->getSteps($tenant);
        $currentStep = $this->onboardingService->getCurrentStep($tenant);
        $progress = $this->onboardingService->getProgressPercentage($tenant);
        $isCompleted = $this->onboardingService->isCompleted($tenant);

        return view('admin.tenants.onboarding', compact('tenant', 'steps', 'currentStep', 'progress', 'isCompleted'));
    }

    /**
     * Complete a step
     */
    public function completeStep(Request $request, Tenant $tenant, string $stepKey): RedirectResponse
    {
        $request->validate([
            'data' => 'nullable|array',
        ]);

        $this->onboardingService->completeStep($tenant, $stepKey, $request->input('data', []));

        return redirect()->route('admin.tenants.onboarding', $tenant)
            ->with('success', 'Step berhasil diselesaikan');
    }

    /**
     * Start onboarding for tenant
     */
    public function start(Tenant $tenant): RedirectResponse
    {
        $this->onboardingService->initializeSteps($tenant);

        return redirect()->route('admin.tenants.onboarding', $tenant)
            ->with('success', 'Onboarding dimulai');
    }

    /**
     * Reset onboarding for tenant
     */
    public function reset(Tenant $tenant): RedirectResponse
    {
        $tenant->onboardingSteps()->delete();
        $this->onboardingService->initializeSteps($tenant);

        return redirect()->route('admin.tenants.onboarding', $tenant)
            ->with('success', 'Onboarding direset');
    }
}

