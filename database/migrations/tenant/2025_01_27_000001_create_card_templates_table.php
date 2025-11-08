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
        Schema::create('card_templates', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->string('name'); // Nama template
            $table->enum('card_type', ['student', 'teacher', 'staff']); // Jenis kartu
            $table->text('html_template'); // HTML template
            $table->text('css_template'); // CSS template
            $table->json('config')->nullable(); // Konfigurasi template (fields, layout, dll)
            $table->boolean('has_photo')->default(true); // Apakah template menggunakan foto
            $table->boolean('has_barcode')->default(true); // Apakah template menggunakan barcode
            $table->boolean('is_default')->default(false); // Template default
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'card_type', 'is_active']);
            $table->index(['instansi_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_templates');
    }
};

