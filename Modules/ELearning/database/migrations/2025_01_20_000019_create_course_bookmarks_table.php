<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('course_enrollments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('bookmarkable_type')->comment('Material, Video, dll');
            $table->unsignedBigInteger('bookmarkable_id');
            $table->string('note')->nullable();
            $table->timestamps();
            
            $table->unique(['enrollment_id', 'bookmarkable_type', 'bookmarkable_id'], 'unique_bookmark');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_bookmarks');
    }
};

