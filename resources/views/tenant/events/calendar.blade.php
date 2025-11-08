@extends('layouts.tenant')

@section('title', 'Kalender Event')
@section('page-title', 'Kalender Event')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-calendar-alt me-2"></i>
                            Kalender Event
                        </h5>
                        <div class="btn-group">
                            <a href="{{ tenant_route('events.index') }}" class="btn btn-outline-primary">
                                <i class="fas fa-list me-1"></i>
                                Daftar Event
                            </a>
                            <a href="{{ tenant_route('events.create') }}" class="btn btn-primary">
                                <i class="fas fa-plus me-1"></i>
                                Tambah Event
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div id="calendar"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Event Detail Modal -->
<div class="modal fade" id="eventModal" tabindex="-1" aria-labelledby="eventModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="eventModalLabel">Detail Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="eventDetails">
                    <!-- Event details will be loaded here -->
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                <a href="#" id="editEventBtn" class="btn btn-warning">
                    <i class="fas fa-edit me-1"></i>
                    Edit
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css" rel="stylesheet">
<style>
.fc-event {
    cursor: pointer;
}
.fc-event:hover {
    opacity: 0.8;
}
</style>
@endpush

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'id',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            today: 'Hari Ini',
            month: 'Bulan',
            week: 'Minggu',
            day: 'Hari',
            list: 'Daftar'
        },
        events: {!! json_encode($events) !!},
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventDidMount: function(info) {
            // Add tooltip
            info.el.title = info.event.title;
        }
    });

    calendar.render();

    function showEventDetails(event) {
        const eventDetails = document.getElementById('eventDetails');
        const editBtn = document.getElementById('editEventBtn');
        
        // Set edit button href
        editBtn.href = '{{ tenant_route("tenant.events.edit", ":id") }}'.replace(':id', event.id);
        
        // Create event details HTML
        const detailsHtml = `
            <div class="mb-3">
                <h6 class="text-primary">${event.title}</h6>
                <p class="text-muted mb-0">${event.extendedProps.description || '-'}</p>
            </div>
            
            <div class="row">
                <div class="col-6">
                    <strong>Jenis:</strong><br>
                    <span class="badge bg-${event.extendedProps.type === 'academic' ? 'primary' : 
                                          event.extendedProps.type === 'sports' ? 'success' : 
                                          event.extendedProps.type === 'cultural' ? 'warning' : 'info'}">
                        ${event.extendedProps.type === 'academic' ? 'Akademik' : 
                          event.extendedProps.type === 'sports' ? 'Olahraga' : 
                          event.extendedProps.type === 'cultural' ? 'Budaya' : 'Lainnya'}
                    </span>
                </div>
                <div class="col-6">
                    <strong>Lokasi:</strong><br>
                    ${event.extendedProps.location || '-'}
                </div>
            </div>
            
            <div class="mt-3">
                <strong>Waktu:</strong><br>
                ${event.start.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })} ${event.start.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
                ${event.end ? ` - ${event.end.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}` : ''}
            </div>
        `;
        
        eventDetails.innerHTML = detailsHtml;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    }
});
</script>
@endpush
