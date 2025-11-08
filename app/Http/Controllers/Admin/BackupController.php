<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemBackup;
use App\Helpers\AuditHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Carbon\Carbon;

class BackupController extends Controller
{
    /**
     * Display a listing of backups
     */
    public function index()
    {
        $backups = SystemBackup::orderBy('created_at', 'desc')->paginate(20);
        
        return view('admin.backup.index', compact('backups'));
    }

    /**
     * Create a new backup
     */
    public function create(Request $request)
    {
        $request->validate([
            'description' => 'nullable|string|max:255',
        ]);

        try {
            // Generate backup filename
            $filename = 'backup_' . Carbon::now()->format('Y_m_d_H_i_s') . '.sql';
            
            // Run backup command
            $exitCode = Artisan::call('backup:run', [
                '--filename' => $filename,
                '--only-db' => true,
            ]);

            // Get command output
            $output = Artisan::output();

            // Cek apakah command berhasil (exit code 0 = success)
            if ($exitCode !== 0) {
                throw new \Exception("Command backup gagal dengan exit code: {$exitCode}. Output: " . $output);
            }

            // Pastikan file backup sudah dibuat
            // Command menyimpan ke storage/app/backups, bukan storage/app/private/backups
            $backupFilePath = storage_path('app/backups/' . $filename);
            if (!file_exists($backupFilePath)) {
                throw new \Exception("File backup tidak ditemukan setelah command dijalankan. Path: {$backupFilePath}");
            }

            // Create backup record
            $backup = SystemBackup::create([
                'filename' => $filename,
                'description' => $request->description,
                'size' => filesize($backupFilePath),
                'status' => 'completed',
                'created_by' => auth()->id(),
            ]);

            // Log backup creation
            AuditHelper::logBackupCreated($backup);

            return redirect()->route('admin.backup')
                ->with('success', 'Backup berhasil dibuat');
                
        } catch (\Exception $e) {
            return redirect()->route('admin.backup')
                ->with('error', 'Gagal membuat backup: ' . $e->getMessage());
        }
    }

    /**
     * Download backup file
     */
    public function download(SystemBackup $backup)
    {
        $backupFilePath = storage_path('app/backups/' . $backup->filename);
        
        if (!file_exists($backupFilePath)) {
            return redirect()->route('admin.backup')
                ->with('error', 'File backup tidak ditemukan');
        }

        return response()->download($backupFilePath);
    }

    /**
     * Remove backup file
     */
    public function destroy(SystemBackup $backup)
    {
        // Log backup deletion before deleting
        AuditHelper::logBackupDeleted($backup);

        // Delete file from storage
        $backupFilePath = storage_path('app/backups/' . $backup->filename);
        if (file_exists($backupFilePath)) {
            unlink($backupFilePath);
        }

        // Delete record
        $backup->delete();

        return redirect()->route('admin.backup')
            ->with('success', 'Backup berhasil dihapus');
    }
}
