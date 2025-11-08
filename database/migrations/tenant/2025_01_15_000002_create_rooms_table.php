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
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->uuid('building_id');
            $table->string('name');
            $table->enum('type', ['classroom', 'office', 'library', 'laboratory', 'auditorium', 'other'])->default('classroom');
            $table->integer('floor')->default(0);
            $table->integer('capacity')->default(0);
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamps();
            
            $table->foreign('building_id')->references('id')->on('buildings')->onDelete('cascade');
            $table->index(['instansi_id', 'status']);
            $table->index(['building_id', 'instansi_id']);
            $table->index(['type', 'instansi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};

