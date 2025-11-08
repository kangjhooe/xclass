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
        Schema::create('book_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); // untuk tracking user yang membaca
            $table->string('reader_type')->nullable(); // 'student', 'teacher', 'staff', 'guest'
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade');
            $table->integer('last_page')->default(1); // halaman terakhir yang dibaca
            $table->decimal('progress_percentage', 5, 2)->default(0); // 0-100
            $table->integer('total_pages_read')->default(0);
            $table->timestamp('last_read_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->text('bookmark_notes')->nullable();
            $table->json('bookmarks')->nullable(); // array of page numbers
            $table->integer('reading_time_seconds')->default(0); // total waktu membaca dalam detik
            $table->timestamps();

            // Indexes
            $table->index(['instansi_id', 'book_id']);
            $table->index(['instansi_id', 'user_id']);
            $table->index(['instansi_id', 'student_id']);
            $table->index('last_read_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_readings');
    }
};
