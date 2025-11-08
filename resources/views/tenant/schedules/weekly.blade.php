@extends('layouts.tenant')

@section('title', 'Jadwal Mingguan')
@section('page-title', 'Jadwal Mingguan')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                    <i class="fas fa-calendar-week me-2"></i>
                    Jadwal Pelajaran Mingguan
                </h5>
                <div class="btn-group">
                    <a href="{{ tenant_route('tenant.schedules.index') }}" class="btn btn-secondary">
                        <i class="fas fa-list me-2"></i>
                        Daftar Jadwal
                    </a>
                    <a href="{{ tenant_route('tenant.schedules.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Jadwal
                    </a>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead class="table-dark">
                            <tr>
                                <th style="width: 15%;">Waktu</th>
                                @foreach($days as $day)
                                    <th class="text-center">{{ $dayNames[$day] }}</th>
                                @endforeach
                            </tr>
                        </thead>
                        <tbody>
                            @php
                                $timeSlots = [
                                    '07:00' => '07:00',
                                    '08:00' => '08:00', 
                                    '09:00' => '09:00',
                                    '10:00' => '10:00',
                                    '11:00' => '11:00',
                                    '12:00' => '12:00',
                                    '13:00' => '13:00',
                                    '14:00' => '14:00',
                                    '15:00' => '15:00',
                                    '16:00' => '16:00'
                                ];
                            @endphp
                            
                            @foreach($timeSlots as $time => $label)
                                <tr>
                                    <td class="fw-bold">{{ $label }}</td>
                                    @foreach($days as $day)
                                        <td class="text-center" style="height: 60px; vertical-align: middle;">
                                            @if(isset($schedules[$day]))
                                                @foreach($schedules[$day] as $schedule)
                                                    @if(\Carbon\Carbon::parse($schedule->start_time)->format('H:i') == $time)
                                                        <div class="card border-primary mb-1">
                                                            <div class="card-body p-2">
                                                                <h6 class="card-title mb-1 text-primary">
                                                                    {{ $schedule->subject->name }}
                                                                </h6>
                                                                <p class="card-text mb-1">
                                                                    <small class="text-muted">
                                                                        {{ $schedule->teacher->name }}
                                                                    </small>
                                                                </p>
                                                                <p class="card-text mb-1">
                                                                    <small class="text-muted">
                                                                        {{ $schedule->classRoom->name }}
                                                                    </small>
                                                                </p>
                                                                @if($schedule->room)
                                                                    <p class="card-text mb-0">
                                                                        <small class="text-muted">
                                                                            <i class="fas fa-door-open me-1"></i>
                                                                            {{ $schedule->room }}
                                                                        </small>
                                                                    </p>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    @endif
                                                @endforeach
                                            @endif
                                        </td>
                                    @endforeach
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

