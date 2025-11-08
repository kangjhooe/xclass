<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $instansiId = Auth::user()->instansi_id;
        
        $query = Notification::where('instansi_id', $instansiId)
            ->where('user_id', Auth::id());
        
        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by read status
        if ($request->filled('read_status')) {
            if ($request->read_status === 'unread') {
                $query->unread();
            } elseif ($request->read_status === 'read') {
                $query->read();
            }
        }
        
        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);
        $types = Notification::getTypes();
        
        return view('tenant.notifications.index', compact('notifications', 'types'));
    }

    /**
     * Get unread notifications count for AJAX
     */
    public function unreadCount()
    {
        $instansiId = Auth::user()->instansi_id;
        $count = Notification::where('instansi_id', $instansiId)
            ->where('user_id', Auth::id())
            ->unread()
            ->count();
        
        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications for AJAX
     */
    public function recent()
    {
        $instansiId = Auth::user()->instansi_id;
        $notifications = Notification::where('instansi_id', $instansiId)
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        return response()->json($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification)
    {
        // Check if notification belongs to current user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $instansiId = Auth::user()->instansi_id;
        
        Notification::where('instansi_id', $instansiId)
            ->where('user_id', Auth::id())
            ->unread()
            ->update(['read_at' => now()]);
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(Notification $notification)
    {
        // Check if notification belongs to current user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->markAsUnread();
        
        return response()->json(['success' => true]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification)
    {
        // Check if notification belongs to current user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->delete();
        
        return response()->json(['success' => true]);
    }

    /**
     * Clear all notifications
     */
    public function clearAll()
    {
        $instansiId = Auth::user()->instansi_id;
        
        Notification::where('instansi_id', $instansiId)
            ->where('user_id', Auth::id())
            ->delete();
        
        return response()->json(['success' => true]);
    }

    /**
     * Clear read notifications
     */
    public function clearRead()
    {
        $instansiId = Auth::user()->instansi_id;
        
        Notification::where('instansi_id', $instansiId)
            ->where('user_id', Auth::id())
            ->read()
            ->delete();
        
        return response()->json(['success' => true]);
    }
}
