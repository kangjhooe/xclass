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
        Schema::table('ppdb_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('ppdb_applications', 'instansi_id')) {
                $table->unsignedBigInteger('instansi_id')->nullable()->after('user_id');
                $table->index('instansi_id');
                $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ppdb_applications', function (Blueprint $table) {
            if (Schema::hasColumn('ppdb_applications', 'instansi_id')) {
                $table->dropForeign(['instansi_id']);
                $table->dropIndex(['instansi_id']);
                $table->dropColumn('instansi_id');
            }
        });
    }
};

