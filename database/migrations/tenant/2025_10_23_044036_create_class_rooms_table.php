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
        Schema::create('class_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->string('name'); // X IPA 1, XII IPS 2, dll
            $table->string('level')->nullable(); // X, XI, XII
            $table->string('major')->nullable(); // IPA, IPS, Bahasa, dll
            $table->integer('capacity')->default(30);
            $table->string('room_number')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('academic_year')->nullable(); // 2024/2025
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'is_active']);
            $table->index(['level', 'major']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_rooms');
    }
};
