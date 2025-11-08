@extends('layouts.tenant')

@section('title', 'Dashboard Laporan Akademik')
@section('page-title', 'Dashboard Laporan Akademik')

@section('content')
<div id="app">
    <!-- Statistik Umum -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card stats-card text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $totalStudents }}</h4>
                            <p class="mb-0">Total Siswa</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-user-graduate fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card stats-card text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $totalSubjects }}</h4>
                            <p class="mb-0">Mata Pelajaran</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-book fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card stats-card text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $totalGrades }}</h4>
                            <p class="mb-0">Total Nilai</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-chart-line fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card stats-card text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="mb-0">{{ $currentAcademicYear->year_name ?? 'Belum Diatur' }}</h4>
                            <p class="mb-0">Tahun Pelajaran Aktif</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-calendar fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter dan Grafik -->
    <div class="row mb-4">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-chart-bar me-2"></i>
                        Analisis Nilai per Semester
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Semester 1</h6>
                            <div class="progress mb-2" style="height: 25px;">
                                <div class="progress-bar bg-primary" role="progressbar" 
                                     :style="`width: ${semester1Stats.average_score}%`"
                                     :aria-valuenow="semester1Stats.average_score" 
                                     aria-valuemin="0" aria-valuemax="100">
                                    {{ semester1Stats.average_score }}%
                                </div>
                            </div>
                            <div class="row text-center">
                                <div class="col-4">
                                    <strong>{{ semester1Stats.total_grades }}</strong><br>
                                    <small>Total Nilai</small>
                                </div>
                                <div class="col-4">
                                    <strong class="text-success">{{ semester1Stats.passed_count }}</strong><br>
                                    <small>Lulus</small>
                                </div>
                                <div class="col-4">
                                    <strong class="text-danger">{{ semester1Stats.failed_count }}</strong><br>
                                    <small>Tidak Lulus</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <h6>Semester 2</h6>
                            <div class="progress mb-2" style="height: 25px;">
                                <div class="progress-bar bg-info" role="progressbar" 
                                     :style="`width: ${semester2Stats.average_score}%`"
                                     :aria-valuenow="semester2Stats.average_score" 
                                     aria-valuemin="0" aria-valuemax="100">
                                    {{ semester2Stats.average_score }}%
                                </div>
                            </div>
                            <div class="row text-center">
                                <div class="col-4">
                                    <strong>{{ semester2Stats.total_grades }}</strong><br>
                                    <small>Total Nilai</small>
                                </div>
                                <div class="col-4">
                                    <strong class="text-success">{{ semester2Stats.passed_count }}</strong><br>
                                    <small>Lulus</small>
                                </div>
                                <div class="col-4">
                                    <strong class="text-danger">{{ semester2Stats.failed_count }}</strong><br>
                                    <small>Tidak Lulus</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Menu Cepat -->
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-bolt me-2"></i>
                        Menu Cepat
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <a href="{{ tenant_route('tenant.academic-years.index') }}" class="btn btn-outline-primary w-100">
                                <i class="fas fa-calendar me-2"></i>
                                Kelola Tahun Pelajaran
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ tenant_route('tenant.student-grades.index') }}" class="btn btn-outline-success w-100">
                                <i class="fas fa-chart-line me-2"></i>
                                Input Nilai Siswa
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ tenant_route('tenant.academic-reports.class-report') }}" class="btn btn-outline-info w-100">
                                <i class="fas fa-users me-2"></i>
                                Rekap Nilai per Kelas
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ tenant_route('tenant.academic-reports.student-report') }}" class="btn btn-outline-warning w-100">
                                <i class="fas fa-user me-2"></i>
                                Rekap Nilai per Siswa
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Grafik Interaktif -->
    <div class="row mt-4">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-chart-pie me-2"></i>
                        Distribusi Nilai
                    </h6>
                </div>
                <div class="card-body">
                    <canvas id="gradeDistributionChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const { createApp } = Vue;

createApp({
    data() {
        return {
            semester1Stats: @json($semester1Stats),
            semester2Stats: @json($semester2Stats)
        }
    },
    mounted() {
        this.initChart();
    },
    methods: {
        initChart() {
            const ctx = document.getElementById('gradeDistributionChart').getContext('2d');
            
            // Data untuk grafik (contoh)
            const data = {
                labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'E (<60)'],
                datasets: [{
                    label: 'Distribusi Nilai',
                    data: [12, 19, 3, 5, 2],
                    backgroundColor: [
                        '#28a745',
                        '#17a2b8',
                        '#ffc107',
                        '#6c757d',
                        '#dc3545'
                    ],
                    borderWidth: 1
                }]
            };
            
            new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
    }
}).mount('#app');
</script>
@endsection
