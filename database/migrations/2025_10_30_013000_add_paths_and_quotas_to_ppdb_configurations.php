<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ppdb_configurations', function (Blueprint $table) {
            $table->json('admission_paths')->nullable()->after('available_majors');
            $table->json('quotas')->nullable()->after('admission_paths'); // { major: { path: quotaInt } }
        });
    }

    public function down(): void
    {
        Schema::table('ppdb_configurations', function (Blueprint $table) {
            $table->dropColumn(['admission_paths','quotas']);
        });
    }
};


