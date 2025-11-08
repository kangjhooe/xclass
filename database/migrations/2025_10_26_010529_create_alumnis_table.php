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
        Schema::create('alumnis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->unsignedBigInteger('student_id');
            $table->integer('graduation_year');
            $table->date('graduation_date');
            $table->decimal('final_grade', 5, 2);
            $table->decimal('gpa', 3, 2)->nullable();
            $table->integer('rank')->nullable();
            $table->string('current_occupation')->nullable();
            $table->string('company')->nullable();
            $table->string('position')->nullable();
            $table->string('industry')->nullable();
            $table->decimal('salary_range', 15, 2)->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->json('social_media')->nullable();
            $table->json('achievements')->nullable();
            $table->json('career_highlights')->nullable();
            $table->json('education_after_graduation')->nullable();
            $table->enum('status', ['employed', 'unemployed', 'self_employed', 'studying', 'retired', 'unknown'])->default('unknown');
            $table->boolean('is_active')->default(true);
            $table->date('last_contact_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->index(['instansi_id', 'graduation_year']);
            $table->index(['instansi_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumnis');
    }
};
