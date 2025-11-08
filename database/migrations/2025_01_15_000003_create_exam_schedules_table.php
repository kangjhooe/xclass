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
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('class_id')->constrained('class_rooms')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->integer('duration')->comment('Duration in minutes');
            $table->integer('total_questions')->default(0);
            $table->integer('total_score')->default(0);
            $table->integer('passing_score')->default(0);
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('instructions')->nullable();
            $table->json('settings')->nullable()->comment('Additional exam settings');
            $table->boolean('allow_review')->default(true);
            $table->boolean('show_correct_answers')->default(false);
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('randomize_answers')->default(false);
            $table->integer('max_attempts')->default(1);
            $table->timestamps();
            
            $table->index(['instansi_id', 'exam_id']);
            $table->index(['class_id', 'subject_id']);
            $table->index(['start_time', 'end_time']);
            $table->index(['status', 'start_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_schedules');
    }
};
