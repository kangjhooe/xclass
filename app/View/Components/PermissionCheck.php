<?php

namespace App\View\Components;

use Illuminate\View\Component;
use App\Helpers\RbacHelper;
use App\Models\User;

/**
 * Permission Check Component
 * 
 * Conditionally renders content based on user permissions
 */
class PermissionCheck extends Component
{
    public User $user;
    public string $permission;
    public bool $hasPermission;

    /**
     * Create a new component instance.
     */
    public function __construct(User $user, string $permission)
    {
        $this->user = $user;
        $this->permission = $permission;
        $this->hasPermission = RbacHelper::hasPermission($user, $permission);
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.permission-check');
    }
}