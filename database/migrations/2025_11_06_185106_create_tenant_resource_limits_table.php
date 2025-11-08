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
        Schema::create('tenant_resource_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            
            // Storage limits (in MB)
            $table->bigInteger('max_storage_mb')->default(1024); // 1GB default
            $table->bigInteger('current_storage_mb')->default(0);
            
            // User limits
            $table->integer('max_users')->default(100);
            $table->integer('current_users')->default(0);
            
            // Student limits
            $table->integer('max_students')->nullable(); // null = unlimited
            $table->integer('current_students')->default(0);
            
            // API rate limits
            $table->integer('api_rate_limit_per_minute')->default(60);
            $table->integer('api_rate_limit_per_hour')->default(1000);
            
            // Database size (in MB)
            $table->bigInteger('max_database_size_mb')->default(512);
            $table->bigInteger('current_database_size_mb')->default(0);
            
            // Last updated
            $table->timestamp('last_checked_at')->nullable();
            
            $table->timestamps();
            
            $table->unique('tenant_id');
            $table->index('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_resource_limits');
    }
};
