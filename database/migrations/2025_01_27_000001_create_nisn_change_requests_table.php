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
        Schema::create('nisn_change_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('instansi_id'); // Tenant yang mengajukan
            $table->string('old_nisn')->nullable(); // NISN lama
            $table->string('new_nisn'); // NISN baru yang diajukan
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reason')->nullable(); // Alasan perubahan NISN
            $table->text('rejection_reason')->nullable(); // Alasan penolakan
            $table->unsignedBigInteger('requested_by'); // User yang mengajukan (admin tenant)
            $table->unsignedBigInteger('processed_by')->nullable(); // Super admin yang approve/reject
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['instansi_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('new_nisn'); // Untuk validasi unik

            // Foreign key constraints
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nisn_change_requests');
    }
};

