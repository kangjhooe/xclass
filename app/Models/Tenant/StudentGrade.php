<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class StudentGrade extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'student_id',
        'subject_id',
        'teacher_id',
        'academic_year_id',
        'semester',
        'assignment_type',
        'assignment_name',
        'score',
        'max_score',
        'weight',
        'final_score',
        'notes',
        'is_passed',
        'instansi_id',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'weight' => 'decimal:2',
        'final_score' => 'decimal:2',
        'is_passed' => 'boolean',
    ];

    const ASSIGNMENT_TASK = 'tugas';
    const ASSIGNMENT_UTS = 'uts';
    const ASSIGNMENT_UAS = 'uas';
    const ASSIGNMENT_QUIZ = 'quiz';
    const ASSIGNMENT_PROJECT = 'project';

    /**
     * Get the tenant (instansi) for this student grade
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the student for this grade
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the subject for this grade
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher for this grade
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the academic year for this grade
     */
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get the percentage score
     */
    public function getPercentageAttribute()
    {
        if ($this->max_score > 0 && $this->score !== null) {
            return round(($this->score / $this->max_score) * 100, 2);
        }
        return 0;
    }

    /**
     * Get the letter grade
     */
    public function getLetterGradeAttribute()
    {
        $percentage = $this->percentage;
        
        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'E';
    }

    /**
     * Get assignment type label
     */
    public function getAssignmentTypeLabelAttribute()
    {
        $labels = [
            self::ASSIGNMENT_TASK => 'Tugas',
            self::ASSIGNMENT_UTS => 'UTS',
            self::ASSIGNMENT_UAS => 'UAS',
            self::ASSIGNMENT_QUIZ => 'Kuis',
            self::ASSIGNMENT_PROJECT => 'Proyek',
        ];

        return $labels[$this->assignment_type] ?? $this->assignment_type;
    }

    /**
     * Calculate final score with weight
     */
    public function calculateFinalScore()
    {
        if ($this->score !== null && $this->max_score > 0) {
            $percentage = ($this->score / $this->max_score) * 100;
            $this->final_score = round($percentage * $this->weight, 2);
            $this->is_passed = $this->final_score >= 60; // KKM 60
            $this->save();
        }
    }

    /**
     * Scope for grades by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope for grades by subject
     */
    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    /**
     * Scope for grades by semester
     */
    public function scopeBySemester($query, $semester)
    {
        return $query->where('semester', $semester);
    }

    /**
     * Scope for grades by academic year
     */
    public function scopeByAcademicYear($query, $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    /**
     * Scope for grades by assignment type
     */
    public function scopeByAssignmentType($query, $assignmentType)
    {
        return $query->where('assignment_type', $assignmentType);
    }

    /**
     * Get average score for student in subject
     */
    public static function getAverageScore($studentId, $subjectId, $academicYearId, $semester)
    {
        $grades = static::where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->where('academic_year_id', $academicYearId)
            ->where('semester', $semester)
            ->whereNotNull('final_score')
            ->get();

        if ($grades->isEmpty()) {
            return 0;
        }

        return round($grades->avg('final_score'), 2);
    }
}
