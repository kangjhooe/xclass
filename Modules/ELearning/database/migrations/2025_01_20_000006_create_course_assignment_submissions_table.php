<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('course_assignments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->text('submission_text')->nullable();
            $table->json('attached_files')->nullable()->comment('Array path file yang diupload');
            $table->datetime('submitted_at')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->enum('status', ['draft', 'submitted', 'graded', 'returned', 'resubmitted'])->default('draft');
            $table->boolean('is_late')->default(false);
            $table->integer('attempt_number')->default(1);
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('graded_at')->nullable();
            $table->boolean('synced_to_gradebook')->default(false)->comment('Sudah disinkronkan ke gradebook');
            $table->timestamps();
            
            $table->index(['assignment_id', 'student_id']);
            $table->index(['student_id', 'status']);
            $table->index('instansi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_assignment_submissions');
    }
};

