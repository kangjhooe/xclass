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
        Schema::create('exam_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->integer('total_questions')->default(0);
            $table->integer('total_score')->default(0);
            $table->integer('duration')->comment('Duration in minutes for this subject');
            $table->json('question_ids')->nullable()->comment('Array of question IDs for this subject');
            $table->json('settings')->nullable()->comment('Subject-specific settings');
            $table->timestamps();
            
            $table->index(['instansi_id', 'exam_id']);
            $table->index(['subject_id', 'teacher_id']);
            $table->unique(['exam_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_subjects');
    }
};
