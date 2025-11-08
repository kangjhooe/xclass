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
        Schema::table('tenant_profiles', function (Blueprint $table) {
            $table->string('theme_name')->default('default-blue')->after('is_active');
            $table->json('theme_config')->nullable()->after('theme_name');
            $table->enum('layout_type', ['sidebar-left', 'full-width', 'boxed'])->default('sidebar-left')->after('theme_config');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_profiles', function (Blueprint $table) {
            $table->dropColumn(['theme_name', 'theme_config', 'layout_type']);
        });
    }
};
