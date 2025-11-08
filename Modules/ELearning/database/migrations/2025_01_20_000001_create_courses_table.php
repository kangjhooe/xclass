<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('syllabus')->nullable();
            $table->string('thumbnail')->nullable();
            $table->enum('level', ['pemula', 'menengah', 'lanjutan'])->default('pemula');
            $table->string('category')->nullable();
            $table->integer('duration_hours')->default(0)->comment('Total durasi dalam jam');
            $table->integer('max_students')->nullable()->comment('Maksimal jumlah siswa');
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->json('prerequisite_course_ids')->nullable()->comment('ID kursus prasyarat');
            $table->json('settings')->nullable()->comment('Pengaturan tambahan');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['instansi_id', 'status']);
            $table->index(['teacher_id', 'status']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};

