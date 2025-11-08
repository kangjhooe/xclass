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
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->datetime('started_at');
            $table->datetime('submitted_at')->nullable();
            $table->enum('status', ['started', 'in_progress', 'completed', 'abandoned', 'timeout'])->default('started');
            $table->integer('score')->default(0);
            $table->integer('total_questions')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('time_spent')->default(0)->comment('Time spent in seconds');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('question_order')->nullable()->comment('Order of questions for this attempt');
            $table->json('answer_order')->nullable()->comment('Order of answers for each question');
            $table->timestamps();
            
            $table->index(['instansi_id', 'exam_id']);
            $table->index(['student_id', 'exam_id']);
            $table->index(['status', 'started_at']);
            $table->unique(['exam_id', 'student_id', 'started_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};
