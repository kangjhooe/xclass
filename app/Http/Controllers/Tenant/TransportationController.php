<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Tenant\Traits\HasInstansiId;
use App\Models\Tenant\TransportationRoute;
use App\Models\Tenant\TransportationSchedule;
use App\Models\Tenant\Transportation;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransportationController extends Controller
{
    use HasInstansiId;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get transportation statistics
        $stats = [
            'total_routes' => TransportationRoute::where('instansi_id', $instansiId)->count(),
            'active_routes' => TransportationRoute::where('instansi_id', $instansiId)
                ->where('status', 'active')
                ->count(),
            'total_schedules' => TransportationSchedule::where('instansi_id', $instansiId)->count(),
            'today_schedules' => TransportationSchedule::where('instansi_id', $instansiId)
                ->whereDate('departure_time', today())
                ->count()
        ];

        // Get recent routes
        $recentRoutes = TransportationRoute::where('instansi_id', $instansiId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent schedules
        $recentSchedules = TransportationSchedule::where('instansi_id', $instansiId)
            ->with(['route'])
            ->orderBy('departure_time', 'desc')
            ->limit(5)
            ->get();

        return view('tenant.transportation.index', [
            'title' => 'Transportasi',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => null]
            ],
            'stats' => $stats,
            'recentRoutes' => $recentRoutes,
            'recentSchedules' => $recentSchedules
        ]);
    }

    /**
     * Display routes management
     */
    public function routes(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = TransportationRoute::where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('start_location', 'like', "%{$search}%")
                  ->orWhere('end_location', 'like', "%{$search}%");
            });
        }

        $routes = $query->orderBy('name')->paginate(20);

        return view('tenant.transportation.routes', [
            'title' => 'Rute',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Rute', 'url' => null]
            ],
            'routes' => $routes
        ]);
    }

    /**
     * Display schedules management
     */
    public function schedules(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = TransportationSchedule::where('instansi_id', $instansiId)
            ->with(['route']);

        // Filter by route
        if ($request->filled('route_id')) {
            $query->where('route_id', $request->route_id);
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('departure_time', $request->date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('route', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $schedules = $query->orderBy('departure_time')->paginate(20);
        
        $routes = TransportationRoute::where('instansi_id', $instansiId)
            ->where('status', 'active')
            ->get();

        return view('tenant.transportation.schedules', [
            'title' => 'Jadwal',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Jadwal', 'url' => null]
            ],
            'schedules' => $schedules,
            'routes' => $routes
        ]);
    }

    /**
     * Show the form for creating a new route.
     */
    public function createRoute()
    {
        return view('tenant.transportation.routes.create', [
            'title' => 'Tambah Rute',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Rute', 'url' => route('tenant.transportation.routes')],
                ['name' => 'Tambah Rute', 'url' => null]
            ]
        ]);
    }

    /**
     * Store a newly created route in storage.
     */
    public function storeRoute(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'start_location' => 'required|string|max:255',
            'end_location' => 'required|string|max:255',
            'distance' => 'nullable|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            TransportationRoute::create([
                'instansi_id' => $instansiId,
                'name' => $request->name,
                'start_location' => $request->start_location,
                'end_location' => $request->end_location,
                'distance' => $request->distance,
                'estimated_duration' => $request->estimated_duration,
                'description' => $request->description,
                'status' => $request->status
            ]);

            DB::commit();

            return redirect()->route('tenant.transportation.routes')
                ->with('success', 'Rute berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified route.
     */
    public function editRoute(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $route = TransportationRoute::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.transportation.routes.edit', [
            'title' => 'Edit Rute',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Rute', 'url' => route('tenant.transportation.routes')],
                ['name' => 'Edit Rute', 'url' => null]
            ],
            'route' => $route
        ]);
    }

    /**
     * Update the specified route in storage.
     */
    public function updateRoute(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'start_location' => 'required|string|max:255',
            'end_location' => 'required|string|max:255',
            'distance' => 'nullable|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $route = TransportationRoute::where('instansi_id', $instansiId)->findOrFail($id);
            
            $route->update([
                'name' => $request->name,
                'start_location' => $request->start_location,
                'end_location' => $request->end_location,
                'distance' => $request->distance,
                'estimated_duration' => $request->estimated_duration,
                'description' => $request->description,
                'status' => $request->status
            ]);

            DB::commit();

            return redirect()->route('tenant.transportation.routes')
                ->with('success', 'Rute berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified route.
     */
    public function showRoute(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $route = TransportationRoute::where('instansi_id', $instansiId)->findOrFail($id);

        return view('tenant.transportation.routes.show', [
            'title' => 'Detail Rute',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Rute', 'url' => route('tenant.transportation.routes')],
                ['name' => 'Detail Rute', 'url' => null]
            ],
            'route' => $route
        ]);
    }

    /**
     * Remove the specified route from storage.
     */
    public function destroyRoute(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $route = TransportationRoute::where('instansi_id', $instansiId)->findOrFail($id);
            $route->delete();

            return redirect()->route('tenant.transportation.routes')
                ->with('success', 'Rute berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new schedule.
     */
    public function createSchedule()
    {
        $instansiId = $this->getInstansiId();
        
        $routes = TransportationRoute::where('instansi_id', $instansiId)
            ->where('status', 'active')
            ->get();

        return view('tenant.transportation.schedules.create', [
            'title' => 'Tambah Jadwal',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Jadwal', 'url' => route('tenant.transportation.schedules')],
                ['name' => 'Tambah Jadwal', 'url' => null]
            ],
            'routes' => $routes
        ]);
    }

    /**
     * Store a newly created schedule in storage.
     */
    public function storeSchedule(Request $request)
    {
        $request->validate([
            'route_id' => 'required|exists:transportation_routes,id',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date|after:departure_time',
            'driver_name' => 'nullable|string|max:255',
            'driver_phone' => 'nullable|string|max:20',
            'vehicle_number' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            TransportationSchedule::create([
                'instansi_id' => $instansiId,
                'route_id' => $request->route_id,
                'departure_time' => $request->departure_time,
                'arrival_time' => $request->arrival_time,
                'driver_name' => $request->driver_name,
                'driver_phone' => $request->driver_phone,
                'vehicle_number' => $request->vehicle_number,
                'capacity' => $request->capacity,
                'price' => $request->price,
                'notes' => $request->notes,
                'status' => 'scheduled'
            ]);

            DB::commit();

            return redirect()->route('tenant.transportation.schedules')
                ->with('success', 'Jadwal berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified schedule.
     */
    public function editSchedule(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $schedule = TransportationSchedule::where('instansi_id', $instansiId)
            ->with(['route'])
            ->findOrFail($id);
            
        $routes = TransportationRoute::where('instansi_id', $instansiId)
            ->where('status', 'active')
            ->get();

        return view('tenant.transportation.schedules.edit', [
            'title' => 'Edit Jadwal',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Jadwal', 'url' => route('tenant.transportation.schedules')],
                ['name' => 'Edit Jadwal', 'url' => null]
            ],
            'schedule' => $schedule,
            'routes' => $routes
        ]);
    }

    /**
     * Update the specified schedule in storage.
     */
    public function updateSchedule(Request $request, string $id)
    {
        $request->validate([
            'route_id' => 'required|exists:transportation_routes,id',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date|after:departure_time',
            'driver_name' => 'nullable|string|max:255',
            'driver_phone' => 'nullable|string|max:20',
            'vehicle_number' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'required|in:scheduled,ongoing,completed,cancelled'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $schedule = TransportationSchedule::where('instansi_id', $instansiId)->findOrFail($id);
            
            $schedule->update([
                'route_id' => $request->route_id,
                'departure_time' => $request->departure_time,
                'arrival_time' => $request->arrival_time,
                'driver_name' => $request->driver_name,
                'driver_phone' => $request->driver_phone,
                'vehicle_number' => $request->vehicle_number,
                'capacity' => $request->capacity,
                'price' => $request->price,
                'notes' => $request->notes,
                'status' => $request->status
            ]);

            DB::commit();

            return redirect()->route('tenant.transportation.schedules')
                ->with('success', 'Jadwal berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified schedule.
     */
    public function showSchedule(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $schedule = TransportationSchedule::where('instansi_id', $instansiId)
            ->with(['route'])
            ->findOrFail($id);

        return view('tenant.transportation.schedules.show', [
            'title' => 'Detail Jadwal',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Transportasi', 'url' => route('tenant.transportation.index')],
                ['name' => 'Jadwal', 'url' => route('tenant.transportation.schedules')],
                ['name' => 'Detail Jadwal', 'url' => null]
            ],
            'schedule' => $schedule
        ]);
    }

    /**
     * Remove the specified schedule from storage.
     */
    public function destroySchedule(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $schedule = TransportationSchedule::where('instansi_id', $instansiId)->findOrFail($id);
            $schedule->delete();

            return redirect()->route('tenant.transportation.schedules')
                ->with('success', 'Jadwal berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Vehicle management
     */
    public function vehicles(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Transportation::where('instansi_id', $instansiId);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vehicle type
        if ($request->filled('vehicle_type')) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('vehicle_number', 'like', "%{$search}%")
                  ->orWhere('driver_name', 'like', "%{$search}%");
            });
        }

        $vehicles = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('tenant.transportation.vehicles', [
            'title' => 'Kendaraan',
            'page-title' => 'Manajemen Kendaraan',
            'vehicles' => $vehicles
        ]);
    }

    /**
     * Create vehicle
     */
    public function createVehicle()
    {
        return view('tenant.transportation.vehicles.create', [
            'title' => 'Tambah Kendaraan',
            'page-title' => 'Tambah Kendaraan'
        ]);
    }

    /**
     * Store vehicle
     */
    public function storeVehicle(Request $request)
    {
        $request->validate([
            'vehicle_type' => 'required|in:bus,minibus,van,car',
            'vehicle_number' => 'required|string|max:50|unique:transportations,vehicle_number',
            'driver_name' => 'nullable|string|max:255',
            'driver_phone' => 'nullable|string|max:20',
            'driver_license' => 'nullable|string|max:50',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive,maintenance',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            Transportation::create([
                'instansi_id' => $instansiId,
                'vehicle_type' => $request->vehicle_type,
                'vehicle_number' => $request->vehicle_number,
                'driver_name' => $request->driver_name,
                'driver_phone' => $request->driver_phone,
                'driver_license' => $request->driver_license,
                'capacity' => $request->capacity,
                'status' => $request->status,
                'notes' => $request->notes
            ]);

            DB::commit();
            return redirect()->route('tenant.transportation.vehicles')
                ->with('success', 'Kendaraan berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Driver management
     */
    public function drivers(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        // Get drivers from vehicles
        $query = Transportation::where('instansi_id', $instansiId)
            ->whereNotNull('driver_name');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('driver_name', 'like', "%{$search}%")
                  ->orWhere('driver_phone', 'like', "%{$search}%")
                  ->orWhere('driver_license', 'like', "%{$search}%");
            });
        }

        $vehicles = $query->select('driver_name', 'driver_phone', 'driver_license', 'vehicle_number', 'vehicle_type', 'status')
            ->distinct()
            ->orderBy('driver_name')
            ->get();

        // Group by driver
        $drivers = $vehicles->groupBy('driver_name')->map(function($group, $name) {
            return [
                'name' => $name,
                'phone' => $group->first()->driver_phone,
                'license' => $group->first()->driver_license,
                'vehicles' => $group,
                'total_vehicles' => $group->count(),
                'active_vehicles' => $group->where('status', 'active')->count()
            ];
        });

        return view('tenant.transportation.drivers', [
            'title' => 'Pengemudi',
            'page-title' => 'Manajemen Pengemudi',
            'drivers' => $drivers
        ]);
    }

    /**
     * Vehicle tracking
     */
    public function vehicleTracking(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $query = Transportation::where('instansi_id', $instansiId);

        // Get vehicles with schedules
        $vehicles = $query->with(['schedules' => function($q) {
            $q->whereDate('departure_time', '>=', now()->toDateString())
              ->orderBy('departure_time');
        }])->get();

        // Get current active trips
        $activeTrips = TransportationSchedule::where('instansi_id', $instansiId)
            ->where('status', 'ongoing')
            ->with(['route'])
            ->get();

        // Get today's schedules
        $todaySchedules = TransportationSchedule::where('instansi_id', $instansiId)
            ->whereDate('departure_time', today())
            ->with(['route'])
            ->orderBy('departure_time')
            ->get();

        return view('tenant.transportation.tracking', [
            'title' => 'Tracking Kendaraan',
            'page-title' => 'Tracking Kendaraan',
            'vehicles' => $vehicles,
            'activeTrips' => $activeTrips,
            'todaySchedules' => $todaySchedules
        ]);
    }

    /**
     * Update vehicle status (for tracking)
     */
    public function updateVehicleStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,maintenance,on_trip',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $vehicle = Transportation::where('instansi_id', $instansiId)
                ->findOrFail($id);

            $vehicle->update([
                'status' => $request->status,
                'notes' => $request->notes
            ]);

            // If tracking location, store it
            if ($request->filled('location')) {
                DB::table('vehicle_locations')->insert([
                    'vehicle_id' => $id,
                    'location' => $request->location,
                    'latitude' => $request->latitude ?? null,
                    'longitude' => $request->longitude ?? null,
                    'recorded_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Status kendaraan berhasil diperbarui'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get vehicle location history
     */
    public function vehicleLocationHistory($id)
    {
        $vehicle = Transportation::where('instansi_id', $instansiId)
            ->findOrFail($id);

        $locations = DB::table('vehicle_locations')
            ->where('vehicle_id', $id)
            ->orderBy('recorded_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($locations);
    }
}
