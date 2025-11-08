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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('class_id')->constrained('class_rooms')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->enum('exam_type', ['quiz', 'midterm', 'final', 'assignment'])->default('quiz');
            $table->integer('duration')->comment('Duration in minutes');
            $table->integer('total_questions')->default(0);
            $table->integer('total_score')->default(0);
            $table->integer('passing_score')->default(0);
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->enum('status', ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'])->default('draft');
            $table->text('instructions')->nullable();
            $table->json('settings')->nullable()->comment('Additional exam settings like randomization, etc.');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('allow_review')->default(true)->comment('Allow students to review their answers');
            $table->boolean('show_correct_answers')->default(false)->comment('Show correct answers after exam');
            $table->boolean('randomize_questions')->default(false)->comment('Randomize question order');
            $table->boolean('randomize_answers')->default(false)->comment('Randomize answer options');
            $table->integer('max_attempts')->default(1)->comment('Maximum attempts allowed');
            $table->timestamps();
            
            $table->index(['instansi_id', 'status']);
            $table->index(['subject_id', 'class_id']);
            $table->index(['start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
