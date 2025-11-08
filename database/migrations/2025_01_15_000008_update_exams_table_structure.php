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
        // Drop foreign keys only if columns exist
        Schema::table('exams', function (Blueprint $table) {
            if (Schema::hasColumn('exams', 'subject_id')) {
                try {
                    $table->dropForeign(['subject_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
            }
            if (Schema::hasColumn('exams', 'class_id')) {
                try {
                    $table->dropForeign(['class_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
            }
            if (Schema::hasColumn('exams', 'teacher_id')) {
                try {
                    $table->dropForeign(['teacher_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
            }
        });
        
        // Drop columns only if they exist
        Schema::table('exams', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('exams', 'subject_id')) $columnsToDrop[] = 'subject_id';
            if (Schema::hasColumn('exams', 'class_id')) $columnsToDrop[] = 'class_id';
            if (Schema::hasColumn('exams', 'teacher_id')) $columnsToDrop[] = 'teacher_id';
            if (Schema::hasColumn('exams', 'duration')) $columnsToDrop[] = 'duration';
            if (Schema::hasColumn('exams', 'total_questions')) $columnsToDrop[] = 'total_questions';
            if (Schema::hasColumn('exams', 'total_score')) $columnsToDrop[] = 'total_score';
            if (Schema::hasColumn('exams', 'passing_score')) $columnsToDrop[] = 'passing_score';
            if (Schema::hasColumn('exams', 'allow_review')) $columnsToDrop[] = 'allow_review';
            if (Schema::hasColumn('exams', 'show_correct_answers')) $columnsToDrop[] = 'show_correct_answers';
            if (Schema::hasColumn('exams', 'randomize_questions')) $columnsToDrop[] = 'randomize_questions';
            if (Schema::hasColumn('exams', 'randomize_answers')) $columnsToDrop[] = 'randomize_answers';
            if (Schema::hasColumn('exams', 'max_attempts')) $columnsToDrop[] = 'max_attempts';
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        // Add new columns for enhanced structure (only if they don't exist)
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'semester')) {
                $table->string('semester')->nullable()->after('exam_type');
            }
            if (!Schema::hasColumn('exams', 'academic_year')) {
                $table->string('academic_year')->nullable()->after('semester');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            // Add back old columns
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade')->after('description');
            $table->foreignId('class_id')->constrained('class_rooms')->onDelete('cascade')->after('subject_id');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade')->after('class_id');
            $table->integer('duration')->comment('Duration in minutes')->after('teacher_id');
            $table->integer('total_questions')->default(0)->after('duration');
            $table->integer('total_score')->default(0)->after('total_questions');
            $table->integer('passing_score')->default(0)->after('total_score');
            $table->boolean('allow_review')->default(true)->comment('Allow students to review their answers')->after('passing_score');
            $table->boolean('show_correct_answers')->default(false)->comment('Show correct answers after exam')->after('allow_review');
            $table->boolean('randomize_questions')->default(false)->comment('Randomize question order')->after('show_correct_answers');
            $table->boolean('randomize_answers')->default(false)->comment('Randomize answer options')->after('randomize_questions');
            $table->integer('max_attempts')->default(1)->comment('Maximum number of attempts')->after('randomize_answers');

            // Remove new columns
            $table->dropColumn(['semester', 'academic_year']);
        });
    }
};
