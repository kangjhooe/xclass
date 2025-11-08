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
        Schema::create('disciplinary_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->string('violation_type')->comment('minor, moderate, major, severe');
            $table->string('violation_category')->comment('academic, behavior, attendance, dress_code, safety, other');
            $table->text('description');
            $table->date('violation_date');
            $table->string('location')->nullable();
            $table->json('witnesses')->nullable();
            $table->string('severity_level')->comment('low, medium, high, critical');
            $table->string('sanction_type')->comment('warning, reprimand, detention, suspension, expulsion, community_service');
            $table->text('sanction_description')->nullable();
            $table->integer('sanction_duration')->nullable()->comment('Duration in days');
            $table->date('sanction_start_date')->nullable();
            $table->date('sanction_end_date')->nullable();
            $table->string('status')->default('pending')->comment('pending, approved, active, completed, cancelled');
            $table->boolean('parent_notified')->default(false);
            $table->date('parent_notification_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['instansi_id', 'student_id']);
            $table->index(['instansi_id', 'reported_by']);
            $table->index(['instansi_id', 'status']);
            $table->index(['instansi_id', 'violation_category']);
            $table->index(['instansi_id', 'sanction_type']);
            $table->index(['instansi_id', 'severity_level']);
            $table->index(['violation_date', 'status']);
            $table->index(['instansi_id', 'violation_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disciplinary_actions');
    }
};

