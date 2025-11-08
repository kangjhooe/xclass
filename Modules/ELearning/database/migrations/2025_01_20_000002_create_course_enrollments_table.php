<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->enum('status', ['pending', 'enrolled', 'completed', 'dropped'])->default('pending');
            $table->datetime('enrolled_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->decimal('progress_percentage', 5, 2)->default(0)->comment('Progress dalam persentase');
            $table->decimal('final_score', 5, 2)->nullable()->comment('Nilai akhir kursus');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['course_id', 'student_id']);
            $table->index(['student_id', 'status']);
            $table->index(['course_id', 'status']);
            $table->index('instansi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};

