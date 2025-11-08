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
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->unsignedBigInteger('created_by_instansi_id')->nullable();
            $table->json('theme_config')->nullable();
            $table->enum('layout_type', ['sidebar-left', 'full-width', 'boxed'])->default('sidebar-left');
            $table->text('custom_css')->nullable();
            $table->text('custom_js')->nullable();
            $table->boolean('is_public')->default(false);
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
            
            $table->foreign('created_by_instansi_id')->references('id')->on('tenants')->onDelete('set null');
            $table->index(['is_system', 'is_public']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('themes');
    }
};
