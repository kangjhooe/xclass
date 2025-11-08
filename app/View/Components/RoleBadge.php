<?php

namespace App\View\Components;

use Illuminate\View\Component;
use App\Helpers\RbacHelper;

/**
 * Role Badge Component
 * 
 * Displays user role with appropriate styling
 */
class RoleBadge extends Component
{
    public string $role;
    public string $displayName;
    public string $badgeClass;

    /**
     * Create a new component instance.
     */
    public function __construct(string $role)
    {
        $this->role = $role;
        $this->displayName = RbacHelper::getRoleDisplayName($role);
        $this->badgeClass = RbacHelper::getRoleBadgeClass($role);
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.role-badge');
    }
}