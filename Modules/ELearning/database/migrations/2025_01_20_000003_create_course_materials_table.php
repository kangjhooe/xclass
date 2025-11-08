<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->text('content')->nullable();
            $table->enum('type', ['text', 'pdf', 'powerpoint', 'image', 'link', 'document'])->default('text');
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('external_url')->nullable();
            $table->integer('order')->default(0);
            $table->string('chapter')->nullable()->comment('Bab atau bagian');
            $table->boolean('is_published')->default(true);
            $table->boolean('allow_download')->default(true);
            $table->datetime('publish_date')->nullable();
            $table->timestamps();
            
            $table->index(['course_id', 'order']);
            $table->index(['course_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_materials');
    }
};

