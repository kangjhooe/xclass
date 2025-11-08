<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Policies\DataPokokPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => DataPokokPolicy::class,
        \App\Models\Tenant\ClassRoom::class => \App\Policies\Tenant\ClassRoomPolicy::class,
        \App\Models\Tenant\Student::class => \App\Policies\Tenant\StudentPolicy::class,
        \App\Models\Tenant\Subject::class => \App\Policies\Tenant\SubjectPolicy::class,
        \App\Models\Tenant\Schedule::class => \App\Policies\Tenant\SchedulePolicy::class,
        \App\Models\Tenant\Attendance::class => \App\Policies\Tenant\AttendancePolicy::class,
        \App\Models\Tenant\Grade::class => \App\Policies\Tenant\GradePolicy::class,
        \App\Models\Tenant\Teacher::class => \App\Policies\Tenant\TeacherPolicy::class,
        \App\Models\Tenant\Staff::class => \App\Policies\Tenant\StaffPolicy::class,
        \App\Models\Tenant\AdditionalDuty::class => \App\Policies\Tenant\AdditionalDutyPolicy::class,
        \App\Models\Tenant\AcademicYear::class => \App\Policies\Tenant\AcademicYearPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Register policies
        $this->registerPolicies();

        // Define gates
        Gate::define('bypass-tenant-scope', function (User $user) {
            return $user->role === 'super_admin';
        });
        Gate::define('manage', function (User $user, $model) {
            return $user->role === 'super_admin';
        });

        Gate::define('view', function (User $user, $model = null) {
            return in_array($user->role, ['super_admin', 'school_admin']);
        });

        Gate::define('create', function (User $user, $model = null) {
            return in_array($user->role, ['super_admin', 'school_admin']);
        });

        Gate::define('update', function (User $user, $model = null) {
            return in_array($user->role, ['super_admin', 'school_admin']);
        });

        Gate::define('delete', function (User $user, $model = null) {
            return $user->role === 'super_admin';
        });

        Gate::define('export', function (User $user) {
            return in_array($user->role, ['super_admin', 'school_admin']);
        });

        Gate::define('import', function (User $user) {
            return in_array($user->role, ['super_admin', 'school_admin']);
        });
    }
}