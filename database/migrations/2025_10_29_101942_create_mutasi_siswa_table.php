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
        Schema::create('mutasi_siswa', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('from_tenant_id');
            $table->unsignedBigInteger('to_tenant_id');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->text('reason')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->json('student_data')->nullable(); // Store student data snapshot
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['from_tenant_id', 'status']);
            $table->index(['to_tenant_id', 'status']);
            $table->index(['status', 'created_at']);

            // Foreign key constraints
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('from_tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('to_tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mutasi_siswa');
    }
};
