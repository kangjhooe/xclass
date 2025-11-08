<?php

namespace App\View\Components;

use Illuminate\View\Component;

/**
 * Toast Notification Component
 * 
 * Provides toast notification functionality
 */
class ToastNotification extends Component
{
    public string $id;
    public string $type;
    public string $title;
    public string $message;
    public bool $autohide;
    public int $delay;

    /**
     * Create a new component instance.
     */
    public function __construct(
        string $id = 'toastContainer',
        string $type = 'info',
        string $title = '',
        string $message = '',
        bool $autohide = true,
        int $delay = 5000
    ) {
        $this->id = $id;
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->autohide = $autohide;
        $this->delay = $delay;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.toast-notification');
    }

    /**
     * Get toast types
     */
    public static function getTypes(): array
    {
        return [
            'success' => 'success',
            'error' => 'danger',
            'warning' => 'warning',
            'info' => 'info',
        ];
    }

    /**
     * Get toast icons
     */
    public static function getIcons(): array
    {
        return [
            'success' => 'fas fa-check-circle',
            'error' => 'fas fa-exclamation-circle',
            'warning' => 'fas fa-exclamation-triangle',
            'info' => 'fas fa-info-circle',
        ];
    }
}