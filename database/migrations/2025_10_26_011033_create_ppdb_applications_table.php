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
        Schema::create('ppdb_applications', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number')->unique();
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->date('birth_date');
            $table->string('birth_place');
            $table->enum('gender', ['L', 'P']);
            $table->text('address');
            $table->string('previous_school');
            $table->string('previous_school_address');
            $table->string('major_choice');
            $table->string('parent_name');
            $table->string('parent_phone');
            $table->string('parent_occupation');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('ijazah_path')->nullable();
            $table->string('kk_path')->nullable();
            $table->string('academic_year');
            $table->string('batch');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppdb_applications');
    }
};
