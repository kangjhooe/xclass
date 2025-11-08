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
        Schema::table('books', function (Blueprint $table) {
            $table->boolean('is_online')->default(false)->after('status');
            $table->string('pdf_file')->nullable()->after('is_online');
            $table->string('pdf_file_name')->nullable()->after('pdf_file');
            $table->integer('pdf_file_size')->nullable()->after('pdf_file_name'); // in bytes
            $table->boolean('is_public')->default(false)->after('is_online'); // boleh dibaca tanpa login
            $table->boolean('allow_download')->default(false)->after('is_public'); // boleh download PDF
            $table->integer('view_count')->default(0)->after('allow_download');
            $table->integer('download_count')->default(0)->after('view_count');
            $table->timestamp('published_at')->nullable()->after('download_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'is_online',
                'pdf_file',
                'pdf_file_name',
                'pdf_file_size',
                'is_public',
                'allow_download',
                'view_count',
                'download_count',
                'published_at'
            ]);
        });
    }
};
