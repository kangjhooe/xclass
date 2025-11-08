@extends('layouts.admin-simple')

@section('title', 'Statistik Institusi')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0 text-gray-800">
                    <i class="fas fa-school me-2"></i>Statistik Institusi
                </h1>
                <div>
                    <a href="{{ route('admin.statistics.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-1"></i>Kembali
                    </a>
                    <a href="{{ route('admin.statistics.export', ['type' => 'institutions', 'format' => 'excel']) }}" class="btn btn-success">
                        <i class="fas fa-download me-1"></i>Export Excel
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Institusi
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $institutions->count() }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-school fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Total Siswa
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $institutions->sum('students_count') }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-user-graduate fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Total Guru
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $institutions->sum('teachers_count') }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Rata-rata Siswa/Institusi
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $institutions->count() > 0 ? number_format($institutions->sum('students_count') / $institutions->count(), 1) : 0 }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calculator fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Detailed Table -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Detail Institusi</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" id="institutionsTable" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Institusi</th>
                                    <th>Status</th>
                                    <th>Tipe</th>
                                    <th>Wilayah</th>
                                    <th>Siswa</th>
                                    <th>Guru</th>
                                    <th>Staff</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Ujian</th>
                                    <th>Tanggal Dibuat</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($institutions as $index => $institution)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        <strong>{{ $institution->name }}</strong>
                                        @if($institution->description)
                                        <br><small class="text-muted">{{ Str::limit($institution->description, 50) }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge badge-{{ $institution->status === 'active' ? 'success' : 'danger' }}">
                                            {{ ucfirst($institution->status) }}
                                        </span>
                                    </td>
                                    <td>{{ ucfirst($institution->type ?? 'N/A') }}</td>
                                    <td>{{ $institution->region ?? 'N/A' }}</td>
                                    <td>
                                        <span class="badge badge-primary">{{ $institution->students_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-info">{{ $institution->teachers_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-warning">{{ $institution->staff_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-secondary">{{ $institution->class_rooms_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-dark">{{ $institution->subjects_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-success">{{ $institution->exams_count }}</span>
                                    </td>
                                    <td>{{ $institution->created_at ? \App\Helpers\DateHelper::formatIndonesian($institution->created_at) : 'N/A' }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- DataTables -->
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">

<script>
$(document).ready(function() {
    $('#institutionsTable').DataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/id.json"
        },
        "pageLength": 25,
        "order": [[1, "asc"]],
        "columnDefs": [
            { "orderable": false, "targets": 0 }
        ]
    });
});
</script>
@endsection
