<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasNpsn;

class Grade extends Model
{
    use HasFactory, HasNpsn;

    protected $fillable = [
        'npsn',
        'student_id',
        'subject_id',
        'teacher_id',
        'assignment_type',
        'assignment_name',
        'score',
        'max_score',
        'weight',
        'semester',
        'academic_year',
        'notes',
        'instansi_id',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'weight' => 'decimal:2',
    ];

    const ASSIGNMENT_QUIZ = 'quiz';
    const ASSIGNMENT_HOMEWORK = 'homework';
    const ASSIGNMENT_MIDTERM = 'midterm';
    const ASSIGNMENT_FINAL = 'final';
    const ASSIGNMENT_PROJECT = 'project';

    /**
     * Get the tenant (instansi) for this grade
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
     * Get the percentage score
     */
    public function getPercentageAttribute()
    {
        if ($this->max_score > 0) {
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
            self::ASSIGNMENT_QUIZ => 'Kuis',
            self::ASSIGNMENT_HOMEWORK => 'Tugas',
            self::ASSIGNMENT_MIDTERM => 'UTS',
            self::ASSIGNMENT_FINAL => 'UAS',
            self::ASSIGNMENT_PROJECT => 'Proyek',
        ];

        return $labels[$this->assignment_type] ?? $this->assignment_type;
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
}