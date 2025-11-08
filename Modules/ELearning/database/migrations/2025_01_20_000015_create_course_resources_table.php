<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['ebook', 'video', 'link', 'template', 'other'])->default('other');
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('external_url')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_public')->default(false)->comment('Resource publik atau hanya untuk course tertentu');
            $table->integer('download_count')->default(0);
            $table->timestamps();
            
            $table->index(['course_id', 'type']);
            $table->index(['instansi_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_resources');
    }
};

