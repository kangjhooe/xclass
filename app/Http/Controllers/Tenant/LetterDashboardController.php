<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\IncomingLetter;
use App\Models\Tenant\OutgoingLetter;
use App\Models\Tenant\LetterTemplate;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LetterDashboardController extends Controller
{
    /**
     * Display the letter dashboard
     */
    public function index()
    {
        $instansiId = auth()->user()->instansi_id;

        // Get statistics
        $stats = [
            'total_incoming' => IncomingLetter::where('instansi_id', $instansiId)->count(),
            'total_outgoing' => OutgoingLetter::where('instansi_id', $instansiId)->count(),
            'this_month_incoming' => IncomingLetter::where('instansi_id', $instansiId)
                ->whereMonth('tanggal_terima', now()->month)
                ->whereYear('tanggal_terima', now()->year)
                ->count(),
            'this_month_outgoing' => OutgoingLetter::where('instansi_id', $instansiId)
                ->whereMonth('tanggal_surat', now()->month)
                ->whereYear('tanggal_surat', now()->year)
                ->count(),
            'pending_incoming' => IncomingLetter::where('instansi_id', $instansiId)
                ->whereIn('status', ['baru', 'diproses'])
                ->count(),
            'pending_outgoing' => OutgoingLetter::where('instansi_id', $instansiId)
                ->where('status', 'draft')
                ->count(),
        ];

        // Get templates count
        $templatesCount = LetterTemplate::where('instansi_id', $instansiId)->count();

        // Get recent letters
        $recent_incoming = IncomingLetter::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recent_outgoing = OutgoingLetter::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.letters.dashboard', compact('stats', 'recent_incoming', 'recent_outgoing', 'templatesCount'));
    }

    /**
     * API endpoint for new letters notification
     */
    public function apiNewLetters()
    {
        $instansiId = auth()->user()->instansi_id;
        
        // Get new letters from last 5 minutes
        $newIncoming = IncomingLetter::where('instansi_id', $instansiId)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();
            
        $newOutgoing = OutgoingLetter::where('instansi_id', $instansiId)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();

        return response()->json([
            'newIncoming' => $newIncoming,
            'newOutgoing' => $newOutgoing
        ]);
    }
}
