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
        Schema::table('class_rooms', function (Blueprint $table) {
            $table->uuid('room_id')->nullable()->after('instansi_id');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            $table->index('room_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_rooms', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropIndex(['room_id']);
            $table->dropColumn('room_id');
        });
    }
};
