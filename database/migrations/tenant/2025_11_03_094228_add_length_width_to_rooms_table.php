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
        Schema::table('rooms', function (Blueprint $table) {
            $table->decimal('length', 8, 2)->nullable()->after('capacity')->comment('Panjang ruangan dalam meter');
            $table->decimal('width', 8, 2)->nullable()->after('length')->comment('Lebar ruangan dalam meter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['length', 'width']);
        });
    }
};
