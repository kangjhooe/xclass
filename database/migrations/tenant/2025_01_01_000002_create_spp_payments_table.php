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
        Schema::create('spp_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->unsignedBigInteger('student_id');
            $table->string('payment_period');
            $table->integer('payment_year');
            $table->integer('payment_month');
            $table->decimal('amount', 15, 2);
            $table->date('due_date');
            $table->datetime('paid_date')->nullable();
            $table->enum('payment_method', ['cash', 'transfer', 'qris', 'edc', 'virtual_account'])->nullable();
            $table->string('payment_reference')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'overdue', 'cancelled'])->default('pending');
            $table->text('payment_notes')->nullable();
            $table->string('receipt_number')->nullable();
            $table->string('receipt_file')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->datetime('verified_at')->nullable();
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index(['instansi_id', 'payment_status']);
            $table->index(['instansi_id', 'payment_year', 'payment_month']);
            $table->index(['student_id', 'payment_year']);
            $table->unique(['student_id', 'payment_year', 'payment_month'], 'unique_student_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spp_payments');
    }
};
