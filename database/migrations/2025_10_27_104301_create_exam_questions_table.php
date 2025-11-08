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
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'true_false', 'essay', 'fill_blank', 'matching'])->default('multiple_choice');
            $table->json('options')->nullable()->comment('Answer options for multiple choice, true/false, etc.');
            $table->string('correct_answer')->nullable()->comment('Correct answer key');
            $table->text('explanation')->nullable()->comment('Explanation for the answer');
            $table->integer('points')->default(1)->comment('Points for this question');
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->integer('order')->default(0)->comment('Question order in exam');
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable()->comment('Additional question metadata');
            $table->timestamps();
            
            $table->index(['instansi_id', 'exam_id']);
            $table->index(['question_type', 'difficulty']);
            $table->index(['exam_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};
