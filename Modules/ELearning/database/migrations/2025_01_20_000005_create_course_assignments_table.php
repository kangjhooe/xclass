<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->decimal('max_score', 5, 2)->default(100);
            $table->decimal('weight', 5, 2)->default(1.00)->comment('Bobot untuk penilaian');
            $table->datetime('due_date')->nullable();
            $table->boolean('allow_late_submission')->default(false);
            $table->integer('max_attempts')->default(1)->comment('Maksimal percobaan submit');
            $table->json('allowed_file_types')->nullable()->comment('Jenis file yang diizinkan');
            $table->integer('max_file_size_mb')->default(10);
            $table->boolean('send_to_gradebook')->default(true)->comment('Kirim nilai ke modul penilaian');
            $table->boolean('is_published')->default(true);
            $table->datetime('publish_date')->nullable();
            $table->timestamps();
            
            $table->index(['course_id', 'is_published']);
            $table->index(['instansi_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_assignments');
    }
};

