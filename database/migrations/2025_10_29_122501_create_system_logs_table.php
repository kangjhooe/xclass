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
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->string('level')->index(); // info, warning, error, critical, debug
            $table->text('message');
            $table->json('context')->nullable(); // Additional context data
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('set null');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['level', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['tenant_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};