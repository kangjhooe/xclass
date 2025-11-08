<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Event;
use App\Models\Tenant\Student;
use App\Models\Tenant\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instansiId = $this->getInstansiId();
        
        // Get event statistics
        $stats = [
            'total_events' => Event::where('instansi_id', $instansiId)->count(),
            'upcoming_events' => Event::where('instansi_id', $instansiId)
                ->where('start_date', '>=', now())
                ->count(),
            'this_month_events' => Event::where('instansi_id', $instansiId)
                ->whereMonth('start_date', now()->month)
                ->whereYear('start_date', now()->year)
                ->count(),
            'completed_events' => Event::where('instansi_id', $instansiId)
                ->where('end_date', '<', now())
                ->count()
        ];

        // Get recent events
        $recentEvents = Event::where('instansi_id', $instansiId)
            ->with(['classRoom', 'students'])
            ->orderBy('start_date', 'desc')
            ->limit(10)
            ->get();

        return view('tenant.events.index', [
            'title' => 'Event',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Event', 'url' => null]
            ],
            'stats' => $stats,
            'recentEvents' => $recentEvents
        ]);
    }

    /**
     * Display calendar view
     */
    public function calendar()
    {
        $instansiId = $this->getInstansiId();
        
        // Get events for calendar
        $events = Event::where('instansi_id', $instansiId)
            ->with(['classRoom', 'students'])
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->start_date,
                    'end' => $event->end_date,
                    'color' => $event->type === 'academic' ? '#007bff' : 
                              ($event->type === 'sports' ? '#28a745' : '#ffc107'),
                    'description' => $event->description,
                    'location' => $event->location,
                    'type' => $event->type
                ];
            });

        return view('tenant.events.calendar', [
            'title' => 'Kalender Event',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Event', 'url' => route('tenant.events.index')],
                ['name' => 'Kalender Event', 'url' => null]
            ],
            'events' => $events
        ]);
    }

    /**
     * Show the form for creating a new event.
     */
    public function create()
    {
        $instansiId = $this->getInstansiId();
        
        $classRooms = ClassRoom::where('instansi_id', $instansiId)->get();
        $students = Student::where('instansi_id', $instansiId)->get();

        return view('tenant.events.create', [
            'title' => 'Tambah Event',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Event', 'url' => route('tenant.events.index')],
                ['name' => 'Tambah Event', 'url' => null]
            ],
            'classRooms' => $classRooms,
            'students' => $students
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:academic,sports,cultural,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'class_room_id' => 'nullable|exists:class_rooms,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
            'is_all_day' => 'boolean',
            'is_recurring' => 'boolean',
            'recurring_type' => 'nullable|in:daily,weekly,monthly,yearly',
            'recurring_end_date' => 'nullable|date|after:start_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $event = Event::create([
                'instansi_id' => $instansiId,
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'location' => $request->location,
                'class_room_id' => $request->class_room_id,
                'is_all_day' => $request->boolean('is_all_day'),
                'is_recurring' => $request->boolean('is_recurring'),
                'recurring_type' => $request->recurring_type,
                'recurring_end_date' => $request->recurring_end_date,
                'status' => 'scheduled'
            ]);

            // Attach students if selected
            if ($request->has('student_ids')) {
                $event->students()->attach($request->student_ids);
            }

            DB::commit();

            return redirect()->route('tenant.events.index')
                ->with('success', 'Event berhasil ditambahkan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified event.
     */
    public function edit(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $event = Event::where('instansi_id', $instansiId)
            ->with(['classRoom', 'students'])
            ->findOrFail($id);
            
        $classRooms = ClassRoom::where('instansi_id', $instansiId)->get();
        $students = Student::where('instansi_id', $instansiId)->get();

        return view('tenant.events.edit', [
            'title' => 'Edit Event',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Event', 'url' => route('tenant.events.index')],
                ['name' => 'Edit Event', 'url' => null]
            ],
            'event' => $event,
            'classRooms' => $classRooms,
            'students' => $students
        ]);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:academic,sports,cultural,other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'class_room_id' => 'nullable|exists:class_rooms,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
            'is_all_day' => 'boolean',
            'is_recurring' => 'boolean',
            'recurring_type' => 'nullable|in:daily,weekly,monthly,yearly',
            'recurring_end_date' => 'nullable|date|after:start_date'
        ]);

        try {
            DB::beginTransaction();

            $instansiId = $this->getInstansiId();
            
            $event = Event::where('instansi_id', $instansiId)->findOrFail($id);
            
            $event->update([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'location' => $request->location,
                'class_room_id' => $request->class_room_id,
                'is_all_day' => $request->boolean('is_all_day'),
                'is_recurring' => $request->boolean('is_recurring'),
                'recurring_type' => $request->recurring_type,
                'recurring_end_date' => $request->recurring_end_date
            ]);

            // Update students
            if ($request->has('student_ids')) {
                $event->students()->sync($request->student_ids);
            } else {
                $event->students()->detach();
            }

            DB::commit();

            return redirect()->route('tenant.events.index')
                ->with('success', 'Event berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(string $id)
    {
        try {
            $instansiId = $this->getInstansiId();
            
            $event = Event::where('instansi_id', $instansiId)->findOrFail($id);
            
            // Detach students
            $event->students()->detach();
            
            $event->delete();

            return redirect()->route('tenant.events.index')
                ->with('success', 'Event berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Show the specified event.
     */
    public function show(string $id)
    {
        $instansiId = $this->getInstansiId();
        
        $event = Event::where('instansi_id', $instansiId)
            ->with(['classRoom', 'students'])
            ->findOrFail($id);

        return view('tenant.events.show', [
            'title' => 'Detail Event',
            'breadcrumb' => [
                ['name' => 'Dashboard', 'url' => tenant_route('tenant.dashboard')],
                ['name' => 'Event', 'url' => route('tenant.events.index')],
                ['name' => 'Detail Event', 'url' => null]
            ],
            'event' => $event
        ]);
    }

    /**
     * Get events for API (for calendar)
     */
    public function getEvents(Request $request)
    {
        $instansiId = $this->getInstansiId();
        
        $start = $request->get('start');
        $end = $request->get('end');
        
        $events = Event::where('instansi_id', $instansiId)
            ->whereBetween('start_date', [$start, $end])
            ->with(['classRoom', 'students'])
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->start_date,
                    'end' => $event->end_date,
                    'color' => $event->type === 'academic' ? '#007bff' : 
                              ($event->type === 'sports' ? '#28a745' : '#ffc107'),
                    'description' => $event->description,
                    'location' => $event->location,
                    'type' => $event->type,
                    'url' => route('tenant.events.show', $event->id)
                ];
            });

        return response()->json($events);
    }

    /**
     * Event registration system
     */
    public function registrations(Request $request, $eventId)
    {
        $event = Event::where('instansi_id', $instansiId)
            ->findOrFail($eventId);

        $query = DB::table('event_registrations')
            ->where('event_id', $eventId)
            ->join('students', 'event_registrations.student_id', '=', 'students.id')
            ->select('event_registrations.*', 'students.name as student_name', 'students.student_number');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('event_registrations.status', $request->status);
        }

        $registrations = $query->orderBy('registered_at', 'desc')->paginate(20);

        // Get registration statistics
        $stats = [
            'total_registrations' => DB::table('event_registrations')->where('event_id', $eventId)->count(),
            'confirmed' => DB::table('event_registrations')->where('event_id', $eventId)->where('status', 'confirmed')->count(),
            'pending' => DB::table('event_registrations')->where('event_id', $eventId)->where('status', 'pending')->count(),
            'cancelled' => DB::table('event_registrations')->where('event_id', $eventId)->where('status', 'cancelled')->count(),
        ];

        return view('tenant.events.registrations', [
            'title' => 'Pendaftaran Event',
            'page-title' => 'Pendaftaran Event',
            'event' => $event,
            'registrations' => $registrations,
            'stats' => $stats
        ]);
    }

    /**
     * Register student for event
     */
    public function registerStudent(Request $request, $eventId)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id'
        ]);

        try {
            DB::beginTransaction();

            $event = Event::where('instansi_id', $instansiId)
                ->findOrFail($eventId);

            // Check if event allows registration
            if (!$event->allow_registration) {
                return redirect()->back()->with('error', 'Event ini tidak menerima pendaftaran');
            }

            // Check capacity
            $currentRegistrations = DB::table('event_registrations')
                ->where('event_id', $eventId)
                ->where('status', '!=', 'cancelled')
                ->count();

            if ($event->max_participants && ($currentRegistrations + count($request->student_ids)) > $event->max_participants) {
                return redirect()->back()->with('error', 'Kuota peserta sudah penuh');
            }

            $registered = 0;
            foreach ($request->student_ids as $studentId) {
                // Check if already registered
                $exists = DB::table('event_registrations')
                    ->where('event_id', $eventId)
                    ->where('student_id', $studentId)
                    ->exists();

                if (!$exists) {
                    DB::table('event_registrations')->insert([
                        'event_id' => $eventId,
                        'student_id' => $studentId,
                        'status' => 'pending',
                        'registered_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    $registered++;
                }
            }

            DB::commit();
            return redirect()->back()->with('success', "{$registered} siswa berhasil didaftarkan");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update registration status
     */
    public function updateRegistrationStatus(Request $request, $eventId, $registrationId)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,attended'
        ]);

        try {
            DB::table('event_registrations')
                ->where('id', $registrationId)
                ->where('event_id', $eventId)
                ->update([
                    'status' => $request->status,
                    'updated_at' => now()
                ]);

            return redirect()->back()->with('success', 'Status pendaftaran berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Send event notification
     */
    public function sendNotification(Request $request, $eventId)
    {
        $request->validate([
            'notification_type' => 'required|in:reminder,update,cancellation',
            'message' => 'required|string|max:1000'
        ]);

        try {
            $event = Event::where('instansi_id', $instansiId)
                ->findOrFail($eventId);

            // Get registered students
            $registrations = DB::table('event_registrations')
                ->where('event_id', $eventId)
                ->where('status', '!=', 'cancelled')
                ->pluck('student_id');

            $students = Student::whereIn('id', $registrations)->get();

            // Send notification to each student/parent
            $sentCount = 0;
            foreach ($students as $student) {
                // Create notification record
                DB::table('event_notifications')->insert([
                    'event_id' => $eventId,
                    'student_id' => $student->id,
                    'notification_type' => $request->notification_type,
                    'message' => $request->message,
                    'sent_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $sentCount++;
            }

            return redirect()->back()->with('success', "Notifikasi berhasil dikirim ke {$sentCount} peserta");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Bulk registration from class
     */
    public function bulkRegisterFromClass(Request $request, $eventId)
    {
        $request->validate([
            'class_ids' => 'required|array',
            'class_ids.*' => 'exists:class_rooms,id'
        ]);

        try {
            DB::beginTransaction();

            $event = Event::where('instansi_id', $instansiId)
                ->findOrFail($eventId);

            $students = Student::where('instansi_id', $instansiId)
                ->whereIn('class_id', $request->class_ids)
                ->pluck('id');

            $registered = 0;
            foreach ($students as $studentId) {
                $exists = DB::table('event_registrations')
                    ->where('event_id', $eventId)
                    ->where('student_id', $studentId)
                    ->exists();

                if (!$exists) {
                    DB::table('event_registrations')->insert([
                        'event_id' => $eventId,
                        'student_id' => $studentId,
                        'status' => 'pending',
                        'registered_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    $registered++;
                }
            }

            DB::commit();
            return redirect()->back()->with('success', "{$registered} siswa berhasil didaftarkan dari kelas terpilih");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
