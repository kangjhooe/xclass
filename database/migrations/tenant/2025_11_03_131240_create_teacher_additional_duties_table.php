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
        Schema::create('teacher_additional_duties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('additional_duty_id')->constrained('additional_duties')->onDelete('cascade');
            $table->date('assigned_date')->nullable(); // Tanggal penugasan
            $table->date('end_date')->nullable(); // Tanggal akhir penugasan (untuk riwayat)
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Satu guru bisa memiliki tugas yang sama hanya sekali (tapi bisa nonaktif dan aktif lagi)
            $table->unique(['teacher_id', 'additional_duty_id', 'is_active'], 'unique_active_duty');
            $table->index(['teacher_id', 'is_active']);
            $table->index(['additional_duty_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_additional_duties');
    }
};
