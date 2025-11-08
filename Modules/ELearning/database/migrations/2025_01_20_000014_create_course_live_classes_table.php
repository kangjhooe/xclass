<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_live_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('platform', ['zoom', 'google_meet', 'jitsi', 'microsoft_teams', 'other'])->default('zoom');
            $table->string('meeting_url')->nullable();
            $table->string('meeting_id')->nullable();
            $table->string('meeting_password')->nullable();
            $table->datetime('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->boolean('record_meeting')->default(false);
            $table->string('recording_url')->nullable();
            $table->enum('status', ['scheduled', 'live', 'completed', 'cancelled'])->default('scheduled');
            $table->json('settings')->nullable()->comment('Pengaturan tambahan');
            $table->timestamps();
            
            $table->index(['course_id', 'scheduled_at']);
            $table->index(['instansi_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_live_classes');
    }
};

