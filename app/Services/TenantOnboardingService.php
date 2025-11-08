<?php

namespace App\Services;

use App\Models\Core\Tenant;
use App\Models\Core\TenantOnboardingStep;
use Illuminate\Support\Facades\DB;

class TenantOnboardingService
{
    /**
     * Available onboarding steps
     */
    protected array $steps = [
        'basic_info' => [
            'name' => 'Informasi Dasar',
            'description' => 'Isi informasi dasar tentang sekolah/madrasah',
        ],
        'admin_setup' => [
            'name' => 'Setup Admin',
            'description' => 'Buat akun admin pertama untuk tenant',
        ],
        'data_import' => [
            'name' => 'Import Data',
            'description' => 'Import data siswa, guru, dan kelas (opsional)',
        ],
        'configuration' => [
            'name' => 'Konfigurasi',
            'description' => 'Konfigurasi sistem dan pengaturan awal',
        ],
        'branding' => [
            'name' => 'Branding',
            'description' => 'Upload logo dan kustomisasi tampilan',
        ],
        'completion' => [
            'name' => 'Selesai',
            'description' => 'Review dan selesaikan proses onboarding',
        ],
    ];

    /**
     * Initialize onboarding steps for a tenant
     */
    public function initializeSteps(Tenant $tenant): void
    {
        foreach ($this->steps as $stepKey => $stepData) {
            TenantOnboardingStep::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'step_key' => $stepKey,
                ],
                [
                    'step_name' => $stepData['name'],
                    'status' => 'pending',
                ]
            );
        }
    }

    /**
     * Get onboarding steps for a tenant
     */
    public function getSteps(Tenant $tenant)
    {
        return $tenant->onboardingSteps()->orderByRaw("
            CASE step_key
                WHEN 'basic_info' THEN 1
                WHEN 'admin_setup' THEN 2
                WHEN 'data_import' THEN 3
                WHEN 'configuration' THEN 4
                WHEN 'branding' THEN 5
                WHEN 'completion' THEN 6
            END
        ")->get();
    }

    /**
     * Get current step for a tenant
     */
    public function getCurrentStep(Tenant $tenant): ?TenantOnboardingStep
    {
        return $tenant->onboardingSteps()
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderByRaw("
                CASE step_key
                    WHEN 'basic_info' THEN 1
                    WHEN 'admin_setup' THEN 2
                    WHEN 'data_import' THEN 3
                    WHEN 'configuration' THEN 4
                    WHEN 'branding' THEN 5
                    WHEN 'completion' THEN 6
                END
            ")
            ->first();
    }

    /**
     * Complete a step
     */
    public function completeStep(Tenant $tenant, string $stepKey, array $data = []): void
    {
        $step = $tenant->onboardingSteps()->where('step_key', $stepKey)->first();
        
        if ($step) {
            $step->update([
                'status' => 'completed',
                'data' => $data,
                'completed_at' => now(),
            ]);
        }
    }

    /**
     * Get onboarding progress percentage
     */
    public function getProgressPercentage(Tenant $tenant): float
    {
        $totalSteps = count($this->steps);
        $completedSteps = $tenant->onboardingSteps()
            ->where('status', 'completed')
            ->count();
        
        return ($completedSteps / $totalSteps) * 100;
    }

    /**
     * Check if onboarding is completed
     */
    public function isCompleted(Tenant $tenant): bool
    {
        $totalSteps = count($this->steps);
        $completedSteps = $tenant->onboardingSteps()
            ->where('status', 'completed')
            ->count();
        
        return $completedSteps === $totalSteps;
    }
}

