<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\Parent as ParentModel;
use App\Models\Tenant\Student;
use App\Models\Tenant\ParentNotification;
use App\Models\Tenant\ParentMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParentPortalController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        $stats = [
            'total_parents' => ParentModel::where('instansi_id', $instansiId)->count(),
            'active_parents' => ParentModel::where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'total_notifications' => ParentNotification::where('instansi_id', $instansiId)->count(),
            'unread_notifications' => ParentNotification::where('instansi_id', $instansiId)->where('is_read', false)->count(),
        ];

        $recentNotifications = ParentNotification::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.parent-portal.index', [
            'title' => 'Portal Orang Tua',
            'page-title' => 'Sistem Portal Orang Tua',
            'stats' => $stats,
            'recentNotifications' => $recentNotifications
        ]);
    }

    /**
     * Display notifications
     */
    public function notifications()
    {
        $instansiId = $this->getInstansiId();
        
        $notifications = ParentNotification::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.parent-portal.notifications', [
            'title' => 'Notifikasi',
            'page-title' => 'Notifikasi Orang Tua',
            'notifications' => $notifications
        ]);
    }

    /**
     * Display messages
     */
    public function messages()
    {
        $instansiId = $this->getInstansiId();
        
        $messages = ParentMessage::with(['parent', 'student'])
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tenant.parent-portal.messages', [
            'title' => 'Pesan',
            'page-title' => 'Pesan Orang Tua',
            'messages' => $messages
        ]);
    }

    /**
     * Show the form for creating a new parent.
     */
    public function createParent()
    {
        $instansiId = $this->getInstansiId();
        
        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.parent-portal.create-parent', [
            'title' => 'Tambah Orang Tua',
            'page-title' => 'Tambah Data Orang Tua',
            'students' => $students
        ]);
    }

    /**
     * Store a newly created parent in storage.
     */
    public function storeParent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:parents,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'student_id' => 'required|exists:students,id',
            'relationship' => 'required|in:father,mother,guardian',
            'occupation' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            DB::beginTransaction();

            ParentModel::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'student_id' => $request->student_id,
                'relationship' => $request->relationship,
                'occupation' => $request->occupation,
                'status' => $request->status,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->route('tenant.parent-portal.index')->with('success', 'Orang tua berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified parent.
     */
    public function editParent(string $id)
    {
        $parent = ParentModel::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $students = Student::where('instansi_id', $instansiId)
            ->orderBy('name')
            ->get();

        return view('tenant.parent-portal.edit-parent', [
            'title' => 'Edit Orang Tua',
            'page-title' => 'Edit Data Orang Tua',
            'parent' => $parent,
            'students' => $students
        ]);
    }

    /**
     * Update the specified parent in storage.
     */
    public function updateParent(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:parents,email,' . $id,
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'student_id' => 'required|exists:students,id',
            'relationship' => 'required|in:father,mother,guardian',
            'occupation' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            DB::beginTransaction();

            $parent = ParentModel::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $parent->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'student_id' => $request->student_id,
                'relationship' => $request->relationship,
                'occupation' => $request->occupation,
                'status' => $request->status
            ]);

            DB::commit();
            return redirect()->route('tenant.parent-portal.index')->with('success', 'Orang tua berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Send notification to parent
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'parent_id' => 'required|exists:parents,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:info,warning,success,error'
        ]);

        try {
            DB::beginTransaction();

            ParentNotification::create([
                'parent_id' => $request->parent_id,
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'is_read' => false,
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Notifikasi berhasil dikirim');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Send message to parent
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'parent_id' => 'required|exists:parents,id',
            'student_id' => 'required|exists:students,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            ParentMessage::create([
                'parent_id' => $request->parent_id,
                'student_id' => $request->student_id,
                'subject' => $request->subject,
                'message' => $request->message,
                'status' => 'sent',
                'instansi_id' => $instansiId
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Pesan berhasil dikirim');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(string $id)
    {
        try {
            $notification = ParentNotification::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $notification->update(['is_read' => true]);

            return redirect()->back()->with('success', 'Notifikasi ditandai sebagai sudah dibaca');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Send real-time notification
     */
    public function sendRealTimeNotification(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:info,warning,urgent',
            'send_email' => 'boolean',
            'send_sms' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            $students = Student::whereIn('id', $request->student_ids)
                ->where('instansi_id', $instansiId)
                ->get();

            $notificationsSent = 0;
            foreach ($students as $student) {
                // Get parents
                $parents = ParentModel::where('student_id', $student->id)
                    ->where('instansi_id', $instansiId)
                    ->get();

                foreach ($parents as $parent) {
                    // Create notification
                    ParentNotification::create([
                        'instansi_id' => $instansiId,
                        'parent_id' => $parent->id,
                        'student_id' => $student->id,
                        'title' => $request->title,
                        'message' => $request->message,
                        'type' => $request->type,
                        'is_read' => false
                    ]);

                    // Send email if requested
                    if ($request->send_email && $parent->email) {
                        // Mail::to($parent->email)->send(new ParentNotificationEmail(...));
                    }

                    // Send SMS if requested
                    if ($request->send_sms && $parent->phone) {
                        // Implement SMS sending
                    }

                    $notificationsSent++;
                }
            }

            DB::commit();
            return redirect()->back()->with('success', "{$notificationsSent} notifikasi berhasil dikirim");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Chat/Messaging system
     */
    public function chat(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = ParentMessage::where('instansi_id', $instansiId)
            ->with(['parent', 'student']);

        // Filter by parent
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Filter by student
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $messages = $query->orderBy('created_at', 'desc')->paginate(20);

        $parents = ParentModel::where('instansi_id', $instansiId)->get();
        $students = Student::where('instansi_id', $instansiId)->get();

        return view('tenant.parent-portal.chat', [
            'title' => 'Chat / Messaging',
            'page-title' => 'Sistem Chat / Messaging',
            'messages' => $messages,
            'parents' => $parents,
            'students' => $students
        ]);
    }

    /**
     * Send chat message
     */
    public function sendChatMessage(Request $request)
    {
        $request->validate([
            'parent_id' => 'required|exists:parents,id',
            'student_id' => 'required|exists:students,id',
            'message' => 'required|string|max:2000',
            'type' => 'required|in:question,complaint,suggestion,other'
        ]);

        try {
            ParentMessage::create([
                'instansi_id' => $instansiId,
                'parent_id' => $request->parent_id,
                'student_id' => $request->student_id,
                'message' => $request->message,
                'type' => $request->type,
                'status' => 'pending',
                'is_read' => false
            ]);

            return redirect()->back()->with('success', 'Pesan berhasil dikirim');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Reply to message
     */
    public function replyMessage(Request $request, $messageId)
    {
        $request->validate([
            'reply' => 'required|string|max:2000'
        ]);

        try {
            $message = ParentMessage::where('instansi_id', $instansiId)
                ->findOrFail($messageId);

            $message->update([
                'reply' => $request->reply,
                'status' => 'replied',
                'replied_at' => now()
            ]);

            return redirect()->back()->with('success', 'Balasan berhasil dikirim');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
