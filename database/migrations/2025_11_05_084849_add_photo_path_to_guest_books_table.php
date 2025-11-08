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
        Schema::table('guest_books', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('visitor_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_books', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
    }
};
