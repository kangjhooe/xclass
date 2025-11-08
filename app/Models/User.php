<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Traits\HasNpsn;
use App\Models\Core\Tenant;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasNpsn;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'instansi_id',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get the tenant (instansi) for this user
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'instansi_id');
    }

    /**
     * Get the teacher profile for this user
     */
    public function teacher()
    {
        return $this->hasOne(\App\Models\Tenant\Teacher::class);
    }

    /**
     * Check if user has specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the specified roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is school admin
     */
    public function isSchoolAdmin(): bool
    {
        return $this->role === 'school_admin';
    }

    /**
     * Check if user is teacher
     */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isProspectiveStudent(): bool
    {
        return $this->role === 'calon_siswa';
    }

    /**
     * Check if user is parent
     */
    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    /**
     * Get user's full name with role
     */
    public function getFullNameWithRoleAttribute(): string
    {
        $roleNames = [
            'super_admin' => 'Super Admin',
            'school_admin' => 'Admin Sekolah',
            'teacher' => 'Guru',
            'student' => 'Siswa',
            'parent' => 'Orang Tua',
            'calon_siswa' => 'Calon Siswa',
        ];

        $roleName = $roleNames[$this->role] ?? $this->role;
        
        return $this->name . ' (' . $roleName . ')';
    }
}
