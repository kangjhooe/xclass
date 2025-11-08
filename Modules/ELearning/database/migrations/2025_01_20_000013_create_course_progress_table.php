<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('course_enrollments')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('progressable_type')->comment('Materi, Video, Assignment, Quiz, dll');
            $table->unsignedBigInteger('progressable_id');
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->integer('time_spent_seconds')->default(0)->comment('Waktu yang dihabiskan');
            $table->datetime('started_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->integer('last_position')->nullable()->comment('Posisi terakhir untuk video');
            $table->json('metadata')->nullable()->comment('Data tambahan');
            $table->timestamps();
            
            $table->index(['enrollment_id', 'progressable_type', 'progressable_id']);
            $table->index(['student_id', 'course_id']);
            $table->index(['progressable_type', 'progressable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_progress');
    }
};
