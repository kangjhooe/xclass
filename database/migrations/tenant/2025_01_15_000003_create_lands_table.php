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
        Schema::create('lands', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('area', 10, 2);
            $table->enum('area_unit', ['m2', 'hectare'])->default('m2');
            $table->string('location')->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->string('ownership_type')->nullable();
            $table->string('ownership_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->timestamps();
            
            $table->index(['instansi_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lands');
    }
};

