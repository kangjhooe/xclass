<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('course_quizzes')->onDelete('cascade');
            $table->text('question');
            $table->enum('type', ['multiple_choice', 'true_false', 'essay', 'short_answer'])->default('multiple_choice');
            $table->json('options')->nullable()->comment('Array pilihan untuk multiple choice');
            $table->json('correct_answer')->nullable()->comment('Jawaban benar');
            $table->text('explanation')->nullable()->comment('Penjelasan jawaban');
            $table->decimal('points', 5, 2)->default(1.00);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['quiz_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_quiz_questions');
    }
};

