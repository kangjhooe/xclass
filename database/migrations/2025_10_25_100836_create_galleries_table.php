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
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_type'); // image, video, document
            $table->string('file_size')->nullable();
            $table->string('category')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['instansi_id', 'is_active', 'file_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};
