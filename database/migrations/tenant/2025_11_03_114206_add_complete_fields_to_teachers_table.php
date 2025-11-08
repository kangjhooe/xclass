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
        Schema::table('teachers', function (Blueprint $table) {
            // Data pribadi lengkap
            $table->string('page_id')->nullable()->after('nuptk');
            $table->string('npk')->nullable()->after('page_id');
            $table->string('nik', 16)->nullable()->after('npk');
            $table->string('mother_name')->nullable()->after('birth_place');
            $table->string('district')->nullable()->after('city');
            $table->string('village')->nullable()->after('district');
            
            // Data pendidikan
            $table->string('jenjang')->nullable()->after('education_level');
            $table->string('study_program_group')->nullable()->after('jenjang');
            
            // Status kepegawaian
            $table->string('employment_status')->nullable()->after('resignation_date');
            $table->enum('employment_status_detail', ['PNS', 'Non-PNS'])->nullable()->after('employment_status');
            $table->string('employment_status_non_pns')->nullable()->after('employment_status_detail');
            $table->string('golongan', 10)->nullable()->after('employment_status_non_pns');
            $table->date('tmt_sk_cpns')->nullable()->after('golongan');
            $table->date('tmt_sk_awal')->nullable()->after('tmt_sk_cpns');
            $table->date('tmt_sk_terakhir')->nullable()->after('tmt_sk_awal');
            $table->string('appointing_institution')->nullable()->after('tmt_sk_terakhir');
            $table->string('assignment_status')->nullable()->after('appointing_institution');
            $table->decimal('salary', 15, 2)->nullable()->after('assignment_status');
            $table->string('workplace_status')->nullable()->after('salary');
            $table->string('satminkal_type')->nullable()->after('workplace_status');
            $table->string('satminkal_npsn', 8)->nullable()->after('satminkal_type');
            $table->string('satminkal_identity')->nullable()->after('satminkal_npsn');
            $table->boolean('inpassing_status')->nullable()->after('satminkal_identity');
            $table->date('tmt_inpassing')->nullable()->after('inpassing_status');
            
            // Tugas dan mengajar
            $table->string('main_duty')->nullable()->after('tmt_inpassing');
            $table->string('additional_duty')->nullable()->after('main_duty');
            $table->string('main_duty_at_school')->nullable()->after('additional_duty');
            $table->string('active_status')->nullable()->after('main_duty_at_school');
            $table->string('main_subject')->nullable()->after('subject_specialization');
            $table->integer('teaching_hours_per_week')->nullable()->after('main_subject');
            $table->string('duty_type')->nullable()->after('teaching_hours_per_week');
            $table->integer('equivalent_teaching_hours')->nullable()->after('duty_type');
            $table->boolean('teach_elsewhere')->default(false)->after('equivalent_teaching_hours');
            $table->string('other_workplace_type')->nullable()->after('teach_elsewhere');
            $table->string('other_workplace_npsn', 8)->nullable()->after('other_workplace_type');
            $table->string('other_workplace_subject')->nullable()->after('other_workplace_npsn');
            $table->integer('other_workplace_hours')->nullable()->after('other_workplace_subject');
            
            // Sertifikasi
            $table->string('certification_participation_status')->nullable()->after('certification_date');
            $table->string('certification_pass_status')->nullable()->after('certification_participation_status');
            $table->year('certification_year')->nullable()->after('certification_pass_status');
            $table->string('certification_subject')->nullable()->after('certification_year');
            $table->string('nrg')->nullable()->after('certification_subject');
            $table->string('nrg_sk_number')->nullable()->after('nrg');
            $table->date('nrg_sk_date')->nullable()->after('nrg_sk_number');
            $table->string('certification_participant_number')->nullable()->after('nrg_sk_date');
            $table->string('certification_type')->nullable()->after('certification_participant_number');
            $table->date('certification_pass_date')->nullable()->after('certification_type');
            $table->string('certificate_number')->nullable()->after('certification_pass_date');
            $table->date('certificate_issue_date')->nullable()->after('certificate_number');
            $table->string('lptk_name')->nullable()->after('certificate_issue_date');
            
            // Tunjangan
            $table->boolean('tpg_recipient_status')->default(false)->after('lptk_name');
            $table->year('tpg_start_year')->nullable()->after('tpg_recipient_status');
            $table->decimal('tpg_amount', 15, 2)->nullable()->after('tpg_start_year');
            $table->boolean('tfg_recipient_status')->default(false)->after('tpg_amount');
            $table->year('tfg_start_year')->nullable()->after('tfg_recipient_status');
            $table->decimal('tfg_amount', 15, 2)->nullable()->after('tfg_start_year');
            
            // Penghargaan
            $table->boolean('has_award')->default(false)->after('tfg_amount');
            $table->string('highest_award')->nullable()->after('has_award');
            $table->string('award_field')->nullable()->after('highest_award');
            $table->string('award_level')->nullable()->after('award_field');
            $table->year('award_year')->nullable()->after('award_level');
            $table->boolean('training_participated')->default(false)->after('award_year');
            $table->string('training_1')->nullable()->after('training_participated');
            $table->year('training_year_1')->nullable()->after('training_1');
            $table->string('training_2')->nullable()->after('training_year_1');
            $table->year('training_year_2')->nullable()->after('training_2');
            $table->string('training_3')->nullable()->after('training_year_2');
            $table->year('training_year_3')->nullable()->after('training_3');
            $table->string('training_4')->nullable()->after('training_year_3');
            $table->year('training_year_4')->nullable()->after('training_4');
            $table->string('training_5')->nullable()->after('training_year_4');
            $table->year('training_year_5')->nullable()->after('training_5');
            
            // Kompetensi (untuk kepala madrasah)
            $table->text('personality_competence')->nullable()->after('training_year_5');
            $table->text('managerial_competence')->nullable()->after('personality_competence');
            $table->text('entrepreneurship_competence')->nullable()->after('managerial_competence');
            $table->text('supervision_competence')->nullable()->after('entrepreneurship_competence');
            $table->text('social_competence')->nullable()->after('supervision_competence');
            
            // Update beberapa field existing yang perlu diubah
            $table->string('religion')->nullable()->after('gender');
            $table->string('employee_number')->nullable()->after('nip');
        });
        
        // Update enum gender untuk support L/P format
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('gender')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            // Data pribadi
            $table->dropColumn([
                'page_id', 'npk', 'nik', 'mother_name', 'district', 'village',
                // Data pendidikan
                'jenjang', 'study_program_group',
                // Status kepegawaian
                'employment_status', 'employment_status_detail', 'employment_status_non_pns',
                'golongan', 'tmt_sk_cpns', 'tmt_sk_awal', 'tmt_sk_terakhir',
                'appointing_institution', 'assignment_status', 'salary', 'workplace_status',
                'satminkal_type', 'satminkal_npsn', 'satminkal_identity', 'inpassing_status', 'tmt_inpassing',
                // Tugas dan mengajar
                'main_duty', 'additional_duty', 'main_duty_at_school', 'active_status',
                'main_subject', 'teaching_hours_per_week', 'duty_type', 'equivalent_teaching_hours',
                'teach_elsewhere', 'other_workplace_type', 'other_workplace_npsn',
                'other_workplace_subject', 'other_workplace_hours',
                // Sertifikasi
                'certification_participation_status', 'certification_pass_status', 'certification_year',
                'certification_subject', 'nrg', 'nrg_sk_number', 'nrg_sk_date',
                'certification_participant_number', 'certification_type', 'certification_pass_date',
                'certificate_number', 'certificate_issue_date', 'lptk_name',
                // Tunjangan
                'tpg_recipient_status', 'tpg_start_year', 'tpg_amount',
                'tfg_recipient_status', 'tfg_start_year', 'tfg_amount',
                // Penghargaan
                'has_award', 'highest_award', 'award_field', 'award_level', 'award_year',
                'training_participated', 'training_1', 'training_year_1', 'training_2', 'training_year_2',
                'training_3', 'training_year_3', 'training_4', 'training_year_4',
                'training_5', 'training_year_5',
                // Kompetensi
                'personality_competence', 'managerial_competence', 'entrepreneurship_competence',
                'supervision_competence', 'social_competence',
                'religion', 'employee_number'
            ]);
        });
    }
};
