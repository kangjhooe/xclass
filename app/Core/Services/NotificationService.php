<?php

namespace App\Core\Services;

use App\Models\Core\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected $tenant;

    public function __construct(TenantService $tenantService)
    {
        $this->tenant = $tenantService->getTenant();
    }

    /**
     * Send notification to specific user
     */
    public function sendToUser(User $user, string $type, array $data = []): void
    {
        try {
            $notification = $this->createNotification($type, $data);
            $user->notify($notification);
            
            $this->logNotification('user', $user->id, $type, $data);
        } catch (\Exception $e) {
            Log::error('Failed to send notification to user', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification to multiple users
     */
    public function sendToUsers(array $userIds, string $type, array $data = []): void
    {
        $users = User::whereIn('id', $userIds)->get();
        
        foreach ($users as $user) {
            $this->sendToUser($user, $type, $data);
        }
    }

    /**
     * Send notification to users by role
     */
    public function sendToRole(string $role, string $type, array $data = []): void
    {
        $users = User::where('instansi_id', $this->tenant->id)
            ->where('role', $role)
            ->where('is_active', true)
            ->get();
        
        foreach ($users as $user) {
            $this->sendToUser($user, $type, $data);
        }
    }

    /**
     * Send notification to all tenant users
     */
    public function sendToAll(string $type, array $data = []): void
    {
        $users = User::where('instansi_id', $this->tenant->id)
            ->where('is_active', true)
            ->get();
        
        foreach ($users as $user) {
            $this->sendToUser($user, $type, $data);
        }
    }

    /**
     * Send grade notification
     */
    public function sendGradeNotification(User $student, array $gradeData): void
    {
        $this->sendToUser($student, 'grade_added', [
            'subject' => $gradeData['subject'],
            'score' => $gradeData['score'],
            'grade_letter' => $gradeData['grade_letter'],
            'assignment' => $gradeData['assignment'],
        ]);
    }

    /**
     * Send attendance notification
     */
    public function sendAttendanceNotification(User $student, array $attendanceData): void
    {
        $this->sendToUser($student, 'attendance_updated', [
            'date' => $attendanceData['date'],
            'status' => $attendanceData['status'],
            'subject' => $attendanceData['subject'],
        ]);
    }

    /**
     * Send announcement notification
     */
    public function sendAnnouncementNotification(array $announcementData): void
    {
        $targetAudience = $announcementData['target_audience'] ?? ['all'];
        
        if (in_array('all', $targetAudience)) {
            $this->sendToAll('announcement', $announcementData);
        } else {
            foreach ($targetAudience as $role) {
                $this->sendToRole($role, 'announcement', $announcementData);
            }
        }
    }

    /**
     * Send message notification
     */
    public function sendMessageNotification(User $receiver, array $messageData): void
    {
        $this->sendToUser($receiver, 'new_message', [
            'sender' => $messageData['sender'],
            'subject' => $messageData['subject'],
            'preview' => $messageData['preview'],
        ]);
    }

    /**
     * Create notification instance
     */
    protected function createNotification(string $type, array $data)
    {
        // This would typically create specific notification classes
        // For now, we'll return a generic notification
        
        return new class($type, $data) {
            protected $type;
            protected $data;
            
            public function __construct($type, $data)
            {
                $this->type = $type;
                $this->data = $data;
            }
            
            public function via($notifiable)
            {
                return ['database', 'mail'];
            }
            
            public function toArray($notifiable)
            {
                return [
                    'type' => $this->type,
                    'data' => $this->data,
                    'created_at' => now(),
                ];
            }
        };
    }

    /**
     * Log notification
     */
    protected function logNotification(string $target, int $targetId, string $type, array $data): void
    {
        Log::info('Notification sent', [
            'tenant_id' => $this->tenant->id,
            'target' => $target,
            'target_id' => $targetId,
            'type' => $type,
            'data' => $data,
            'sent_at' => now(),
        ]);
    }

    /**
     * Get notification statistics
     */
    public function getNotificationStats(): array
    {
        return [
            'total_sent' => 0,
            'success_rate' => 0,
            'failed_count' => 0,
            'by_type' => [],
        ];
    }
}
