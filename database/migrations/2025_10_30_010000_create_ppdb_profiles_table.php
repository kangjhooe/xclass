<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ppdb_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ppdb_application_id')->unique();
            // Data Siswa
            $table->string('nisn')->nullable();
            $table->string('nik')->nullable();
            $table->enum('gender', ['L','P'])->nullable();
            $table->string('blood_type')->nullable(); // A,B,O,AB
            // Alamat terstruktur
            $table->string('address_street')->nullable();
            $table->string('address_village')->nullable();
            $table->string('address_sub_district')->nullable();
            $table->string('address_district')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_province')->nullable();
            // Kartu dan no keluarga
            $table->string('kk_number')->nullable();
            $table->string('social_card_number')->nullable(); // KIP/PKH/KIS
            // Sekolah asal
            $table->string('previous_school_name')->nullable();
            $table->string('previous_school_address')->nullable();
            $table->string('previous_school_npsn')->nullable();
            // Kontak & minat
            $table->string('phone')->nullable();
            $table->string('hobby')->nullable();
            $table->string('ambition')->nullable();
            // Fisik
            $table->unsignedSmallInteger('height_cm')->nullable();
            $table->unsignedSmallInteger('weight_kg')->nullable();

            // Data Keluarga
            $table->unsignedSmallInteger('family_child_order')->nullable();
            $table->unsignedSmallInteger('siblings_count')->nullable();
            $table->unsignedSmallInteger('step_siblings_count')->nullable();
            $table->decimal('parent_income_avg', 15, 2)->nullable();

            // Data Ayah
            $table->string('father_status')->nullable(); // hidup/wafat/lainnya
            $table->string('father_nik')->nullable();
            $table->string('father_name')->nullable();
            $table->string('father_birth_place')->nullable();
            $table->date('father_birth_date')->nullable();
            $table->string('father_education')->nullable();
            $table->string('father_occupation')->nullable();

            // Data Ibu
            $table->string('mother_status')->nullable();
            $table->string('mother_nik')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('mother_birth_place')->nullable();
            $table->date('mother_birth_date')->nullable();
            $table->string('mother_education')->nullable();
            $table->string('mother_occupation')->nullable();

            // Data Wali (opsional)
            $table->string('guardian_relation_source')->nullable(); // same_as_father/same_as_mother/custom
            $table->string('guardian_nik')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_birth_place')->nullable();
            $table->date('guardian_birth_date')->nullable();
            $table->string('guardian_education')->nullable();
            $table->string('guardian_occupation')->nullable();
            $table->decimal('guardian_income', 15, 2)->nullable();

            // Progress
            $table->unsignedTinyInteger('wizard_step')->default(1); // langkah terakhir tersimpan
            $table->timestamps();

            $table->foreign('ppdb_application_id')->references('id')->on('ppdb_applications')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ppdb_profiles');
    }
};


