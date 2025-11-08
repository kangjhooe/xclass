<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('course_enrollments')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('certificate_number')->unique();
            $table->string('certificate_file')->nullable()->comment('Path file sertifikat PDF');
            $table->datetime('issued_at');
            $table->datetime('expires_at')->nullable();
            $table->text('metadata')->nullable()->comment('Data tambahan untuk template sertifikat');
            $table->timestamps();
            
            $table->index(['course_id', 'student_id']);
            $table->index('certificate_number');
            $table->index('instansi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_certificates');
    }
};

