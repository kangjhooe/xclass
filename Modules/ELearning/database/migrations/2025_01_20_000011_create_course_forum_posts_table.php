<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_forum_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('forum_id')->constrained('course_forums')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('course_forum_posts')->onDelete('cascade')->comment('Post parent untuk reply');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('set null');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->string('title')->nullable();
            $table->text('content');
            $table->json('attachments')->nullable()->comment('File attachments');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->integer('views_count')->default(0);
            $table->integer('replies_count')->default(0);
            $table->datetime('last_reply_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['forum_id', 'parent_id']);
            $table->index(['user_id', 'created_at']);
            $table->index(['forum_id', 'is_pinned', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_forum_posts');
    }
};

