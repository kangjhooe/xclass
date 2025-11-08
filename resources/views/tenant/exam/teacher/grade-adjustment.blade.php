@extends('layouts.tenant')

@section('title', 'Katrol Nilai - Guru')
@section('page-title', 'Katrol Nilai')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-line me-2"></i>
                        Katrol Nilai - {{ $exam->title }}
                    </h5>
                    <p class="text-muted mb-0">Anda hanya dapat menyesuaikan nilai untuk mata pelajaran yang Anda ampu</p>
                </div>
                <div class="card-body">
                    <!-- Adjustment Forms -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">Penyesuaian Persentase</h6>
                                </div>
                                <div class="card-body">
                                    <form action="{{ tenant_route('teacher.exam.grade-adjustment', $exam) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="adjustment_type" value="percent">
                                        <div class="mb-3">
                                            <label for="percentage" class="form-label">Persentase (%)</label>
                                            <input type="number" class="form-control" id="percentage" name="percentage" 
                                                   min="-100" max="100" step="0.1" placeholder="10" required>
                                            <div class="form-text">Masukkan persentase (contoh: 10 untuk +10%, -5 untuk -5%)</div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="note" class="form-label">Catatan</label>
                                            <textarea class="form-control" id="note" name="note" rows="2" 
                                                      placeholder="Alasan penyesuaian nilai..."></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary w-100">
                                            <i class="fas fa-percentage me-1"></i>
                                            Terapkan Persentase
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">Nilai Minimum</h6>
                                </div>
                                <div class="card-body">
                                    <form action="{{ tenant_route('teacher.exam.grade-adjustment', $exam) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="adjustment_type" value="minimum">
                                        <div class="mb-3">
                                            <label for="minimum_grade" class="form-label">Nilai Minimum</label>
                                            <input type="number" class="form-control" id="minimum_grade" name="minimum_grade" 
                                                   min="0" max="100" step="0.1" placeholder="70" required>
                                            <div class="form-text">Semua nilai di bawah ini akan dinaikkan</div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="note" class="form-label">Catatan</label>
                                            <textarea class="form-control" id="note" name="note" rows="2" 
                                                      placeholder="Alasan penyesuaian nilai..."></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-warning w-100">
                                            <i class="fas fa-arrow-up me-1"></i>
                                            Terapkan Minimum
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">Edit Manual</h6>
                                </div>
                                <div class="card-body">
                                    <form id="manualForm" action="{{ tenant_route('teacher.exam.grade-adjustment', $exam) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="adjustment_type" value="manual">
                                        <div class="mb-3">
                                            <label for="student_id" class="form-label">Pilih Siswa</label>
                                            <select class="form-select" id="student_id" name="student_id" required>
                                                <option value="">Pilih siswa...</option>
                                                @foreach($eligibleStudents as $student)
                                                <option value="{{ $student->id }}" data-current-grade="{{ $student->current_grade }}">
                                                    {{ $student->name }} ({{ number_format($student->current_grade, 2) }})
                                                </option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new_grade" class="form-label">Nilai Baru</label>
                                            <input type="number" class="form-control" id="new_grade" name="new_grade" 
                                                   min="0" max="100" step="0.1" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="note" class="form-label">Catatan</label>
                                            <textarea class="form-control" id="note" name="note" rows="2" 
                                                      placeholder="Alasan penyesuaian nilai..."></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-success w-100">
                                            <i class="fas fa-save me-1"></i>
                                            Simpan Perubahan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Students List -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Daftar Siswa yang Dapat Disesuaikan</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="25%">Nama Siswa</th>
                                            <th width="15%">Mata Pelajaran</th>
                                            <th width="15%">Nilai Saat Ini</th>
                                            <th width="15%">Status</th>
                                            <th width="25%">Aksi Terakhir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @forelse($eligibleStudents as $student)
                                        <tr>
                                            <td>{{ $loop->iteration }}</td>
                                            <td>{{ $student->name }}</td>
                                            <td>
                                                @foreach($student->subjects as $subject)
                                                    <span class="badge bg-info me-1">{{ $subject->name }}</span>
                                                @endforeach
                                            </td>
                                            <td>
                                                <span class="badge bg-{{ $student->current_grade >= 70 ? 'success' : ($student->current_grade >= 50 ? 'warning' : 'danger') }}">
                                                    {{ number_format($student->current_grade, 2) }}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge bg-{{ $student->status === 'completed' ? 'success' : 'secondary' }}">
                                                    {{ ucfirst($student->status) }}
                                                </span>
                                            </td>
                                            <td>
                                                @if($student->last_adjustment)
                                                    {{ $student->last_adjustment->created_at->format('d/m/Y H:i') }}
                                                    <br><small class="text-muted">oleh {{ $student->last_adjustment->adjustedBy->name }}</small>
                                                @else
                                                    <span class="text-muted">Belum ada penyesuaian</span>
                                                @endif
                                            </td>
                                        </tr>
                                        @empty
                                        <tr>
                                            <td colspan="6" class="text-center">Tidak ada siswa yang dapat disesuaikan nilainya</td>
                                        </tr>
                                        @endforelse
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Adjustment History -->
                    @if($adjustmentHistory->count() > 0)
                    <div class="card mt-4">
                        <div class="card-header">
                            <h6 class="mb-0">Riwayat Penyesuaian Anda</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Siswa</th>
                                            <th>Tipe</th>
                                            <th>Sebelum</th>
                                            <th>Sesudah</th>
                                            <th>Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($adjustmentHistory as $adjustment)
                                        <tr>
                                            <td>{{ $adjustment->created_at->format('d/m/Y H:i') }}</td>
                                            <td>{{ $adjustment->student->name }}</td>
                                            <td>
                                                <span class="badge bg-{{ $adjustment->adjustment_type === 'percent' ? 'primary' : ($adjustment->adjustment_type === 'minimum' ? 'warning' : 'info') }}">
                                                    {{ ucfirst($adjustment->adjustment_type) }}
                                                </span>
                                            </td>
                                            <td>{{ number_format($adjustment->before_value, 2) }}</td>
                                            <td>{{ number_format($adjustment->after_value, 2) }}</td>
                                            <td>{{ $adjustment->note ?? '-' }}</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Auto-fill current grade when student is selected
    document.getElementById('student_id').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const currentGrade = selectedOption.dataset.currentGrade;
        if (currentGrade) {
            document.getElementById('new_grade').value = currentGrade;
        }
    });
</script>
@endpush
