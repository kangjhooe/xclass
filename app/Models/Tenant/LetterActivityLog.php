<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class LetterActivityLog extends Model
{
    use HasFactory, HasInstansi;

    protected $fillable = [
        'instansi_id',
        'letter_type',
        'letter_id',
        'action',
        'description',
        'user_id',
        'ip_address',
        'user_agent',
        'old_values',
        'new_values',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    const ACTION_CREATED = 'created';
    const ACTION_UPDATED = 'updated';
    const ACTION_DELETED = 'deleted';
    const ACTION_STATUS_CHANGED = 'status_changed';
    const ACTION_DISPOSITION_ADDED = 'disposition_added';
    const ACTION_FILE_UPLOADED = 'file_uploaded';
    const ACTION_FILE_DOWNLOADED = 'file_downloaded';
    const ACTION_ARCHIVED = 'archived';
    const ACTION_RESTORED = 'restored';

    const LETTER_TYPE_INCOMING = 'incoming';
    const LETTER_TYPE_OUTGOING = 'outgoing';

    /**
     * Get the user who performed the action
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Get the incoming letter
     */
    public function incomingLetter()
    {
        return $this->belongsTo(IncomingLetter::class, 'letter_id')
            ->where('letter_type', self::LETTER_TYPE_INCOMING);
    }

    /**
     * Get the outgoing letter
     */
    public function outgoingLetter()
    {
        return $this->belongsTo(OutgoingLetter::class, 'letter_id')
            ->where('letter_type', self::LETTER_TYPE_OUTGOING);
    }

    /**
     * Get action label
     */
    public function getActionLabelAttribute()
    {
        return match($this->action) {
            self::ACTION_CREATED => 'Dibuat',
            self::ACTION_UPDATED => 'Diperbarui',
            self::ACTION_DELETED => 'Dihapus',
            self::ACTION_STATUS_CHANGED => 'Status Diubah',
            self::ACTION_DISPOSITION_ADDED => 'Disposisi Ditambahkan',
            self::ACTION_FILE_UPLOADED => 'File Diupload',
            self::ACTION_FILE_DOWNLOADED => 'File Didownload',
            self::ACTION_ARCHIVED => 'Diarsipkan',
            self::ACTION_RESTORED => 'Dipulihkan',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get action color for display
     */
    public function getActionColorAttribute()
    {
        return match($this->action) {
            self::ACTION_CREATED => 'success',
            self::ACTION_UPDATED => 'info',
            self::ACTION_DELETED => 'danger',
            self::ACTION_STATUS_CHANGED => 'warning',
            self::ACTION_DISPOSITION_ADDED => 'primary',
            self::ACTION_FILE_UPLOADED => 'secondary',
            self::ACTION_FILE_DOWNLOADED => 'secondary',
            self::ACTION_ARCHIVED => 'dark',
            self::ACTION_RESTORED => 'success',
            default => 'secondary'
        };
    }

    /**
     * Get action options
     */
    public static function getActionOptions()
    {
        return [
            self::ACTION_CREATED => 'Dibuat',
            self::ACTION_UPDATED => 'Diperbarui',
            self::ACTION_DELETED => 'Dihapus',
            self::ACTION_STATUS_CHANGED => 'Status Diubah',
            self::ACTION_DISPOSITION_ADDED => 'Disposisi Ditambahkan',
            self::ACTION_FILE_UPLOADED => 'File Diupload',
            self::ACTION_FILE_DOWNLOADED => 'File Didownload',
            self::ACTION_ARCHIVED => 'Diarsipkan',
            self::ACTION_RESTORED => 'Dipulihkan',
        ];
    }

    /**
     * Get letter type options
     */
    public static function getLetterTypeOptions()
    {
        return [
            self::LETTER_TYPE_INCOMING => 'Surat Masuk',
            self::LETTER_TYPE_OUTGOING => 'Surat Keluar',
        ];
    }

    /**
     * Log activity
     */
    public static function logActivity($letterType, $letterId, $action, $description = null, $oldValues = null, $newValues = null)
    {
        return self::create([
            'instansi_id' => auth()->user()->instansi_id,
            'letter_type' => $letterType,
            'letter_id' => $letterId,
            'action' => $action,
            'description' => $description,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}