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
        Schema::create('outgoing_letters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('nomor_surat');
            $table->date('tanggal_surat');
            $table->string('jenis_surat');
            $table->string('tujuan');
            $table->string('perihal');
            $table->longText('isi_surat');
            $table->string('file_path')->nullable();
            $table->enum('status', ['draft', 'menunggu_ttd', 'terkirim', 'arsip'])->default('draft');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['instansi_id', 'status']);
            $table->index(['instansi_id', 'tanggal_surat']);
            $table->index(['instansi_id', 'jenis_surat']);
            $table->unique(['instansi_id', 'nomor_surat']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outgoing_letters');
    }
};
