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
        if (Schema::hasTable('letter_number_settings')) {
            return;
        }
        
        Schema::create('letter_number_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('format_nomor')->default('{{NOMOR}}/{{INSTITUSI}}/{{BULAN_ROMAWI}}/{{TAHUN}}');
            $table->boolean('reset_tahunan')->default(true);
            $table->integer('last_number')->default(0);
            $table->string('prefix')->nullable();
            $table->string('suffix')->nullable();
            $table->string('institusi_code')->nullable();
            $table->timestamps();
            
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique('instansi_id');
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
