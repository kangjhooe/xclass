<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('course_enrollments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('noteable_type')->comment('Material, Video, Assignment, dll');
            $table->unsignedBigInteger('noteable_id');
            $table->text('content');
            $table->string('highlight_text')->nullable();
            $table->integer('position')->nullable()->comment('Posisi untuk video');
            $table->timestamps();
            
            $table->index(['enrollment_id', 'noteable_type', 'noteable_id']);
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_notes');
    }
};

