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
        Schema::create('teacher_supervisions', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('supervisor_id')->constrained('teachers')->onDelete('cascade')->comment('Guru yang melakukan supervisi');
            $table->foreignId('class_room_id')->nullable()->constrained('class_rooms')->onDelete('set null')->comment('Kelas yang diobservasi');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('set null')->comment('Mata pelajaran yang diobservasi');
            
            // Data Supervisi
            $table->date('supervision_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('supervision_type', ['akademik', 'administratif', 'kepribadian', 'sosial'])->default('akademik');
            $table->enum('supervision_method', ['observasi_kelas', 'observasi_non_kelas', 'wawancara', 'dokumentasi', 'kombinasi'])->default('observasi_kelas');
            
            // Aspek Penilaian
            $table->decimal('preparation_score', 5, 2)->nullable()->comment('Nilai persiapan (0-100)');
            $table->text('preparation_notes')->nullable();
            
            $table->decimal('implementation_score', 5, 2)->nullable()->comment('Nilai pelaksanaan (0-100)');
            $table->text('implementation_notes')->nullable();
            
            $table->decimal('classroom_management_score', 5, 2)->nullable()->comment('Nilai pengelolaan kelas (0-100)');
            $table->text('classroom_management_notes')->nullable();
            
            $table->decimal('student_interaction_score', 5, 2)->nullable()->comment('Nilai interaksi dengan siswa (0-100)');
            $table->text('student_interaction_notes')->nullable();
            
            $table->decimal('assessment_score', 5, 2)->nullable()->comment('Nilai penilaian (0-100)');
            $table->text('assessment_notes')->nullable();
            
            $table->decimal('overall_score', 5, 2)->nullable()->comment('Nilai keseluruhan (0-100)');
            $table->enum('overall_rating', ['sangat_baik', 'baik', 'cukup', 'kurang', 'sangat_kurang'])->nullable();
            
            // Kekuatan dan Kelemahan
            $table->text('strengths')->nullable()->comment('Kekuatan yang ditemukan');
            $table->text('weaknesses')->nullable()->comment('Kelemahan yang ditemukan');
            
            // Rencana Tindak Lanjut (RTL)
            $table->text('follow_up_plan')->nullable()->comment('Rencana tindak lanjut');
            $table->date('follow_up_date')->nullable()->comment('Tanggal tindak lanjut');
            $table->enum('follow_up_status', ['belum', 'sedang', 'selesai', 'tidak_perlu'])->default('belum');
            
            // Dokumentasi
            $table->text('documentation')->nullable()->comment('Dokumentasi supervisi (JSON atau text)');
            $table->json('attachments')->nullable()->comment('File lampiran (path)');
            
            // Catatan Tambahan
            $table->text('notes')->nullable();
            $table->text('teacher_response')->nullable()->comment('Tanggapan guru yang disupervisi');
            
            // Status
            $table->enum('status', ['draft', 'completed', 'archived'])->default('draft');
            $table->boolean('is_confirmed')->default(false)->comment('Sudah dikonfirmasi oleh guru');
            
            // Metadata
            $table->string('academic_year')->nullable();
            $table->integer('semester')->nullable();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['instansi_id', 'supervision_date']);
            $table->index(['teacher_id', 'supervision_date']);
            $table->index(['supervisor_id', 'supervision_date']);
            $table->index(['academic_year', 'semester']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_supervisions');
    }
};
