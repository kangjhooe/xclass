@props(['user', 'permission'])

@if(\App\Helpers\RbacHelper::hasPermission($user, $permission))
    {{ $slot }}
@endif