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
        Schema::create('subscription_billing_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_subscription_id')->constrained('tenant_subscriptions')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            // Billing details
            $table->integer('student_count');
            $table->integer('previous_student_count')->nullable();
            $table->decimal('billing_amount', 12, 2);
            $table->decimal('previous_billing_amount')->nullable();
            $table->enum('billing_type', ['initial', 'renewal', 'adjustment', 'threshold_met'])->default('renewal');
            
            // Threshold tracking
            $table->integer('pending_increase_before')->default(0);
            $table->integer('pending_increase_after')->default(0);
            $table->boolean('threshold_triggered')->default(false);
            
            // Dates
            $table->date('billing_date');
            $table->date('period_start');
            $table->date('period_end');
            
            // Payment
            $table->boolean('is_paid')->default(false);
            $table->date('paid_at')->nullable();
            $table->text('invoice_number')->nullable();
            $table->text('payment_notes')->nullable();
            
            // Metadata
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['tenant_id', 'billing_date']);
            $table->index('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_billing_history');
    }
};

