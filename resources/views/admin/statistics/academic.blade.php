@extends('layouts.admin-simple')

@section('title', 'Statistik Akademik')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0 text-gray-800">
                    <i class="fas fa-graduation-cap me-2"></i>Statistik Akademik
                </h1>
                <div>
                    <a href="{{ route('admin.statistics.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-1"></i>Kembali
                    </a>
                    <a href="{{ route('admin.statistics.export', ['type' => 'academic', 'format' => 'excel']) }}" class="btn btn-success">
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
                                Total Ujian
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $academic['exams_by_month']->sum('total') }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-clipboard-list fa-2x text-gray-300"></i>
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
                                Total Hasil Ujian
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $academic['results_by_month']->sum('total') }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-chart-line fa-2x text-gray-300"></i>
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
                                Rata-rata Nilai
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $academic['results_by_month']->avg('average_score') ? number_format($academic['results_by_month']->avg('average_score'), 2) : 'N/A' }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-star fa-2x text-gray-300"></i>
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
                                Total Mata Pelajaran
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $academic['subjects_performance']->count() }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-book fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4">
        <!-- Exams by Month -->
        <div class="col-xl-8 col-lg-7">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Ujian dan Hasil Ujian per Bulan</h6>
                </div>
                <div class="card-body">
                    <div class="chart-area">
                        <canvas id="examsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subject Performance -->
        <div class="col-xl-4 col-lg-5">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Performa Mata Pelajaran</h6>
                </div>
                <div class="card-body">
                    <div class="chart-pie pt-4 pb-2">
                        <canvas id="subjectChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Monthly Performance Table -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Performa Bulanan</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" id="monthlyTable" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>Bulan/Tahun</th>
                                    <th>Jumlah Ujian</th>
                                    <th>Jumlah Hasil Ujian</th>
                                    <th>Rata-rata Nilai</th>
                                    <th>Persentase Penyelesaian</th>
                                </tr>
                            </thead>
                            <tbody>
                                @php
                                    $examsData = $academic['exams_by_month']->keyBy(function($item) {
                                        return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
                                    });
                                    $resultsData = $academic['results_by_month']->keyBy(function($item) {
                                        return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
                                    });
                                    $allMonths = $examsData->keys()->merge($resultsData->keys())->unique()->sort();
                                @endphp
                                @foreach($allMonths as $monthKey)
                                    @php
                                        $exams = $examsData->get($monthKey);
                                        $results = $resultsData->get($monthKey);
                                        $examsCount = $exams ? $exams->total : 0;
                                        $resultsCount = $results ? $results->total : 0;
                                        $averageScore = $results ? $results->average_score : 0;
                                        $completionRate = $examsCount > 0 ? ($resultsCount / $examsCount) * 100 : 0;
                                        $monthName = \Carbon\Carbon::createFromFormat('Y-m', $monthKey)->format('M Y');
                                    @endphp
                                    <tr>
                                        <td>{{ $monthName }}</td>
                                        <td>
                                            <span class="badge badge-primary">{{ $examsCount }}</span>
                                        </td>
                                        <td>
                                            <span class="badge badge-success">{{ $resultsCount }}</span>
                                        </td>
                                        <td>
                                            <span class="badge badge-info">{{ number_format($averageScore, 2) }}</span>
                                        </td>
                                        <td>
                                            <div class="progress" style="height: 20px;">
                                                <div class="progress-bar" role="progressbar" style="width: {{ $completionRate }}%">
                                                    {{ number_format($completionRate, 1) }}%
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Subject Performance Table -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Detail Performa Mata Pelajaran</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" id="subjectsTable" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Jumlah Ujian</th>
                                    <th>Jumlah Hasil Ujian</th>
                                    <th>Rata-rata Hasil Ujian</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($academic['subjects_performance'] as $index => $subject)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        <strong>{{ $subject->name }}</strong>
                                        @if($subject->description)
                                        <br><small class="text-muted">{{ Str::limit($subject->description, 50) }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge badge-primary">{{ $subject->exams_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-success">{{ $subject->exams->sum('exam_attempts_count') }}</span>
                                    </td>
                                    <td>
                                        @php
                                            $totalResults = $subject->exams->sum('exam_attempts_count');
                                            $avgResults = $totalResults > 0 ? $totalResults / $subject->exams_count : 0;
                                        @endphp
                                        <span class="badge badge-info">{{ number_format($avgResults, 1) }}</span>
                                    </td>
                                    <td>
                                        <span class="badge badge-{{ $subject->exams_count > 0 ? 'success' : 'secondary' }}">
                                            {{ $subject->exams_count > 0 ? 'Aktif' : 'Tidak Aktif' }}
                                        </span>
                                    </td>
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

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<!-- DataTables -->
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">

<script>
$(document).ready(function() {
    // DataTables
    $('#monthlyTable, #subjectsTable').DataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/id.json"
        },
        "pageLength": 25,
        "order": [[0, "desc"]]
    });

    // Exams Chart
    const examsCtx = document.getElementById('examsChart').getContext('2d');
    const examsData = @json($academic['exams_by_month']->map(function($item) {
        return [
            'month' => \Carbon\Carbon::createFromFormat('Y-m', $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT))->format('M Y'),
            'total' => $item->total
        ];
    }));
    const resultsData = @json($academic['results_by_month']->map(function($item) {
        return [
            'month' => \Carbon\Carbon::createFromFormat('Y-m', $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT))->format('M Y'),
            'total' => $item->total
        ];
    }));
    
    new Chart(examsCtx, {
        type: 'line',
        data: {
            labels: examsData.map(item => item.month),
            datasets: [{
                label: 'Ujian',
                data: examsData.map(item => item.total),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }, {
                label: 'Hasil Ujian',
                data: resultsData.map(item => item.total),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.1
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

    // Subject Chart
    const subjectCtx = document.getElementById('subjectChart').getContext('2d');
    const subjectData = @json($academic['subjects_performance']->take(10)->map(function($subject) {
        return [
            'name' => $subject->name,
            'exams' => $subject->exams_count
        ];
    }));
    
    new Chart(subjectCtx, {
        type: 'doughnut',
        data: {
            labels: subjectData.map(item => item.name),
            datasets: [{
                data: subjectData.map(item => item.exams),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)',
                    'rgba(255, 99, 255, 0.8)',
                    'rgba(99, 255, 132, 0.8)'
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
});
</script>
@endsection
