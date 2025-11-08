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
        Schema::create('student_grades', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->integer('semester'); // 1 atau 2
            $table->string('assignment_type'); // tugas, uts, uas, quiz, project
            $table->string('assignment_name');
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->default(100);
            $table->decimal('weight', 5, 2)->default(1.00);
            $table->decimal('final_score', 5, 2)->nullable(); // nilai akhir setelah pembobotan
            $table->text('notes')->nullable();
            $table->boolean('is_passed')->default(false);
            $table->unsignedBigInteger('instansi_id');
            $table->timestamps();
            
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
            $table->foreign('academic_year_id')->references('id')->on('academic_years')->onDelete('cascade');
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            
            $table->index(['student_id', 'subject_id', 'academic_year_id', 'semester']);
            $table->index(['instansi_id', 'academic_year_id', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_grades');
    }
};
