<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->integer('time_limit_minutes')->nullable()->comment('Batas waktu dalam menit, null = unlimited');
            $table->integer('total_questions')->default(0);
            $table->decimal('max_score', 5, 2)->default(100);
            $table->decimal('passing_score', 5, 2)->nullable();
            $table->integer('max_attempts')->default(1);
            $table->boolean('show_answers_after_submit')->default(true);
            $table->boolean('show_correct_answers')->default(true);
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('randomize_answers')->default(false);
            $table->boolean('send_to_gradebook')->default(false)->comment('Kirim nilai ke gradebook (opsional)');
            $table->boolean('is_published')->default(true);
            $table->datetime('available_from')->nullable();
            $table->datetime('available_until')->nullable();
            $table->timestamps();
            
            $table->index(['course_id', 'is_published']);
            $table->index('instansi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_quizzes');
    }
};

