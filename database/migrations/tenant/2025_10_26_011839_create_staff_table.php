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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->string('religion')->nullable();
            $table->string('employee_number')->nullable();
            $table->string('nip')->nullable();
            $table->string('position');
            $table->string('department')->nullable();
            $table->string('education_level')->nullable();
            $table->enum('employment_status', ['permanent', 'contract', 'honorary', 'intern', 'resigned'])->default('permanent');
            $table->date('hire_date')->nullable();
            $table->decimal('salary', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['instansi_id', 'is_active']);
            $table->index(['position', 'instansi_id']);
            $table->index(['department', 'instansi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
