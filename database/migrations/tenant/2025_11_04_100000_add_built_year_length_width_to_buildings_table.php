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
        Schema::table('buildings', function (Blueprint $table) {
            $table->integer('built_year')->nullable()->after('floors')->comment('Tahun dibangun');
            $table->decimal('length', 8, 2)->nullable()->after('built_year')->comment('Panjang gedung dalam meter');
            $table->decimal('width', 8, 2)->nullable()->after('length')->comment('Lebar gedung dalam meter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropColumn(['built_year', 'length', 'width']);
        });
    }
};

