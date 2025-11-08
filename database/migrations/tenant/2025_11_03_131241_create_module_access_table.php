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
        Schema::create('module_access', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->foreignId('additional_duty_id')->constrained('additional_duties')->onDelete('cascade');
            $table->string('module_code'); // kode modul: counseling, discipline, facilities, inventory, correspondence, dll
            $table->string('module_name'); // nama modul untuk display
            $table->json('permissions')->nullable(); // ['read', 'create', 'update', 'delete'] atau custom permissions
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['additional_duty_id', 'module_code'], 'unique_duty_module');
            $table->index(['instansi_id', 'module_code']);
            $table->index(['additional_duty_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_access');
    }
};
