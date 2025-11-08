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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('province_code')->nullable()->after('province');
            $table->string('regency_code')->nullable()->after('city');
            $table->string('regency')->nullable()->after('regency_code');
            $table->string('district_code')->nullable()->after('regency');
            $table->string('district')->nullable()->after('district_code');
            $table->string('village_code')->nullable()->after('district');
            $table->string('village')->nullable()->after('village_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'province_code',
                'regency_code',
                'regency',
                'district_code',
                'district',
                'village_code',
                'village'
            ]);
        });
    }
};

