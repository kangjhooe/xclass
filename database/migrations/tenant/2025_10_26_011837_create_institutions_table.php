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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->string('name');
            $table->enum('type', ['sekolah', 'madrasah', 'pondok', 'lainnya'])->default('sekolah');
            $table->text('address');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('headmaster_name')->nullable();
            $table->string('headmaster_phone')->nullable();
            $table->string('headmaster_email')->nullable();
            $table->enum('accreditation_status', ['A', 'B', 'C', 'D', 'pending', 'expired'])->nullable();
            $table->string('accreditation_number')->nullable();
            $table->date('accreditation_date')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'is_active']);
            $table->index(['npsn', 'instansi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
