<?php

namespace App\View\Components;

use Illuminate\View\Component;

/**
 * Confirmation Modal Component
 * 
 * Provides reusable confirmation modal for delete actions
 */
class ConfirmationModal extends Component
{
    public string $id;
    public string $title;
    public string $message;
    public string $confirmText;
    public string $cancelText;
    public string $confirmClass;
    public string $actionUrl;
    public string $method;

    /**
     * Create a new component instance.
     */
    public function __construct(
        string $id = 'confirmationModal',
        string $title = 'Konfirmasi',
        string $message = 'Apakah Anda yakin?',
        string $confirmText = 'Ya, Hapus',
        string $cancelText = 'Batal',
        string $confirmClass = 'btn-danger',
        string $actionUrl = '',
        string $method = 'DELETE'
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->message = $message;
        $this->confirmText = $confirmText;
        $this->cancelText = $cancelText;
        $this->confirmClass = $confirmClass;
        $this->actionUrl = $actionUrl;
        $this->method = $method;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.confirmation-modal');
    }
}