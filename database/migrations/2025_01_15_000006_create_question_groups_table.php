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
        Schema::create('question_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('stimulus_type', ['text', 'image', 'table'])->default('text');
            $table->longText('stimulus_content')->comment('Stimulus content based on type');
            $table->json('metadata')->nullable()->comment('Additional metadata for stimulus');
            $table->timestamps();
            
            $table->index(['tenant_id', 'subject_id']);
            $table->index(['created_by', 'tenant_id']);
            $table->index(['stimulus_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_groups');
    }
};
