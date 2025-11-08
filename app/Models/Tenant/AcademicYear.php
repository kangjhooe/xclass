<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class AcademicYear extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'year_name',
        'start_date',
        'end_date',
        'is_active',
        'current_semester',
        'instansi_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant (instansi) for this academic year
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get student grades for this academic year
     */
    public function studentGrades()
    {
        return $this->hasMany(StudentGrade::class);
    }

    /**
     * Get schedules for this academic year
     * Note: Schedule uses academic_year as string, not foreign key
     */
    public function schedules()
    {
        return Schedule::where('academic_year', $this->year_name)
            ->where('instansi_id', $this->instansi_id);
    }

    /**
     * Scope for active academic year
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get current active academic year
     * @param int|null $instansiId If null, will get first active academic year
     */
    public static function getCurrent(?int $instansiId = null)
    {
        $query = static::where('is_active', true);
        
        if ($instansiId) {
            $query->where('instansi_id', $instansiId);
        }
        
        return $query->first();
    }

    /**
     * Get current active semester for this academic year
     * @return int 1 for Ganjil, 2 for Genap
     */
    public function getCurrentSemester(): int
    {
        return $this->current_semester ?? 1;
    }

    /**
     * Get semester name
     * @return string
     */
    public function getSemesterName(): string
    {
        return $this->current_semester == 1 ? 'Ganjil' : 'Genap';
    }

    /**
     * Get current semester for active academic year (static method)
     * @param int|null $instansiId
     * @return int|null
     */
    public static function getActiveSemester(?int $instansiId = null): ?int
    {
        $academicYear = static::getCurrent($instansiId);
        return $academicYear ? $academicYear->getCurrentSemester() : null;
    }

    /**
     * Get academic year by year name
     */
    public function scopeByYear($query, $yearName)
    {
        return $query->where('year_name', $yearName);
    }

    /**
     * Check if academic year has related data
     */
    public function hasRelatedData(): bool
    {
        return $this->studentGrades()->exists();
    }

    /**
     * Get count of related data
     */
    public function getRelatedDataCount(): array
    {
        return [
            'student_grades' => $this->studentGrades()->count(),
            'schedules' => $this->schedules()->count(),
        ];
    }

    /**
     * Check if academic year can be deleted
     */
    public function canBeDeleted(): bool
    {
        // Tidak bisa dihapus jika sedang aktif
        if ($this->is_active) {
            return false;
        }

        // Tidak bisa dihapus jika memiliki data terkait
        if ($this->hasRelatedData()) {
            return false;
        }

        return true;
    }
}
