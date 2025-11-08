<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('course_quizzes')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->datetime('started_at');
            $table->datetime('submitted_at')->nullable();
            $table->integer('time_spent_seconds')->nullable();
            $table->json('answers')->nullable()->comment('Jawaban siswa dalam format JSON');
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->enum('status', ['in_progress', 'submitted', 'graded'])->default('in_progress');
            $table->boolean('is_passed')->default(false);
            $table->boolean('synced_to_gradebook')->default(false);
            $table->timestamps();
            
            $table->index(['quiz_id', 'student_id']);
            $table->index(['student_id', 'status']);
            $table->index('instansi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_quiz_attempts');
    }
};

