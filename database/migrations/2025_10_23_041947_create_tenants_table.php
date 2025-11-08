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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8)->unique();
            $table->string('name');
            $table->enum('type_tenant', ['Sekolah Umum', 'Madrasah'])->default('Sekolah Umum');
            $table->enum('jenjang', ['SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'Lainnya'])->default('SD');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('website')->nullable();
            $table->string('custom_domain')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('subscription_plan')->default('basic');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['npsn', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
