<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            // Trial period fields
            $table->boolean('is_trial')->default(false)->after('status');
            $table->date('trial_start_date')->nullable()->after('is_trial');
            $table->date('trial_end_date')->nullable()->after('trial_start_date');
            
            // Warning notification tracking
            $table->boolean('warning_sent')->default(false)->after('trial_end_date');
            $table->date('warning_sent_at')->nullable()->after('warning_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'is_trial',
                'trial_start_date',
                'trial_end_date',
                'warning_sent',
                'warning_sent_at',
            ]);
        });
    }
};

