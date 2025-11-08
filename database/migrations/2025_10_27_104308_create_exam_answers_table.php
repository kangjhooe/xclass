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
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('exam_questions')->onDelete('cascade');
            $table->foreignId('attempt_id')->constrained('exam_attempts')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->text('answer')->nullable()->comment('Student answer');
            $table->boolean('is_correct')->default(false);
            $table->integer('points')->default(0)->comment('Points earned for this answer');
            $table->integer('time_spent')->default(0)->comment('Time spent on this question in seconds');
            $table->datetime('answered_at')->nullable();
            $table->boolean('is_auto_saved')->default(false)->comment('Whether this answer was auto-saved');
            $table->json('metadata')->nullable()->comment('Additional answer metadata');
            $table->timestamps();
            
            $table->index(['instansi_id', 'exam_id']);
            $table->index(['attempt_id', 'question_id']);
            $table->index(['student_id', 'exam_id']);
            $table->unique(['attempt_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_answers');
    }
};
