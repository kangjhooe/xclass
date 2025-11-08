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
        Schema::create('student_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->unsignedBigInteger('student_id');
            $table->string('activity_type'); // login, exam_start, exam_submit, answer_save, etc.
            $table->string('module'); // exam, attendance, grade, etc.
            $table->string('action'); // specific action within module
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // additional data
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('session_id')->nullable();
            $table->timestamp('created_at');
            
            // Foreign key constraints
            $table->foreign('instansi_id')->references('id')->on('instansi')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            
            // Indexes
            $table->index(['instansi_id', 'student_id']);
            $table->index(['activity_type', 'module']);
            $table->index('created_at');
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_activity_logs');
    }
};