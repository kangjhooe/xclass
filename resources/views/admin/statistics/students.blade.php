@extends('layouts.admin-simple')

@section('title', 'Statistik Siswa')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0 text-gray-800">
                    <i class="fas fa-user-graduate me-2"></i>Statistik Siswa
                </h1>
                <div>
                    <a href="{{ route('admin.statistics.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-1"></i>Kembali
                    </a>
                    <a href="{{ route('admin.statistics.export', ['type' => 'students', 'format' => 'excel']) }}" class="btn btn-success">
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
                                Total Siswa
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $students->flatten()->count() }}
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
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Siswa Laki-laki
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $students->flatten()->where('gender', 'male')->count() }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-male fa-2x text-gray-300"></i>
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
                                Siswa Perempuan
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $students->flatten()->where('gender', 'female')->count() }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-female fa-2x text-gray-300"></i>
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
                                Siswa Aktif
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $students->flatten()->where('status', 'active')->count() }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-check-circle fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4">
        <!-- Gender Distribution -->
        <div class="col-xl-6 col-lg-6">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Distribusi Jenis Kelamin</h6>
                </div>
                <div class="card-body">
                    <div class="chart-pie pt-4 pb-2">
                        <canvas id="genderChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students by Year -->
        <div class="col-xl-6 col-lg-6">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Siswa Berdasarkan Tahun</h6>
                </div>
                <div class="card-body">
                    <div class="chart-bar">
                        <canvas id="yearChart"></canvas>
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
                    <h6 class="m-0 font-weight-bold text-primary">Detail Siswa</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" id="studentsTable" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama</th>
                                    <th>NIS</th>
                                    <th>Jenis Kelamin</th>
                                    <th>Kelas</th>
                                    <th>Institusi</th>
                                    <th>Status</th>
                                    <th>Tahun Masuk</th>
                                    <th>Tanggal Dibuat</th>
                                </tr>
                            </thead>
                            <tbody>
                                @php $index = 1; @endphp
                                @foreach($students as $year => $yearStudents)
                                    @foreach($yearStudents as $student)
                                    <tr>
                                        <td>{{ $index++ }}</td>
                                        <td>
                                            <strong>{{ $student->name }}</strong>
                                            @if($student->email)
                                            <br><small class="text-muted">{{ $student->email }}</small>
                                            @endif
                                        </td>
                                        <td>{{ $student->nis ?? 'N/A' }}</td>
                                        <td>
                                            <span class="badge badge-{{ $student->gender === 'male' ? 'primary' : 'info' }}">
                                                {{ $student->gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                                            </span>
                                        </td>
                                        <td>{{ $student->classRoom->name ?? 'N/A' }}</td>
                                        <td>{{ $student->institution->name ?? 'N/A' }}</td>
                                        <td>
                                            <span class="badge badge-{{ $student->status === 'active' ? 'success' : 'danger' }}">
                                                {{ ucfirst($student->status) }}
                                            </span>
                                        </td>
                                        <td>{{ $student->year ?? 'N/A' }}</td>
                                        <td>{{ $student->created_at ? \App\Helpers\DateHelper::formatIndonesian($student->created_at) : 'N/A' }}</td>
                                    </tr>
                                    @endforeach
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<!-- DataTables -->
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">

<script>
$(document).ready(function() {
    // DataTables
    $('#studentsTable').DataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/id.json"
        },
        "pageLength": 25,
        "order": [[1, "asc"]],
        "columnDefs": [
            { "orderable": false, "targets": 0 }
        ]
    });

    // Gender Chart
    const genderCtx = document.getElementById('genderChart').getContext('2d');
    new Chart(genderCtx, {
        type: 'doughnut',
        data: {
            labels: ['Laki-laki', 'Perempuan'],
            datasets: [{
                data: [
                    {{ $students->flatten()->where('gender', 'male')->count() }},
                    {{ $students->flatten()->where('gender', 'female')->count() }}
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Year Chart
    const yearCtx = document.getElementById('yearChart').getContext('2d');
    const yearData = @json($students->map(function($students, $year) {
        return ['year' => $year, 'count' => $students->count()];
    })->values());
    
    new Chart(yearCtx, {
        type: 'bar',
        data: {
            labels: yearData.map(item => item.year),
            datasets: [{
                label: 'Jumlah Siswa',
                data: yearData.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
</script>
@endsection
