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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->json('target_audience'); // ['all', 'teachers', 'students', 'parents']
            $table->timestamp('publish_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'status']);
            $table->index(['instansi_id', 'priority']);
            $table->index(['publish_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
