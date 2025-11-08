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
        Schema::create('counseling_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('counselor_id')->constrained('teachers')->onDelete('cascade');
            $table->datetime('session_date');
            $table->string('session_type')->comment('individual, group, family, crisis');
            $table->string('category')->comment('academic, behavioral, emotional, social, career, personal');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->json('issues')->nullable();
            $table->json('goals')->nullable();
            $table->json('interventions')->nullable();
            $table->json('outcomes')->nullable();
            $table->boolean('follow_up_required')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->string('status')->default('scheduled')->comment('scheduled, in_progress, completed, cancelled, no_show');
            $table->string('confidentiality_level')->nullable()->comment('low, medium, high');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'student_id']);
            $table->index(['instansi_id', 'counselor_id']);
            $table->index(['instansi_id', 'status']);
            $table->index(['session_date', 'status']);
            $table->index(['instansi_id', 'session_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('counseling_sessions');
    }
};

