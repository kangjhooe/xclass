<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_forums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['course_id', 'order']);
            $table->index(['course_id', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_forums');
    }
};

