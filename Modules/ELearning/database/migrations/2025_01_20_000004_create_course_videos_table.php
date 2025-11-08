<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('source', ['youtube', 'vimeo', 'self_hosted', 'other'])->default('self_hosted');
            $table->string('video_url')->nullable();
            $table->string('video_id')->nullable()->comment('ID untuk YouTube/Vimeo');
            $table->string('file_path')->nullable()->comment('Path untuk video self-hosted');
            $table->integer('duration_seconds')->nullable()->comment('Durasi dalam detik');
            $table->string('thumbnail')->nullable();
            $table->boolean('allow_download')->default(false);
            $table->boolean('has_subtitle')->default(false);
            $table->string('subtitle_file')->nullable();
            $table->integer('order')->default(0);
            $table->string('chapter')->nullable();
            $table->boolean('is_published')->default(true);
            $table->datetime('publish_date')->nullable();
            $table->timestamps();
            
            $table->index(['course_id', 'order']);
            $table->index(['course_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_videos');
    }
};

