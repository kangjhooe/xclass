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
        Schema::create('additional_duties', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('code'); // kode unik: kepala_sekolah, waka_kurikulum, guru_bk, dll
            $table->string('name'); // Nama tugas: Kepala Sekolah, Waka Kurikulum, Guru BK, dll
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0); // untuk sorting
            $table->timestamps();
            
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['instansi_id', 'code']); // Code unique per tenant
            $table->index(['instansi_id', 'is_active']);
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('additional_duties');
    }
};
