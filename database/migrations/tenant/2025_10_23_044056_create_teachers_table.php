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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('nip')->unique(); // Nomor Induk Pegawai
            $table->string('nuptk')->nullable(); // Nomor Unik Pendidik dan Tenaga Kependidikan
            $table->date('birth_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('education_level')->nullable(); // S1, S2, S3
            $table->string('major')->nullable(); // Jurusan pendidikan
            $table->string('certification_number')->nullable();
            $table->date('certification_date')->nullable();
            $table->date('employment_date')->nullable();
            $table->date('resignation_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'is_active']);
            $table->index(['nip', 'instansi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
