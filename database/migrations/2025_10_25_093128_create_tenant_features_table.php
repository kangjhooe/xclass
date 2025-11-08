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
        Schema::create('tenant_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('feature_key')->index(); // Key unik untuk fitur (misal: 'online_payment', 'bulk_export')
            $table->string('feature_name'); // Nama fitur yang user-friendly
            $table->boolean('is_enabled')->default(false);
            $table->json('settings')->nullable(); // Pengaturan khusus fitur
            $table->timestamp('expires_at')->nullable(); // Kapan fitur berakhir
            $table->timestamps();
            
            // Index untuk performa
            $table->index(['tenant_id', 'feature_key']);
            $table->index(['tenant_id', 'is_enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_features');
    }
};
