@props(['role'])

@php
    $displayName = \App\Helpers\RbacHelper::getRoleDisplayName($role);
    $badgeClass = \App\Helpers\RbacHelper::getRoleBadgeClass($role);
@endphp

<span class="badge {{ $badgeClass }}">
    {{ $displayName }}
</span>