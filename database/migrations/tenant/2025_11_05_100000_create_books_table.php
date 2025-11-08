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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->string('isbn', 20)->nullable()->unique();
            $table->string('title');
            $table->string('author');
            $table->string('publisher');
            $table->integer('publication_year')->nullable();
            $table->string('category', 100)->nullable();
            $table->string('subcategory', 100)->nullable();
            $table->string('language', 50)->default('id');
            $table->integer('pages')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->integer('total_copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->string('location')->nullable();
            $table->string('shelf_number')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->enum('status', ['available', 'unavailable', 'maintenance', 'lost', 'damaged'])->default('available');
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor'])->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->string('donor')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['instansi_id', 'status']);
            $table->index(['instansi_id', 'category']);
            $table->index(['instansi_id', 'author']);
            $table->index('isbn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};

