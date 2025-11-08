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
        Schema::table('menus', function (Blueprint $table) {
            // Rename title to name
            $table->renameColumn('title', 'name');
            // Add target column
            $table->enum('target', ['_self', '_blank'])->default('_self')->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Rename name back to title
            $table->renameColumn('name', 'title');
            // Drop target column
            $table->dropColumn('target');
        });
    }
};
