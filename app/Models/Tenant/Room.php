<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasInstansi;

class Room extends Model
{
    use HasFactory, HasInstansi;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'instansi_id',
        'building_id',
        'name',
        'type',
        'floor',
        'capacity',
        'description',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'floor' => 'integer',
    ];

    /**
     * Get the tenant (instansi) for this room
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Core\Tenant::class, 'instansi_id');
    }

    /**
     * Get the building that owns this room
     */
    public function building()
    {
        return $this->belongsTo(Building::class, 'building_id');
    }

    /**
     * Get classrooms that use this room
     */
    public function classRooms()
    {
        return $this->hasMany(ClassRoom::class, 'room_id');
    }

    /**
     * Scope for active rooms
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for rooms by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}

