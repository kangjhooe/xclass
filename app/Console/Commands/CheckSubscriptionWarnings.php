<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TenantSubscription;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Log;

class CheckSubscriptionWarnings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:check-warnings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and send warnings for subscriptions ending soon (7 days before)';

    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        parent::__construct();
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking subscriptions for warnings...');

        // Get subscriptions that need warning
        $subscriptions = TenantSubscription::where('status', 'active')
            ->whereHas('subscriptionPlan', function($q) {
                $q->where('is_free', false); // Exclude Basic (free) plans
            })
            ->get()
            ->filter(function($subscription) {
                return $subscription->shouldSendWarning();
            });

        $count = 0;

        foreach ($subscriptions as $subscription) {
            try {
                $this->sendWarning($subscription);
                $subscription->markWarningSent();
                $count++;
                
                $this->info("Warning sent for tenant: {$subscription->tenant->name}");
            } catch (\Exception $e) {
                $this->error("Failed to send warning for tenant {$subscription->tenant->name}: " . $e->getMessage());
                Log::error('Failed to send subscription warning', [
                    'subscription_id' => $subscription->id,
                    'tenant_id' => $subscription->tenant_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Total warnings sent: {$count}");
        
        return Command::SUCCESS;
    }

    /**
     * Send warning notification to tenant
     */
    protected function sendWarning(TenantSubscription $subscription): void
    {
        $tenant = $subscription->tenant;
        $plan = $subscription->subscriptionPlan;
        
        $endDate = $subscription->effective_end_date;
        $daysLeft = $subscription->days_until_effective_end;
        
        $message = $this->buildWarningMessage($subscription, $daysLeft, $endDate);
        
        // Log warning (will be replaced with actual notification system)
        Log::info('Subscription warning sent', [
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'days_left' => $daysLeft,
            'message' => $message,
        ]);
        
        // TODO: Implement actual notification
        // - Send email to tenant admin
        // - Send in-app notification
        // - Send SMS (optional)
    }

    /**
     * Build warning message
     */
    protected function buildWarningMessage(TenantSubscription $subscription, int $daysLeft, $endDate): string
    {
        $tenant = $subscription->tenant;
        $plan = $subscription->subscriptionPlan;
        
        if ($subscription->is_trial) {
            return sprintf(
                "PERINGATAN: Trial period Anda akan berakhir dalam %d hari (%s). " .
                "Setelah trial berakhir, subscription akan dikenakan biaya sebesar Rp %s per tahun. " .
                "Silakan siapkan pembayaran untuk melanjutkan layanan.",
                $daysLeft,
                $endDate->format('d-m-Y'),
                number_format($subscription->next_billing_amount, 0, ',', '.')
            );
        } else {
            return sprintf(
                "PERINGATAN: Subscription Anda akan berakhir dalam %d hari (%s). " .
                "Biaya renewal: Rp %s per tahun. " .
                "Silakan lakukan pembayaran untuk memperpanjang subscription.",
                $daysLeft,
                $endDate->format('d-m-Y'),
                number_format($subscription->next_billing_amount, 0, ',', '.')
            );
        }
    }
}

