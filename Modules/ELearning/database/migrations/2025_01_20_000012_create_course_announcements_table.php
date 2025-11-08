<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->boolean('is_important')->default(false);
            $table->boolean('send_notification')->default(true);
            $table->datetime('publish_date')->nullable();
            $table->datetime('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['course_id', 'publish_date']);
            $table->index(['course_id', 'is_important']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_announcements');
    }
};

