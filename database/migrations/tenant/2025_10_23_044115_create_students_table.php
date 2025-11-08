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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('nis')->unique(); // Nomor Induk Siswa
            $table->string('nisn')->nullable(); // Nomor Induk Siswa Nasional
            $table->date('birth_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('parent_name')->nullable();
            $table->string('parent_phone')->nullable();
            $table->string('parent_email')->nullable();
            $table->string('parent_occupation')->nullable();
            $table->foreignId('class_id')->nullable()->constrained('class_rooms')->onDelete('set null');
            $table->date('enrollment_date')->nullable();
            $table->date('graduation_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'is_active']);
            $table->index(['nis', 'instansi_id']);
            $table->index(['class_id', 'instansi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
