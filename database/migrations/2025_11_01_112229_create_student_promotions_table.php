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
        Schema::create('student_promotions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('from_class_id')->nullable();
            $table->unsignedBigInteger('to_class_id')->nullable();
            $table->unsignedBigInteger('from_academic_year_id');
            $table->unsignedBigInteger('to_academic_year_id');
            $table->integer('semester'); // 1 = Ganjil, 2 = Genap (biasanya naik kelas di semester genap)
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])->default('pending');
            $table->enum('type', ['promotion', 'repeat', 'transfer'])->default('promotion'); // naik kelas, tidak naik kelas, pindah kelas
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('final_average', 5, 2)->nullable(); // rata-rata nilai akhir untuk pertimbangan
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('instansi_id');
            $table->timestamps();
            
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('from_class_id')->references('id')->on('class_rooms')->onDelete('set null');
            $table->foreign('to_class_id')->references('id')->on('class_rooms')->onDelete('set null');
            $table->foreign('from_academic_year_id')->references('id')->on('academic_years')->onDelete('cascade');
            $table->foreign('to_academic_year_id')->references('id')->on('academic_years')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            
            $table->index(['instansi_id', 'status']);
            $table->index(['student_id', 'from_academic_year_id']);
            $table->index(['to_academic_year_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_promotions');
    }
};
