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
        Schema::table('outgoing_letters', function (Blueprint $table) {
            $table->enum('prioritas', ['rendah', 'sedang', 'tinggi', 'sangat_tinggi'])->default('sedang')->after('status');
            $table->enum('sifat_surat', ['biasa', 'segera', 'sangat_segera'])->default('biasa')->after('prioritas');
            $table->text('isi_ringkas')->nullable()->after('sifat_surat');
            $table->text('tindak_lanjut')->nullable()->after('isi_ringkas');
            $table->date('tanggal_kirim')->nullable()->after('tindak_lanjut');
            $table->string('pengirim')->nullable()->after('tanggal_kirim');
            $table->json('lampiran')->nullable()->after('pengirim');
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['instansi_id', 'prioritas']);
            $table->index(['instansi_id', 'sifat_surat']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('outgoing_letters', function (Blueprint $table) {
            $table->dropForeign(['updated_by']);
            $table->dropIndex(['instansi_id', 'prioritas']);
            $table->dropIndex(['instansi_id', 'sifat_surat']);
            
            $table->dropColumn([
                'prioritas',
                'sifat_surat',
                'isi_ringkas',
                'tindak_lanjut',
                'tanggal_kirim',
                'pengirim',
                'lampiran',
                'updated_by'
            ]);
        });
    }
};