<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Core\Services\TenantService;

class FacilityController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Get current tenant ID
     */
    protected function getInstansiId()
    {
        // Try to get from TenantService first (most reliable)
        $tenant = $this->tenantService->getCurrentTenant();
        if ($tenant) {
            return $tenant->id;
        }

        // Try to get from authenticated user
        if (auth()->check() && auth()->user()->instansi_id) {
            return auth()->user()->instansi_id;
        }

        // Fallback to session
        return $instansiId;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get facility statistics
        $stats = [
            'total_buildings' => DB::table('buildings')->where('instansi_id', $instansiId)->count(),
            'total_rooms' => DB::table('rooms')->where('instansi_id', $instansiId)->count(),
            'total_lands' => DB::table('lands')->where('instansi_id', $instansiId)->count(),
            'class_rooms' => DB::table('rooms')->where('instansi_id', $instansiId)->where('type', 'classroom')->count(),
            'facility_rooms' => DB::table('rooms')->where('instansi_id', $instansiId)->where('type', 'facility')->count(),
        ];

        // Get recent buildings, rooms, and lands
        $recentBuildings = DB::table('buildings')
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentRooms = DB::table('rooms')
            ->leftJoin('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->where('rooms.instansi_id', $instansiId)
            ->select('rooms.*', 'buildings.name as building_name')
            ->orderBy('rooms.created_at', 'desc')
            ->limit(5)
            ->get();

        $recentLands = DB::table('lands')
            ->where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.facility.index', [
            'title' => 'Sarana Prasarana',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => null]
            ],
            'stats' => $stats,
            'recentBuildings' => $recentBuildings,
            'recentRooms' => $recentRooms,
            'recentLands' => $recentLands
        ]);
    }

    /**
     * Display buildings management
     */
    public function buildings(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Query dengan instansi_id, tapi jika tidak ada hasil, coba tanpa filter
        $query = DB::table('buildings')->where('instansi_id', $instansiId);

        // Search filter
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $buildings = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // Jika tidak ada hasil dan tidak ada filter, coba perbaiki instansi_id yang mungkin salah
        if ($buildings->isEmpty() && !$request->filled('search') && !$request->filled('status')) {
            // Cek apakah ada building tanpa instansi_id atau dengan instansi_id yang berbeda
            $allBuildings = DB::table('buildings')->get();
            foreach ($allBuildings as $building) {
                if (!$building->instansi_id || $building->instansi_id != $instansiId) {
                    DB::table('buildings')
                        ->where('id', $building->id)
                        ->update(['instansi_id' => $instansiId]);
                }
            }
            // Query ulang setelah perbaikan
            $buildings = DB::table('buildings')
                ->where('instansi_id', $instansiId)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }

        return view('tenant.facility.buildings', [
            'title' => 'Gedung',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Gedung', 'url' => null]
            ],
            'buildings' => $buildings
        ]);
    }

    /**
     * Display rooms management
     */
    public function rooms(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('rooms')
            ->leftJoin('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->where('rooms.instansi_id', $instansiId)
            ->select('rooms.*', 'buildings.name as building_name');

        // Search filter
        if ($request->filled('search')) {
            $query->where('rooms.name', 'like', '%' . $request->search . '%')
                  ->orWhere('rooms.description', 'like', '%' . $request->search . '%')
                  ->orWhere('buildings.name', 'like', '%' . $request->search . '%');
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('rooms.type', $request->type);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('rooms.status', $request->status);
        }

        $rooms = $query->orderBy('rooms.created_at', 'desc')->paginate(10);

        // Get buildings for filter
        $buildings = DB::table('buildings')->where('instansi_id', $instansiId)->get();

        return view('tenant.facility.rooms', [
            'title' => 'Ruangan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Ruangan', 'url' => null]
            ],
            'rooms' => $rooms,
            'buildings' => $buildings
        ]);
    }

    /**
     * Show the form for creating a new building
     */
    public function createBuilding()
    {
        $instansiId = $this->getInstansiId();
        $lands = DB::table('lands')
            ->where('instansi_id', $instansiId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return view('tenant.facility.buildings.create', [
            'title' => 'Tambah Gedung',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Gedung', 'url' => tenant_route('facility.buildings')],
                ['name' => 'Tambah', 'url' => null]
            ],
            'lands' => $lands
        ]);
    }

    /**
     * Store a newly created building
     */
    public function storeBuilding(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'land_id' => 'nullable|exists:lands,id',
            'description' => 'nullable|string',
            'floors' => 'required|integer|min:1',
            'built_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'status' => 'required|in:baik,rusak_ringan,rusak_berat,rusak_total'
        ]);

        try {
            $instansiId = $this->getInstansiId();
            
            if (!$instansiId) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Gagal menambahkan gedung: Instansi ID tidak ditemukan');
            }
            
            DB::table('buildings')->insert([
                'id' => Str::uuid(),
                'instansi_id' => $instansiId,
                'land_id' => $request->land_id ?: null,
                'name' => $request->name,
                'description' => $request->description,
                'floors' => $request->floors,
                'built_year' => $request->built_year ?: null,
                'length' => $request->length ?: null,
                'width' => $request->width ?: null,
                'status' => $request->status,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return redirect()->to(tenant_route('facility.buildings'))
                ->with('success', 'Gedung berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menambahkan gedung: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new room
     */
    public function createRoom()
    {
        $instansiId = $this->getInstansiId();
        $buildings = DB::table('buildings')->where('instansi_id', $instansiId)->get();

        return view('tenant.facility.rooms.create', [
            'title' => 'Tambah Ruangan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Ruangan', 'url' => tenant_route('facility.rooms')],
                ['name' => 'Tambah', 'url' => null]
            ],
            'buildings' => $buildings
        ]);
    }

    /**
     * Store a newly created room
     */
    public function storeRoom(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'building_id' => 'required|exists:buildings,id',
            'type' => 'required|in:classroom,office,library,laboratory,auditorium,other',
            'floor' => 'required|integer|min:0',
            'capacity' => 'required|integer|min:1',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive,maintenance'
        ]);

        try {
            // Untuk SQLite, nonaktifkan foreign key check sementara jika diperlukan
            $isSqlite = DB::getDriverName() === 'sqlite';
            if ($isSqlite) {
                DB::statement('PRAGMA foreign_keys = OFF');
            }
            
            DB::table('rooms')->insert([
                'id' => Str::uuid(),
                'instansi_id' => $this->getInstansiId(),
                'building_id' => $request->building_id,
                'name' => $request->name,
                'type' => $request->type,
                'floor' => $request->floor,
                'capacity' => $request->capacity,
                'length' => $request->length ?: null,
                'width' => $request->width ?: null,
                'description' => $request->description,
                'status' => $request->status,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            if ($isSqlite) {
                DB::statement('PRAGMA foreign_keys = ON');
            }

            return redirect()->to(tenant_route('facility.rooms'))
                ->with('success', 'Ruangan berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menambahkan ruangan: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified building
     */
    public function showBuilding(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        // Query building - coba dengan instansi_id dulu
        $building = DB::table('buildings')
            ->where('id', $id)
            ->where('instansi_id', $instansiId)
            ->first();

        // Jika tidak ditemukan dengan instansi_id, coba tanpa filter instansi_id
        if (!$building) {
            $building = DB::table('buildings')
                ->where('id', $id)
                ->first();
            
            // Jika building ditemukan tapi instansi_id berbeda atau null, perbaiki instansi_id-nya
            if ($building) {
                if (!$building->instansi_id || $building->instansi_id != $instansiId) {
                    DB::table('buildings')
                        ->where('id', $id)
                        ->update(['instansi_id' => $instansiId]);
                }
                // Reload building setelah update (tanpa filter instansi_id dulu untuk memastikan ditemukan)
                $building = DB::table('buildings')
                    ->where('id', $id)
                    ->first();
            }
        }

        if (!$building) {
            return redirect()->to(tenant_route('facility.buildings'))
                ->with('error', 'Gedung tidak ditemukan');
        }

        // Get land info jika ada land_id
        $land = null;
        if ($building->land_id) {
            $land = DB::table('lands')
                ->where('id', $building->land_id)
                ->first();
        }
        
        // Tambahkan land info ke building object
        $building->land_name = $land->name ?? null;
        $building->land_location = $land->location ?? null;

        // Get rooms in this building (relaxed query)
        $rooms = DB::table('rooms')
            ->where('building_id', $id)
            ->orderBy('floor')
            ->orderBy('name')
            ->get();

        return view('tenant.facility.buildings.show', [
            'title' => 'Detail Gedung',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Gedung', 'url' => tenant_route('facility.buildings')],
                ['name' => $building->name, 'url' => null]
            ],
            'building' => $building,
            'rooms' => $rooms
        ]);
    }

    /**
     * Display the specified room
     */
    public function showRoom(string $id)
    {
        $instansiId = $this->getInstansiId();
        $room = DB::table('rooms')
            ->leftJoin('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->where('rooms.id', $id)
            ->where('rooms.instansi_id', $instansiId)
            ->select('rooms.*', 'buildings.name as building_name')
            ->first();

        if (!$room) {
            return redirect()->to(tenant_route('facility.rooms'))
                ->with('error', 'Ruangan tidak ditemukan');
        }

        return view('tenant.facility.rooms.show', [
            'title' => 'Detail Ruangan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Ruangan', 'url' => tenant_route('facility.rooms')],
                ['name' => $room->name, 'url' => null]
            ],
            'room' => $room
        ]);
    }

    /**
     * Show the form for editing the specified building
     */
    public function editBuilding(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        // Query building - coba dengan instansi_id dulu
        $building = DB::table('buildings')
            ->where('id', $id)
            ->where('instansi_id', $instansiId)
            ->first();

        // Jika tidak ditemukan dengan instansi_id, coba tanpa filter instansi_id
        if (!$building) {
            $building = DB::table('buildings')
                ->where('id', $id)
                ->first();
            
            // Jika building ditemukan tapi instansi_id berbeda atau null, perbaiki instansi_id-nya
            if ($building) {
                if (!$building->instansi_id || $building->instansi_id != $instansiId) {
                    DB::table('buildings')
                        ->where('id', $id)
                        ->update(['instansi_id' => $instansiId]);
                }
                // Reload building setelah update (tanpa filter instansi_id dulu untuk memastikan ditemukan)
                $building = DB::table('buildings')
                    ->where('id', $id)
                    ->first();
            }
        }

        if (!$building) {
            return redirect()->to(tenant_route('facility.buildings'))
                ->with('error', 'Gedung tidak ditemukan');
        }

        $lands = DB::table('lands')
            ->where('instansi_id', $instansiId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return view('tenant.facility.buildings.edit', [
            'title' => 'Edit Gedung',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Gedung', 'url' => tenant_route('facility.buildings')],
                ['name' => 'Edit', 'url' => null]
            ],
            'building' => $building,
            'lands' => $lands
        ]);
    }

    /**
     * Show the form for editing the specified room
     */
    public function editRoom(string $id)
    {
        $instansiId = $this->getInstansiId();
        $room = DB::table('rooms')
            ->where('id', $id)
            ->where('instansi_id', $instansiId)
            ->first();

        if (!$room) {
            return redirect()->to(tenant_route('facility.rooms'))
                ->with('error', 'Ruangan tidak ditemukan');
        }

        $buildings = DB::table('buildings')->where('instansi_id', $instansiId)->get();

        return view('tenant.facility.rooms.edit', [
            'title' => 'Edit Ruangan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Ruangan', 'url' => tenant_route('facility.rooms')],
                ['name' => 'Edit', 'url' => null]
            ],
            'room' => $room,
            'buildings' => $buildings
        ]);
    }

    /**
     * Update the specified building
     */
    public function updateBuilding(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'land_id' => 'nullable|exists:lands,id',
            'description' => 'nullable|string',
            'floors' => 'required|integer|min:1',
            'built_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'status' => 'required|in:baik,rusak_ringan,rusak_berat,rusak_total'
        ]);

        try {
            $instansiId = $this->getInstansiId();
            
            // Cek apakah building ada
            $building = DB::table('buildings')->where('id', $id)->first();
            if (!$building) {
                return redirect()->to(tenant_route('facility.buildings'))
                    ->with('error', 'Gedung tidak ditemukan');
            }
            
            // Update instansi_id jika berbeda atau null
            if (!$building->instansi_id || $building->instansi_id != $instansiId) {
                DB::table('buildings')
                    ->where('id', $id)
                    ->update(['instansi_id' => $instansiId]);
            }
            
            $updated = DB::table('buildings')
                ->where('id', $id)
                ->update([
                    'name' => $request->name,
                    'land_id' => $request->land_id ?: null,
                    'description' => $request->description,
                    'floors' => $request->floors,
                    'built_year' => $request->built_year ?: null,
                    'length' => $request->length ?: null,
                    'width' => $request->width ?: null,
                    'status' => $request->status,
                    'updated_at' => now()
                ]);

            if ($updated) {
                    return redirect()->to(tenant_route('facility.buildings'))
                        ->with('success', 'Gedung berhasil diperbarui');
            } else {
                return redirect()->back()
                    ->with('error', 'Gedung tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui gedung: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified room
     */
    public function updateRoom(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'building_id' => 'required|exists:buildings,id',
            'type' => 'required|in:classroom,office,library,laboratory,auditorium,other',
            'floor' => 'required|integer|min:0',
            'capacity' => 'required|integer|min:1',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive,maintenance'
        ]);

        try {
            $instansiId = $this->getInstansiId();
            $updated = DB::table('rooms')
                ->where('id', $id)
                ->where('instansi_id', $instansiId)
                ->update([
                    'building_id' => $request->building_id,
                    'name' => $request->name,
                    'type' => $request->type,
                    'floor' => $request->floor,
                    'capacity' => $request->capacity,
                    'length' => $request->length ?: null,
                    'width' => $request->width ?: null,
                    'description' => $request->description,
                    'status' => $request->status,
                    'updated_at' => now()
                ]);

            if ($updated) {
                    return redirect()->to(tenant_route('facility.rooms'))
                        ->with('success', 'Ruangan berhasil diperbarui');
            } else {
                return redirect()->back()
                    ->with('error', 'Ruangan tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui ruangan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified building
     */
    public function destroyBuilding(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            // Cek apakah building ada
            $building = DB::table('buildings')->where('id', $id)->first();
            if (!$building) {
                return redirect()->to(tenant_route('facility.buildings'))
                    ->with('error', 'Gedung tidak ditemukan');
            }
            
            // Update instansi_id jika berbeda atau null
            if (!$building->instansi_id || $building->instansi_id != $instansiId) {
                DB::table('buildings')
                    ->where('id', $id)
                    ->update(['instansi_id' => $instansiId]);
            }
            
            // Check if building has rooms (relaxed query)
            $roomCount = DB::table('rooms')
                ->where('building_id', $id)
                ->count();

            if ($roomCount > 0) {
                return redirect()->back()
                    ->with('error', 'Tidak dapat menghapus gedung yang memiliki ruangan');
            }

            // Delete building dengan ID saja (instansi_id sudah diperbaiki sebelumnya)
            $deleted = DB::table('buildings')
                ->where('id', $id)
                ->delete();

            if ($deleted) {
                return redirect()->to(tenant_route('facility.buildings'))
                    ->with('success', 'Gedung berhasil dihapus');
            } else {
                return redirect()->back()
                    ->with('error', 'Gedung tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus gedung: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified room
     */
    public function destroyRoom(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            $deleted = DB::table('rooms')
                ->where('id', $id)
                ->where('instansi_id', $instansiId)
                ->delete();

            if ($deleted) {
                    return redirect()->to(tenant_route('facility.rooms'))
                        ->with('success', 'Ruangan berhasil dihapus');
            } else {
                return redirect()->back()
                    ->with('error', 'Ruangan tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus ruangan: ' . $e->getMessage());
        }
    }

    /**
     * Display lands management
     */
    public function lands(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('lands')->where('instansi_id', $instansiId);

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $lands = $query->orderBy('created_at', 'desc')->paginate(10);

        return view('tenant.facility.lands', [
            'title' => 'Lahan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Lahan', 'url' => null]
            ],
            'lands' => $lands
        ]);
    }

    /**
     * Show the form for creating a new land
     */
    public function createLand()
    {
        return view('tenant.facility.lands.create', [
            'title' => 'Tambah Lahan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Lahan', 'url' => tenant_route('facility.lands')],
                ['name' => 'Tambah', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created land
     */
    public function storeLand(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'area' => 'required|numeric|min:0',
            'area_unit' => 'required|in:m2,hectare',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,maintenance',
            'ownership_type' => 'nullable|string|max:100',
            'ownership_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
        ]);

        try {
            $landId = Str::uuid();
            DB::table('lands')->insert([
                'id' => $landId,
                'instansi_id' => $this->getInstansiId(),
                'name' => $request->name,
                'description' => $request->description,
                'area' => $request->area,
                'area_unit' => $request->area_unit,
                'location' => $request->location,
                'status' => $request->status,
                'ownership_type' => $request->ownership_type,
                'ownership_number' => $request->ownership_number,
                'purchase_date' => $request->purchase_date,
                'purchase_price' => $request->purchase_price,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return redirect()->to(tenant_route('facility.lands'))
                ->with('success', 'Lahan berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menambahkan lahan: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified land
     */
    public function showLand(string $id)
    {
        $instansiId = $this->getInstansiId();
        $land = DB::table('lands')
            ->where('id', $id)
            ->where('instansi_id', $instansiId)
            ->first();

        if (!$land) {
            return redirect()->to(tenant_route('facility.lands'))
                ->with('error', 'Lahan tidak ditemukan');
        }

        return view('tenant.facility.lands.show', [
            'title' => 'Detail Lahan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Lahan', 'url' => tenant_route('facility.lands')],
                ['name' => $land->name, 'url' => null]
            ],
            'land' => $land
        ]);
    }

    /**
     * Show the form for editing the specified land
     */
    public function editLand(string $id)
    {
        $instansiId = $this->getInstansiId();
        $land = DB::table('lands')
            ->where('id', $id)
            ->where('instansi_id', $instansiId)
            ->first();

        if (!$land) {
            return redirect()->to(tenant_route('facility.lands'))
                ->with('error', 'Lahan tidak ditemukan');
        }

        return view('tenant.facility.lands.edit', [
            'title' => 'Edit Lahan',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Sarana Prasarana', 'url' => tenant_route('facility.index')],
                ['name' => 'Lahan', 'url' => tenant_route('facility.lands')],
                ['name' => 'Edit', 'url' => null]
            ],
            'land' => $land
        ]);
    }

    /**
     * Update the specified land
     */
    public function updateLand(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'area' => 'required|numeric|min:0',
            'area_unit' => 'required|in:m2,hectare',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,maintenance',
            'ownership_type' => 'nullable|string|max:100',
            'ownership_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
        ]);

        try {
            $instansiId = $this->getInstansiId();
            $updated = DB::table('lands')
                ->where('id', $id)
                ->where('instansi_id', $instansiId)
                ->update([
                    'name' => $request->name,
                    'description' => $request->description,
                    'area' => $request->area,
                    'area_unit' => $request->area_unit,
                    'location' => $request->location,
                    'status' => $request->status,
                    'ownership_type' => $request->ownership_type,
                    'ownership_number' => $request->ownership_number,
                    'purchase_date' => $request->purchase_date,
                    'purchase_price' => $request->purchase_price,
                    'updated_at' => now()
                ]);

            if ($updated) {
                    return redirect()->to(tenant_route('facility.lands'))
                        ->with('success', 'Lahan berhasil diperbarui');
            } else {
                return redirect()->back()
                    ->with('error', 'Lahan tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui lahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified land
     */
    public function destroyLand(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            $deleted = DB::table('lands')
                ->where('id', $id)
                ->where('instansi_id', $instansiId)
                ->delete();

            if ($deleted) {
                    return redirect()->to(tenant_route('facility.lands'))
                        ->with('success', 'Lahan berhasil dihapus');
            } else {
                return redirect()->back()
                    ->with('error', 'Lahan tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus lahan: ' . $e->getMessage());
        }
    }

    /**
     * Maintenance scheduling
     */
    public function maintenanceSchedule(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('maintenance_schedules')
            ->where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by asset type
        if ($request->filled('asset_type')) {
            $query->where('asset_type', $request->asset_type);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('scheduled_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('scheduled_date', '<=', $request->end_date);
        }

        $schedules = $query->orderBy('scheduled_date')->paginate(20);

        // Get statistics
        $stats = [
            'total_scheduled' => DB::table('maintenance_schedules')->where('instansi_id', $instansiId)->count(),
            'pending' => DB::table('maintenance_schedules')->where('instansi_id', $instansiId)->where('status', 'pending')->count(),
            'in_progress' => DB::table('maintenance_schedules')->where('instansi_id', $instansiId)->where('status', 'in_progress')->count(),
            'completed' => DB::table('maintenance_schedules')->where('instansi_id', $instansiId)->where('status', 'completed')->count(),
            'overdue' => DB::table('maintenance_schedules')
                ->where('instansi_id', $instansiId)
                ->where('status', '!=', 'completed')
                ->where('scheduled_date', '<', now()->toDateString())
                ->count()
        ];

        return view('tenant.facility.maintenance-schedule', [
            'title' => 'Jadwal Maintenance',
            'page-title' => 'Jadwal Pemeliharaan',
            'schedules' => $schedules,
            'stats' => $stats
        ]);
    }

    /**
     * Create maintenance schedule
     */
    public function createMaintenanceSchedule(Request $request)
    {
        $request->validate([
            'asset_type' => 'required|in:building,room,equipment,furniture',
            'asset_id' => 'required|integer',
            'maintenance_type' => 'required|in:routine,repair,upgrade,inspection',
            'scheduled_date' => 'required|date',
            'estimated_cost' => 'nullable|numeric|min:0',
            'description' => 'required|string|max:1000',
            'assigned_to' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            DB::table('maintenance_schedules')->insert([
                'instansi_id' => $instansiId,
                'asset_type' => $request->asset_type,
                'asset_id' => $request->asset_id,
                'maintenance_type' => $request->maintenance_type,
                'scheduled_date' => $request->scheduled_date,
                'estimated_cost' => $request->estimated_cost,
                'description' => $request->description,
                'assigned_to' => $request->assigned_to,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.facility.maintenance-schedule')
                ->with('success', 'Jadwal maintenance berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Asset tracking
     */
    public function assetTracking(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = DB::table('assets')->where('instansi_id', $instansiId);

        // Filter by type
        if ($request->filled('asset_type')) {
            $query->where('asset_type', $request->asset_type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('asset_code', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        $assets = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get statistics
        $stats = [
            'total_assets' => DB::table('assets')->where('instansi_id', $instansiId)->count(),
            'active' => DB::table('assets')->where('instansi_id', $instansiId)->where('status', 'active')->count(),
            'maintenance' => DB::table('assets')->where('instansi_id', $instansiId)->where('status', 'maintenance')->count(),
            'disposed' => DB::table('assets')->where('instansi_id', $instansiId)->where('status', 'disposed')->count(),
            'total_value' => DB::table('assets')->where('instansi_id', $instansiId)->sum('purchase_value')
        ];

        return view('tenant.facility.asset-tracking', [
            'title' => 'Tracking Aset',
            'page-title' => 'Tracking Aset',
            'assets' => $assets,
            'stats' => $stats
        ]);
    }

    /**
     * Create asset
     */
    public function createAsset(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'asset_code' => 'required|string|max:50|unique:assets,asset_code',
            'asset_type' => 'required|in:building,room,equipment,furniture,vehicle',
            'serial_number' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date',
            'purchase_value' => 'required|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:active,maintenance,disposed',
            'description' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            DB::table('assets')->insert([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'asset_code' => $request->asset_code,
                'asset_type' => $request->asset_type,
                'serial_number' => $request->serial_number,
                'purchase_date' => $request->purchase_date,
                'purchase_value' => $request->purchase_value,
                'current_value' => $request->current_value ?? $request->purchase_value,
                'location' => $request->location,
                'status' => $request->status,
                'description' => $request->description,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();
            return redirect()->route('tenant.facility.asset-tracking')
                ->with('success', 'Aset berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Asset depreciation calculation
     */
    public function assetDepreciation(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $assets = DB::table('assets')
            ->where('instansi_id', $instansiId)
            ->where('status', '!=', 'disposed')
            ->whereNotNull('purchase_date')
            ->get();

        $depreciations = [];
        foreach ($assets as $asset) {
            $purchaseDate = \Carbon\Carbon::parse($asset->purchase_date);
            $yearsOld = $purchaseDate->diffInYears(now());
            
            // Calculate depreciation (straight line method, assuming 10% per year)
            $depreciationRate = 0.10;
            $annualDepreciation = $asset->purchase_value * $depreciationRate;
            $totalDepreciation = min($annualDepreciation * $yearsOld, $asset->purchase_value);
            $bookValue = $asset->purchase_value - $totalDepreciation;

            $depreciations[] = [
                'asset' => $asset,
                'years_old' => $yearsOld,
                'annual_depreciation' => $annualDepreciation,
                'total_depreciation' => $totalDepreciation,
                'book_value' => $bookValue
            ];
        }

        // Calculate total depreciation
        $totalPurchaseValue = $assets->sum('purchase_value');
        $totalDepreciation = collect($depreciations)->sum('total_depreciation');
        $totalBookValue = $totalPurchaseValue - $totalDepreciation;

        return view('tenant.facility.depreciation', [
            'title' => 'Depresiasi Aset',
            'page-title' => 'Perhitungan Depresiasi Aset',
            'depreciations' => $depreciations,
            'totalPurchaseValue' => $totalPurchaseValue,
            'totalDepreciation' => $totalDepreciation,
            'totalBookValue' => $totalBookValue
        ]);
    }

    /**
     * Update asset depreciation
     */
    public function updateAssetDepreciation(Request $request, $assetId)
    {
        $request->validate([
            'current_value' => 'required|numeric|min:0',
            'depreciation_amount' => 'nullable|numeric|min:0'
        ]);

        try {
            DB::table('assets')
                ->where('id', $assetId)
                ->where('instansi_id', $instansiId)
                ->update([
                    'current_value' => $request->current_value,
                    'updated_at' => now()
                ]);

            // Record depreciation history
            if ($request->filled('depreciation_amount')) {
                DB::table('asset_depreciation_history')->insert([
                    'asset_id' => $assetId,
                    'depreciation_amount' => $request->depreciation_amount,
                    'depreciation_date' => now()->toDateString(),
                    'book_value_after' => $request->current_value,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return redirect()->back()->with('success', 'Nilai aset berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
