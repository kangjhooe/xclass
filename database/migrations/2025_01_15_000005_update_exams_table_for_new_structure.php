<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop index first (required for SQLite before dropping columns)
        // SQLite requires dropping indexes using DROP INDEX statement
        $driver = DB::connection()->getDriverName();
        if ($driver === 'sqlite' && Schema::hasColumn('exams', 'subject_id') && Schema::hasColumn('exams', 'class_id')) {
            try {
                DB::statement('DROP INDEX IF EXISTS exams_subject_id_class_id_index');
            } catch (\Exception $e) {
                // Index might not exist or already dropped, continue
            }
        } else {
            Schema::table('exams', function (Blueprint $table) {
                if (Schema::hasColumn('exams', 'subject_id') && Schema::hasColumn('exams', 'class_id')) {
                    try {
                        $table->dropIndex(['subject_id', 'class_id']);
                    } catch (\Exception $e) {
                        // Index might not exist or already dropped, continue
                    }
                }
            });
        }
        
        Schema::table('exams', function (Blueprint $table) {
            // Drop foreign key constraints
            if (Schema::hasColumn('exams', 'subject_id')) {
                $table->dropForeign(['subject_id']);
            }
            if (Schema::hasColumn('exams', 'class_id')) {
                $table->dropForeign(['class_id']);
            }
            if (Schema::hasColumn('exams', 'teacher_id')) {
                $table->dropForeign(['teacher_id']);
            }
        });
        
        Schema::table('exams', function (Blueprint $table) {
            // Remove old columns that are now handled by exam_schedules and exam_subjects
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
        
        Schema::table('exams', function (Blueprint $table) {
            // Add new columns for simplified exam structure
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
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained('class_rooms')->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');
            $table->integer('duration')->nullable()->comment('Duration in minutes');
            $table->integer('total_questions')->default(0);
            $table->integer('total_score')->default(0);
            $table->integer('passing_score')->default(0);
            $table->boolean('allow_review')->default(true);
            $table->boolean('show_correct_answers')->default(false);
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('randomize_answers')->default(false);
            $table->integer('max_attempts')->default(1);
            
            // Remove new columns
            $table->dropColumn(['semester', 'academic_year']);
        });
    }
};
