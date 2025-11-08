<?php

namespace App\Policies\Tenant;

use App\Models\Core\Tenant;
use App\Models\Tenant\Alumni;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AlumniPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Tenant $tenant)
    {
        return $user->instansi_id === $tenant->id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Alumni $alumni)
    {
        return $user->instansi_id === $alumni->instansi_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Tenant $tenant)
    {
        return $user->instansi_id === $tenant->id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Alumni $alumni)
    {
        return $user->instansi_id === $alumni->instansi_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Alumni $alumni)
    {
        return $user->instansi_id === $alumni->instansi_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Alumni $alumni)
    {
        return $user->instansi_id === $alumni->instansi_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Alumni $alumni)
    {
        return $user->instansi_id === $alumni->instansi_id;
    }
}
