@extends('layouts.tenant')

@section('title', 'Katrol Nilai')
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
                                    <form action="{{ tenant_route('admin.exam.grade-adjustment', $exam) }}" method="POST">
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
                                    <form action="{{ tenant_route('admin.exam.grade-adjustment', $exam) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="adjustment_type" value="minimum">
                                        <div class="mb-3">
                                            <label for="minimum_score" class="form-label">Nilai Minimum</label>
                                            <input type="number" class="form-control" id="minimum_score" name="minimum_score" 
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
                                    <form action="{{ tenant_route('admin.exam.grade-adjustment', $exam) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="adjustment_type" value="manual">
                                        <div class="mb-3">
                                            <label for="note" class="form-label">Catatan</label>
                                            <textarea class="form-control" id="note" name="note" rows="2" 
                                                      placeholder="Alasan penyesuaian nilai..."></textarea>
                                        </div>
                                        <div class="alert alert-info">
                                            <small>
                                                <i class="fas fa-info-circle me-1"></i>
                                                Gunakan tabel di bawah untuk edit manual per siswa
                                            </small>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Students Table -->
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Daftar Siswa</h6>
                        </div>
                        <div class="card-body">
                            <form id="manualAdjustmentForm" action="{{ tenant_route('admin.exam.grade-adjustment', $exam) }}" method="POST">
                                @csrf
                                <input type="hidden" name="adjustment_type" value="manual">
                                
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th width="5%">#</th>
                                                <th width="25%">Nama Siswa</th>
                                                <th width="15%">Nilai Sebelumnya</th>
                                                <th width="15%">Nilai Baru</th>
                                                <th width="20%">Perubahan</th>
                                                <th width="20%">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @forelse($attempts as $attempt)
                                            <tr>
                                                <td>{{ $loop->iteration }}</td>
                                                <td>{{ $attempt->student->name }}</td>
                                                <td>
                                                    <span class="badge bg-{{ $attempt->score >= 70 ? 'success' : ($attempt->score >= 50 ? 'warning' : 'danger') }}">
                                                        {{ number_format($attempt->score, 2) }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <input type="number" class="form-control form-control-sm" 
                                                           name="manual_scores[{{ $attempt->student_id }}]" 
                                                           value="{{ $attempt->score }}" 
                                                           min="0" max="100" step="0.1">
                                                </td>
                                                <td>
                                                    <span class="text-muted" id="change-{{ $attempt->student_id }}">0</span>
                                                </td>
                                                <td>
                                                    <span class="badge bg-secondary" id="status-{{ $attempt->student_id }}">Tidak berubah</span>
                                                </td>
                                            </tr>
                                            @empty
                                            <tr>
                                                <td colspan="6" class="text-center">Tidak ada data siswa</td>
                                            </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div class="text-end mt-3">
                                    <button type="submit" class="btn btn-success">
                                        <i class="fas fa-save me-1"></i>
                                        Simpan Perubahan Manual
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Adjustment History -->
                    @if($gradeAdjustments->count() > 0)
                    <div class="card mt-4">
                        <div class="card-header">
                            <h6 class="mb-0">Riwayat Penyesuaian</h6>
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
                                            <th>Disesuaikan Oleh</th>
                                            <th>Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($gradeAdjustments as $adjustment)
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
                                            <td>{{ $adjustment->adjustedBy->name }}</td>
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
    // Calculate changes for manual adjustment
    document.querySelectorAll('input[name^="manual_scores"]').forEach(function(input) {
        input.addEventListener('input', function() {
            const studentId = this.name.match(/\[(\d+)\]/)[1];
            const originalValue = parseFloat(this.dataset.original || this.value);
            const newValue = parseFloat(this.value);
            const change = newValue - originalValue;
            
            const changeElement = document.getElementById('change-' + studentId);
            const statusElement = document.getElementById('status-' + studentId);
            
            changeElement.textContent = change > 0 ? '+' + change.toFixed(1) : change.toFixed(1);
            changeElement.className = change > 0 ? 'text-success' : (change < 0 ? 'text-danger' : 'text-muted');
            
            if (change !== 0) {
                statusElement.textContent = 'Berubah';
                statusElement.className = 'badge bg-warning';
            } else {
                statusElement.textContent = 'Tidak berubah';
                statusElement.className = 'badge bg-secondary';
            }
        });
    });

    // Store original values
    document.querySelectorAll('input[name^="manual_scores"]').forEach(function(input) {
        input.dataset.original = input.value;
    });
</script>
@endpush
