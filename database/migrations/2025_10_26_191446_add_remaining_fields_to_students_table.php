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
        Schema::table('students', function (Blueprint $table) {
            // Hanya tambahkan kolom yang belum ada
            $table->string('residence_type')->nullable()->after('district'); // Jenis Tempat Tinggal
            $table->string('transportation')->nullable()->after('residence_type'); // Alat Transportasi ke Sekolah
            
            // Data Asal Sekolah
            $table->string('previous_school')->nullable()->after('transportation'); // Sekolah Sebelumnya
            $table->text('previous_school_address')->nullable()->after('previous_school'); // Alamat Sekolah Sebelumnya
            $table->string('previous_school_city')->nullable()->after('previous_school_address'); // Kota Sekolah Sebelumnya
            $table->string('previous_school_province')->nullable()->after('previous_school_city'); // Provinsi Sekolah Sebelumnya
            $table->string('previous_school_phone')->nullable()->after('previous_school_province'); // Telepon Sekolah Sebelumnya
            $table->string('previous_school_principal')->nullable()->after('previous_school_phone'); // Kepala Sekolah Sebelumnya
            $table->string('previous_school_graduation_year')->nullable()->after('previous_school_principal'); // Tahun Lulus Sekolah Sebelumnya
            $table->string('previous_school_certificate_number')->nullable()->after('previous_school_graduation_year'); // Nomor Ijazah Sekolah Sebelumnya
            
            // Data Orang Tua Lengkap
            $table->string('father_name')->nullable()->after('parent_name'); // Nama Ayah
            $table->string('father_nik', 16)->nullable()->after('father_name'); // NIK Ayah
            $table->date('father_birth_date')->nullable()->after('father_nik'); // Tanggal Lahir Ayah
            $table->string('father_birth_place')->nullable()->after('father_birth_date'); // Tempat Lahir Ayah
            $table->string('father_education')->nullable()->after('father_birth_place'); // Pendidikan Ayah
            $table->string('father_occupation')->nullable()->after('father_education'); // Pekerjaan Ayah
            $table->string('father_company')->nullable()->after('father_occupation'); // Perusahaan Ayah
            $table->string('father_phone')->nullable()->after('father_company'); // Telepon Ayah
            $table->string('father_email')->nullable()->after('father_phone'); // Email Ayah
            $table->decimal('father_income', 15, 2)->nullable()->after('father_email'); // Penghasilan Ayah
            
            $table->string('mother_name')->nullable()->after('father_income'); // Nama Ibu
            $table->string('mother_nik', 16)->nullable()->after('mother_name'); // NIK Ibu
            $table->date('mother_birth_date')->nullable()->after('mother_nik'); // Tanggal Lahir Ibu
            $table->string('mother_birth_place')->nullable()->after('mother_birth_date'); // Tempat Lahir Ibu
            $table->string('mother_education')->nullable()->after('mother_birth_place'); // Pendidikan Ibu
            $table->string('mother_occupation')->nullable()->after('mother_education'); // Pekerjaan Ibu
            $table->string('mother_company')->nullable()->after('mother_occupation'); // Perusahaan Ibu
            $table->string('mother_phone')->nullable()->after('mother_company'); // Telepon Ibu
            $table->string('mother_email')->nullable()->after('mother_phone'); // Email Ibu
            $table->decimal('mother_income', 15, 2)->nullable()->after('mother_email'); // Penghasilan Ibu
            
            // Data Wali (jika ada)
            $table->string('guardian_name')->nullable()->after('mother_income'); // Nama Wali
            $table->string('guardian_nik', 16)->nullable()->after('guardian_name'); // NIK Wali
            $table->date('guardian_birth_date')->nullable()->after('guardian_nik'); // Tanggal Lahir Wali
            $table->string('guardian_birth_place')->nullable()->after('guardian_birth_date'); // Tempat Lahir Wali
            $table->string('guardian_education')->nullable()->after('guardian_birth_place'); // Pendidikan Wali
            $table->string('guardian_occupation')->nullable()->after('guardian_education'); // Pekerjaan Wali
            $table->string('guardian_company')->nullable()->after('guardian_occupation'); // Perusahaan Wali
            $table->string('guardian_phone')->nullable()->after('guardian_company'); // Telepon Wali
            $table->string('guardian_email')->nullable()->after('guardian_phone'); // Email Wali
            $table->decimal('guardian_income', 15, 2)->nullable()->after('guardian_email'); // Penghasilan Wali
            $table->string('guardian_relationship')->nullable()->after('guardian_income'); // Hubungan dengan Wali
            
            // Data Kesehatan
            $table->string('height')->nullable()->after('guardian_relationship'); // Tinggi Badan
            $table->string('weight')->nullable()->after('height'); // Berat Badan
            $table->string('health_condition')->nullable()->after('weight'); // Kondisi Kesehatan
            $table->text('health_notes')->nullable()->after('health_condition'); // Catatan Kesehatan
            $table->string('allergies')->nullable()->after('health_notes'); // Alergi
            $table->string('medications')->nullable()->after('allergies'); // Obat-obatan yang Dikonsumsi
            
            // Data Akademik
            $table->string('enrollment_semester')->nullable()->after('enrollment_date'); // Semester Masuk
            $table->string('enrollment_year')->nullable()->after('enrollment_semester'); // Tahun Masuk
            $table->string('student_status')->default('active')->after('enrollment_year'); // Status Siswa
            $table->text('notes')->nullable()->after('student_status'); // Catatan Khusus
            
            // Data Darurat
            $table->string('emergency_contact_name')->nullable()->after('notes'); // Nama Kontak Darurat
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name'); // Telepon Kontak Darurat
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_phone'); // Hubungan Kontak Darurat
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'residence_type', 'transportation', 'previous_school', 'previous_school_address',
                'previous_school_city', 'previous_school_province', 'previous_school_phone',
                'previous_school_principal', 'previous_school_graduation_year', 'previous_school_certificate_number',
                'father_name', 'father_nik', 'father_birth_date', 'father_birth_place',
                'father_education', 'father_occupation', 'father_company', 'father_phone',
                'father_email', 'father_income', 'mother_name', 'mother_nik', 'mother_birth_date',
                'mother_birth_place', 'mother_education', 'mother_occupation', 'mother_company',
                'mother_phone', 'mother_email', 'mother_income', 'guardian_name', 'guardian_nik',
                'guardian_birth_date', 'guardian_birth_place', 'guardian_education',
                'guardian_occupation', 'guardian_company', 'guardian_phone', 'guardian_email',
                'guardian_income', 'guardian_relationship', 'height', 'weight', 'health_condition',
                'health_notes', 'allergies', 'medications', 'enrollment_semester', 'enrollment_year',
                'student_status', 'notes', 'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship'
            ]);
        });
    }
};