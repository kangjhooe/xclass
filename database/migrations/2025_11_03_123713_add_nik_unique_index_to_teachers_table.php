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
        Schema::table('teachers', function (Blueprint $table) {
            // Add unique index for NIK (global uniqueness)
            // NIK adalah patokan utama, guru dengan NIK yang sama tidak bisa didaftarkan di tenant lain
            // Tapi bisa di-cabangkan (branch)
            $table->unique('nik', 'teachers_nik_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropUnique('teachers_nik_unique');
        });
    }
};
