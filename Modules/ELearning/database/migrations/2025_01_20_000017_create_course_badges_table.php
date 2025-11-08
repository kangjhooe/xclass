<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('badge_name');
            $table->string('badge_type')->comment('achievement, milestone, completion, etc');
            $table->string('badge_icon')->nullable();
            $table->text('description')->nullable();
            $table->datetime('earned_at');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'badge_type']);
            $table->index(['course_id', 'badge_type']);
            $table->index('instansi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_badges');
    }
};

