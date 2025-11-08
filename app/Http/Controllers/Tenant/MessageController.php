<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        $userId = Auth::id();
        
        $query = Message::where('instansi_id', $tenant->id)
            ->where(function($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->with(['sender', 'receiver']);
        
        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'unread') {
                $query->where('is_read', false);
            } elseif ($request->status === 'read') {
                $query->where('is_read', true);
            } elseif ($request->status === 'archived') {
                $query->where('is_archived', true);
            }
        }
        
        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        
        // Search by subject or content
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        $messages = $query->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('tenant.messages.index', compact('messages'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $users = User::where('instansi_id', $tenant->id)
            ->where('id', '!=', Auth::id())
            ->get();
        
        return view('tenant.messages.create', compact('users'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:direct,group,broadcast',
            'priority' => 'required|in:low,medium,high,urgent',
            'parent_id' => 'nullable|exists:messages,id',
        ]);
        
        $message = Message::create([
            'instansi_id' => $tenant->id,
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'subject' => $request->subject,
            'content' => $request->content,
            'type' => $request->type,
            'priority' => $request->priority,
            'parent_id' => $request->parent_id,
        ]);
        
        return redirect()->route('tenant.messages.show', $message)
            ->with('success', 'Pesan berhasil dikirim');
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        $message->load(['sender', 'receiver', 'parent', 'replies.sender']);
        
        // Mark as read if current user is receiver
        if ($message->receiver_id === Auth::id() && !$message->is_read) {
            $message->markAsRead();
        }
        
        return view('tenant.messages.show', compact('message'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $users = User::where('instansi_id', $tenant->id)
            ->where('id', '!=', Auth::id())
            ->get();
        
        return view('tenant.messages.edit', compact('message', 'users'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:direct,group,broadcast',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);
        
        $message->update([
            'receiver_id' => $request->receiver_id,
            'subject' => $request->subject,
            'content' => $request->content,
            'type' => $request->type,
            'priority' => $request->priority,
        ]);
        
        return redirect()->route('tenant.messages.show', $message)
            ->with('success', 'Pesan berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        $message->delete();
        
        return redirect()->route('tenant.messages.index')
            ->with('success', 'Pesan berhasil dihapus');
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Message $message)
    {
        $message->markAsRead();
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark message as unread
     */
    public function markAsUnread(Message $message)
    {
        $message->markAsUnread();
        
        return response()->json(['success' => true]);
    }

    /**
     * Archive message
     */
    public function archive(Message $message)
    {
        $message->archive();
        
        return redirect()->route('tenant.messages.index')
            ->with('success', 'Pesan berhasil diarsipkan');
    }

    /**
     * Unarchive message
     */
    public function unarchive(Message $message)
    {
        $message->unarchive();
        
        return redirect()->route('tenant.messages.index')
            ->with('success', 'Pesan berhasil dikembalikan dari arsip');
    }

    /**
     * Reply to message
     */
    public function reply(Request $request, Message $message)
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        
        $request->validate([
            'content' => 'required|string',
        ]);
        
        $reply = Message::create([
            'instansi_id' => $tenant->id,
            'sender_id' => Auth::id(),
            'receiver_id' => $message->sender_id,
            'subject' => 'Re: ' . $message->subject,
            'content' => $request->content,
            'type' => 'direct',
            'priority' => 'medium',
            'parent_id' => $message->id,
        ]);
        
        return redirect()->route('tenant.messages.show', $message)
            ->with('success', 'Balasan berhasil dikirim');
    }

    /**
     * Show inbox
     */
    public function inbox()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        $userId = Auth::id();
        
        $messages = Message::where('instansi_id', $tenant->id)
            ->where('receiver_id', $userId)
            ->where('is_archived', false)
            ->with(['sender'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('tenant.messages.inbox', compact('messages'));
    }

    /**
     * Show sent messages
     */
    public function sent()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        $userId = Auth::id();
        
        $messages = Message::where('instansi_id', $tenant->id)
            ->where('sender_id', $userId)
            ->where('is_archived', false)
            ->with(['receiver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('tenant.messages.sent', compact('messages'));
    }

    /**
     * Show archived messages
     */
    public function archived()
    {
        $tenant = app(\App\Core\Services\TenantService::class)->getCurrentTenant();
        $userId = Auth::id();
        
        $messages = Message::where('instansi_id', $tenant->id)
            ->where(function($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->where('is_archived', true)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return view('tenant.messages.archived', compact('messages'));
    }
}
