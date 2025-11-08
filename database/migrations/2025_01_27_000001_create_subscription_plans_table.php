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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Basic, Pro, Gold, Platinum
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('min_students')->default(0);
            $table->integer('max_students')->nullable(); // null untuk unlimited
            $table->decimal('price_per_student_per_year', 10, 2)->default(0);
            $table->integer('billing_threshold')->default(0); // Threshold untuk tagihan tambahan
            $table->boolean('is_free')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('features')->nullable(); // Fitur yang tersedia di plan ini
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};

