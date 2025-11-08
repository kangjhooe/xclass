<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ppdb_applications', function (Blueprint $table) {
            $table->string('photo_status')->nullable()->after('photo_path'); // valid|revisi|null
            $table->string('ijazah_status')->nullable()->after('ijazah_path');
            $table->string('kk_status')->nullable()->after('kk_path');
            $table->json('documents_status')->nullable()->after('documents');
            $table->text('verification_notes')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('ppdb_applications', function (Blueprint $table) {
            $table->dropColumn(['photo_status','ijazah_status','kk_status','documents_status','verification_notes']);
        });
    }
};


