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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->string('assignment_type'); // UTS, UAS, Tugas, Quiz, dll
            $table->string('assignment_name');
            $table->decimal('score', 5, 2); // 0.00 - 100.00
            $table->decimal('max_score', 5, 2)->default(100.00);
            $table->decimal('percentage', 5, 2)->nullable(); // Calculated percentage
            $table->string('grade_letter', 2)->nullable(); // A, B+, B, C+, C, D, E
            $table->text('notes')->nullable();
            $table->string('academic_year')->nullable(); // 2024/2025
            $table->integer('semester')->nullable(); // 1, 2
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'academic_year', 'semester']);
            $table->index(['student_id', 'subject_id']);
            $table->index(['teacher_id', 'assignment_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
