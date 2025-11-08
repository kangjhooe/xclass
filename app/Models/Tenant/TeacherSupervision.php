<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasNpsn;
use App\Models\Traits\HasInstansi;
use App\Models\Traits\HasAuditLog;

class TeacherSupervision extends Model
{
    use HasFactory, HasNpsn, HasInstansi, HasAuditLog, SoftDeletes;

    protected $fillable = [
        'npsn',
        'teacher_id',
        'supervisor_id',
        'class_room_id',
        'subject_id',
        'supervision_date',
        'start_time',
        'end_time',
        'supervision_type',
        'supervision_method',
        'preparation_score',
        'preparation_notes',
        'implementation_score',
        'implementation_notes',
        'classroom_management_score',
        'classroom_management_notes',
        'student_interaction_score',
        'student_interaction_notes',
        'assessment_score',
        'assessment_notes',
        'overall_score',
        'overall_rating',
        'strengths',
        'weaknesses',
        'follow_up_plan',
        'follow_up_date',
        'follow_up_status',
        'documentation',
        'attachments',
        'notes',
        'teacher_response',
        'status',
        'is_confirmed',
        'academic_year',
        'semester',
        'instansi_id',
    ];

    protected $casts = [
        'supervision_date' => 'date',
        'follow_up_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'preparation_score' => 'decimal:2',
        'implementation_score' => 'decimal:2',
        'classroom_management_score' => 'decimal:2',
        'student_interaction_score' => 'decimal:2',
        'assessment_score' => 'decimal:2',
        'overall_score' => 'decimal:2',
        'is_confirmed' => 'boolean',
        'attachments' => 'array',
        'semester' => 'integer',
    ];

    // Constants
    const TYPE_AKADEMIK = 'akademik';
    const TYPE_ADMINISTRATIF = 'administratif';
    const TYPE_KEPRIBADIAN = 'kepribadian';
    const TYPE_SOSIAL = 'sosial';

    const METHOD_OBSERVASI_KELAS = 'observasi_kelas';
    const METHOD_OBSERVASI_NON_KELAS = 'observasi_non_kelas';
    const METHOD_WAWANCARA = 'wawancara';
    const METHOD_DOKUMENTASI = 'dokumentasi';
    const METHOD_KOMBINASI = 'kombinasi';

    const STATUS_DRAFT = 'draft';
    const STATUS_COMPLETED = 'completed';
    const STATUS_ARCHIVED = 'archived';

    const RATING_SANGAT_BAIK = 'sangat_baik';
    const RATING_BAIK = 'baik';
    const RATING_CUKUP = 'cukup';
    const RATING_KURANG = 'kurang';
    const RATING_SANGAT_KURANG = 'sangat_kurang';

    const FOLLOW_UP_BELUM = 'belum';
    const FOLLOW_UP_SEDANG = 'sedang';
    const FOLLOW_UP_SELESAI = 'selesai';
    const FOLLOW_UP_TIDAK_PERLU = 'tidak_perlu';

    /**
     * Get the teacher being supervised
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the supervisor (teacher who supervises)
     */
    public function supervisor()
    {
        return $this->belongsTo(Teacher::class, 'supervisor_id');
    }

    /**
     * Get the class room
     */
    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class);
    }

    /**
     * Get the subject
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the tenant (instansi)
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Calculate overall score from all aspect scores
     */
    public function calculateOverallScore()
    {
        $scores = [];
        
        if ($this->preparation_score !== null) {
            $scores[] = $this->preparation_score;
        }
        if ($this->implementation_score !== null) {
            $scores[] = $this->implementation_score;
        }
        if ($this->classroom_management_score !== null) {
            $scores[] = $this->classroom_management_score;
        }
        if ($this->student_interaction_score !== null) {
            $scores[] = $this->student_interaction_score;
        }
        if ($this->assessment_score !== null) {
            $scores[] = $this->assessment_score;
        }

        if (empty($scores)) {
            return null;
        }

        return round(array_sum($scores) / count($scores), 2);
    }

    /**
     * Get overall rating based on score
     */
    public function getOverallRatingFromScore($score)
    {
        if ($score >= 90) {
            return self::RATING_SANGAT_BAIK;
        } elseif ($score >= 80) {
            return self::RATING_BAIK;
        } elseif ($score >= 70) {
            return self::RATING_CUKUP;
        } elseif ($score >= 60) {
            return self::RATING_KURANG;
        } else {
            return self::RATING_SANGAT_KURANG;
        }
    }

    /**
     * Get supervision type label
     */
    public function getSupervisionTypeLabelAttribute()
    {
        $labels = [
            self::TYPE_AKADEMIK => 'Akademik',
            self::TYPE_ADMINISTRATIF => 'Administratif',
            self::TYPE_KEPRIBADIAN => 'Kepribadian',
            self::TYPE_SOSIAL => 'Sosial',
        ];

        return $labels[$this->supervision_type] ?? $this->supervision_type;
    }

    /**
     * Get supervision method label
     */
    public function getSupervisionMethodLabelAttribute()
    {
        $labels = [
            self::METHOD_OBSERVASI_KELAS => 'Observasi Kelas',
            self::METHOD_OBSERVASI_NON_KELAS => 'Observasi Non Kelas',
            self::METHOD_WAWANCARA => 'Wawancara',
            self::METHOD_DOKUMENTASI => 'Dokumentasi',
            self::METHOD_KOMBINASI => 'Kombinasi',
        ];

        return $labels[$this->supervision_method] ?? $this->supervision_method;
    }

    /**
     * Get overall rating label
     */
    public function getOverallRatingLabelAttribute()
    {
        $labels = [
            self::RATING_SANGAT_BAIK => 'Sangat Baik',
            self::RATING_BAIK => 'Baik',
            self::RATING_CUKUP => 'Cukup',
            self::RATING_KURANG => 'Kurang',
            self::RATING_SANGAT_KURANG => 'Sangat Kurang',
        ];

        return $labels[$this->overall_rating] ?? $this->overall_rating;
    }

    /**
     * Get follow up status label
     */
    public function getFollowUpStatusLabelAttribute()
    {
        $labels = [
            self::FOLLOW_UP_BELUM => 'Belum',
            self::FOLLOW_UP_SEDANG => 'Sedang Berjalan',
            self::FOLLOW_UP_SELESAI => 'Selesai',
            self::FOLLOW_UP_TIDAK_PERLU => 'Tidak Perlu',
        ];

        return $labels[$this->follow_up_status] ?? $this->follow_up_status;
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_ARCHIVED => 'Diarsipkan',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Scope for completed supervisions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for draft supervisions
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Scope for archived supervisions
     */
    public function scopeArchived($query)
    {
        return $query->where('status', self::STATUS_ARCHIVED);
    }

    /**
     * Scope for confirmed supervisions
     */
    public function scopeConfirmed($query)
    {
        return $query->where('is_confirmed', true);
    }

    /**
     * Scope for unconfirmed supervisions
     */
    public function scopeUnconfirmed($query)
    {
        return $query->where('is_confirmed', false);
    }

    /**
     * Scope for specific academic year and semester
     */
    public function scopeAcademicPeriod($query, $academicYear, $semester = null)
    {
        $query->where('academic_year', $academicYear);
        
        if ($semester !== null) {
            $query->where('semester', $semester);
        }
        
        return $query;
    }

    /**
     * Scope for specific teacher
     */
    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Scope for specific supervisor
     */
    public function scopeBySupervisor($query, $supervisorId)
    {
        return $query->where('supervisor_id', $supervisorId);
    }
}
