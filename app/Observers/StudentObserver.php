<?php

namespace App\Observers;

use App\Models\Tenant\Student;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Log;

class StudentObserver
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Handle the Student "created" event.
     */
    public function created(Student $student): void
    {
        $this->updateSubscription($student);
    }

    /**
     * Handle the Student "deleted" event.
     */
    public function deleted(Student $student): void
    {
        $this->updateSubscription($student);
    }

    /**
     * Handle the Student "restored" event.
     */
    public function restored(Student $student): void
    {
        $this->updateSubscription($student);
    }

    /**
     * Update subscription based on student count
     */
    protected function updateSubscription(Student $student): void
    {
        try {
            $tenant = $student->tenant ?? \App\Models\Core\Tenant::find($student->instansi_id);
            
            if (!$tenant) {
                return;
            }

            // Get current student count
            $studentCount = \App\Models\Tenant\Student::where('instansi_id', $tenant->id)->count();
            
            // Update subscription
            $this->subscriptionService->updateStudentCount($tenant, $studentCount);
        } catch (\Exception $e) {
            Log::error('Failed to update subscription after student change', [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

