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
        Schema::create('tenant_health_monitoring', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            // Health status
            $table->enum('status', ['healthy', 'warning', 'critical', 'unknown'])->default('unknown');
            
            // Performance metrics
            $table->decimal('response_time_ms', 10, 2)->nullable(); // Average response time
            $table->integer('error_count_24h')->default(0);
            $table->integer('request_count_24h')->default(0);
            $table->decimal('error_rate', 5, 2)->default(0); // Error rate percentage
            
            // System metrics
            $table->decimal('cpu_usage_percent', 5, 2)->nullable();
            $table->decimal('memory_usage_percent', 5, 2)->nullable();
            $table->decimal('disk_usage_percent', 5, 2)->nullable();
            $table->decimal('database_size_mb', 12, 2)->nullable();
            
            // Uptime tracking
            $table->timestamp('last_successful_request_at')->nullable();
            $table->timestamp('last_error_at')->nullable();
            $table->integer('uptime_percentage_24h')->default(100);
            
            // Alerts
            $table->boolean('has_active_alerts')->default(false);
            $table->json('active_alerts')->nullable();
            
            // Last check
            $table->timestamp('last_checked_at')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->unique('tenant_id');
            $table->index(['tenant_id', 'status']);
            $table->index('last_checked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_health_monitoring');
    }
};
