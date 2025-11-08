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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'true_false', 'essay', 'fill_blank', 'matching'])->default('multiple_choice');
            $table->json('options')->nullable()->comment('Answer options for multiple choice, true/false, etc.');
            $table->json('correct_answer')->nullable()->comment('Correct answer (can be array for fill_blank/matching)');
            $table->text('explanation')->nullable()->comment('Explanation for the answer');
            $table->integer('points')->default(1)->comment('Points for this question');
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->enum('visibility', ['private', 'shared'])->default('private');
            $table->foreignId('origin_tenant_id')->nullable()->constrained('tenants')->onDelete('set null');
            $table->timestamp('shared_at')->nullable();
            $table->json('metadata')->nullable()->comment('Additional question metadata');
            $table->timestamps();
            
            $table->index(['instansi_id', 'subject_id']);
            $table->index(['question_type', 'difficulty']);
            $table->index(['visibility', 'shared_at']);
            $table->index(['creator_id', 'instansi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
