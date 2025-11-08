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
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->enum('card_type', ['student', 'teacher', 'staff']); // Jenis kartu
            $table->string('cardable_type'); // Student, Teacher, atau Staff
            $table->unsignedBigInteger('cardable_id'); // ID dari student/teacher/staff
            $table->foreignId('card_template_id')->constrained('card_templates')->onDelete('cascade');
            $table->string('barcode')->unique(); // Barcode untuk absensi dan pembayaran
            $table->string('image_path')->nullable(); // Path ke file gambar kartu
            $table->enum('image_format', ['jpg', 'png'])->default('png'); // Format gambar
            $table->json('data')->nullable(); // Data yang digunakan saat generate kartu
            $table->dateTime('issued_at')->nullable(); // Tanggal terbit
            $table->dateTime('expires_at')->nullable(); // Tanggal kadaluarsa (optional)
            $table->boolean('is_active')->default(true);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'card_type']);
            $table->index(['cardable_type', 'cardable_id']);
            $table->index(['barcode']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};

