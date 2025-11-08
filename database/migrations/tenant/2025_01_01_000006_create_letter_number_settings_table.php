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
        Schema::create('letter_number_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('jenis_surat');
            $table->string('format_nomor');
            $table->integer('nomor_terakhir')->default(0);
            $table->boolean('reset_tahunan')->default(true);
            $table->string('kode_lembaga')->nullable();
            $table->text('deskripsi')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['instansi_id', 'jenis_surat']);
            $table->unique(['instansi_id', 'jenis_surat']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_number_settings');
    }
};
