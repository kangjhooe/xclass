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
        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('subscription_plan_id')->constrained('subscription_plans')->onDelete('restrict');
            
            // Student count tracking
            $table->integer('student_count_at_billing')->default(0); // Jumlah siswa saat billing terakhir
            $table->integer('current_student_count')->default(0); // Jumlah siswa saat ini
            $table->integer('pending_student_increase')->default(0); // Penambahan siswa yang belum ditagih
            
            // Billing information
            $table->decimal('current_billing_amount', 12, 2)->default(0); // Biaya tahun ini
            $table->decimal('next_billing_amount', 12, 2)->default(0); // Biaya tahun depan (termasuk pending)
            $table->enum('billing_cycle', ['yearly', 'monthly'])->default('yearly');
            $table->enum('status', ['active', 'expired', 'suspended', 'cancelled'])->default('active');
            
            // Dates
            $table->date('start_date');
            $table->date('end_date');
            $table->date('next_billing_date')->nullable();
            $table->date('last_billing_date')->nullable();
            
            // Payment tracking
            $table->boolean('is_paid')->default(false);
            $table->date('paid_at')->nullable();
            $table->text('payment_notes')->nullable();
            
            // Metadata
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['tenant_id', 'status']);
            $table->index('next_billing_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_subscriptions');
    }
};

