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
        Schema::create('tenant_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('module_key')->index(); // Key unik untuk modul (misal: 'ppdb', 'spp', 'library')
            $table->string('module_name'); // Nama modul yang user-friendly
            $table->boolean('is_enabled')->default(false);
            $table->json('permissions')->nullable(); // Array permission yang diizinkan
            $table->json('settings')->nullable(); // Pengaturan khusus modul
            $table->timestamp('expires_at')->nullable(); // Kapan modul berakhir
            $table->timestamps();
            
            // Index untuk performa
            $table->index(['tenant_id', 'module_key']);
            $table->index(['tenant_id', 'is_enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_modules');
    }
};
