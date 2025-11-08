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
            $table->uuid('land_id')->nullable()->after('instansi_id');
            $table->foreign('land_id')->references('id')->on('lands')->onDelete('set null');
            $table->index('land_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropForeign(['land_id']);
            $table->dropIndex(['land_id']);
            $table->dropColumn('land_id');
        });
    }
};
