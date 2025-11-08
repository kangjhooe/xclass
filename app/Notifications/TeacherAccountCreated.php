<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherAccountCreated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $teacher;
    protected $password;
    protected $tenant;

    /**
     * Create a new notification instance.
     */
    public function __construct($teacher, $password, $tenant)
    {
        $this->teacher = $teacher;
        $this->password = $password;
        $this->tenant = $tenant;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = url($this->tenant->npsn . '/login');
        
        return (new MailMessage)
            ->subject('Akun Login Sistem ' . $this->tenant->name)
            ->greeting('Halo ' . $this->teacher->name . '!')
            ->line('Akun Anda telah dibuat di sistem ' . $this->tenant->name . '.')
            ->line('Berikut adalah kredensial login Anda:')
            ->line('**Email:** ' . $this->teacher->email)
            ->line('**Password:** ' . $this->password)
            ->line('**PENTING:** Harap segera ganti password setelah login pertama kali!')
            ->action('Login ke Sistem', $loginUrl)
            ->line('Silakan lengkapi data pribadi Anda setelah login.')
            ->line('Terima kasih telah bergabung dengan ' . $this->tenant->name . '!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'teacher_id' => $this->teacher->id,
            'teacher_name' => $this->teacher->name,
            'email' => $this->teacher->email,
            'tenant_id' => $this->tenant->id,
        ];
    }
}
