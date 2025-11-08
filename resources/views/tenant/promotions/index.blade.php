@extends('layouts.tenant')

@section('title', 'Naik Kelas')
@section('page-title', 'Naik Kelas')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-arrow-up me-2"></i>
                    Daftar Naik Kelas
                </h5>
                <a href="{{ tenant_route('tenant.promotions.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>
                    Buat Data Naik Kelas
                </a>
            </div>
            <div class="card-body">
                <!-- Filter -->
                <form method="GET" class="mb-3">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <select name="status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Approved</option>
                                <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Completed</option>
                                <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select name="type" class="form-select">
                                <option value="">Semua Tipe</option>
                                <option value="promotion" {{ request('type') == 'promotion' ? 'selected' : '' }}>Naik Kelas</option>
                                <option value="repeat" {{ request('type') == 'repeat' ? 'selected' : '' }}>Tinggal Kelas</option>
                                <option value="transfer" {{ request('type') == 'transfer' ? 'selected' : '' }}>Pindah Kelas</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select name="academic_year_id" class="form-select">
                                <option value="">Semua Tahun Pelajaran</option>
                                @foreach($academicYears as $ay)
                                    <option value="{{ $ay->id }}" {{ request('academic_year_id') == $ay->id ? 'selected' : '' }}>
                                        {{ $ay->year_name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search me-2"></i>Filter
                            </button>
                        </div>
                    </div>
                </form>

                @if($promotions->count() > 0)
                    <!-- Bulk Actions -->
                    @if($promotions->where('status', 'approved')->count() > 0)
                        <form action="{{ tenant_route('tenant.promotions.bulk-complete') }}" method="POST" class="mb-3" id="bulkCompleteForm">
                            @csrf
                            <button type="submit" class="btn btn-success" onclick="return confirm('Selesaikan semua promotion yang approved?')">
                                <i class="fas fa-check-double me-2"></i>
                                Complete Semua (Approved)
                            </button>
                        </form>
                    @endif

                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th width="3%">
                                        @if($promotions->where('status', 'approved')->count() > 0)
                                            <input type="checkbox" id="selectAll" onclick="toggleSelectAll()">
                                        @endif
                                    </th>
                                    <th>No</th>
                                    <th>Nama Siswa</th>
                                    <th>Dari Kelas</th>
                                    <th>Ke Kelas</th>
                                    <th>Tahun Pelajaran</th>
                                    <th>Tipe</th>
                                    <th>Rata-rata</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($promotions as $index => $promotion)
                                    <tr>
                                        <td>
                                            @if($promotion->status == 'approved')
                                                <input type="checkbox" name="promotion_ids[]" value="{{ $promotion->id }}" class="promotion-checkbox" form="bulkCompleteForm">
                                            @endif
                                        </td>
                                        <td>{{ $promotions->firstItem() + $index }}</td>
                                        <td>
                                            <strong>{{ $promotion->student->name }}</strong><br>
                                            <small class="text-muted">{{ $promotion->student->nis ?? 'N/A' }}</small>
                                        </td>
                                        <td>
                                            {{ $promotion->fromClass->name ?? '-' }}
                                        </td>
                                        <td>
                                            {{ $promotion->toClass->name ?? '-' }}
                                        </td>
                                        <td>
                                            {{ $promotion->fromAcademicYear->year_name }} → {{ $promotion->toAcademicYear->year_name }}
                                        </td>
                                        <td>
                                            @if($promotion->type == 'promotion')
                                                <span class="badge bg-success">Naik Kelas</span>
                                            @elseif($promotion->type == 'repeat')
                                                <span class="badge bg-warning">Tinggal Kelas</span>
                                            @else
                                                <span class="badge bg-info">Pindah Kelas</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($promotion->final_average)
                                                <strong>{{ number_format($promotion->final_average, 2) }}</strong>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($promotion->status == 'pending')
                                                <span class="badge bg-warning">Pending</span>
                                            @elseif($promotion->status == 'approved')
                                                <span class="badge bg-info">Approved</span>
                                            @elseif($promotion->status == 'completed')
                                                <span class="badge bg-success">Completed</span>
                                            @else
                                                <span class="badge bg-secondary">Cancelled</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                @if($promotion->status == 'pending')
                                                    <form action="{{ tenant_route('tenant.promotions.approve', $promotion) }}" 
                                                          method="POST" class="d-inline">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-info"
                                                                onclick="return confirm('Approve promotion ini?')"
                                                                title="Approve">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                    </form>
                                                    <form action="{{ tenant_route('tenant.promotions.cancel', $promotion) }}" 
                                                          method="POST" class="d-inline">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-danger"
                                                                onclick="return confirm('Batalkan promotion ini?')"
                                                                title="Cancel">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </form>
                                                @elseif($promotion->status == 'approved')
                                                    <form action="{{ tenant_route('tenant.promotions.complete', $promotion) }}" 
                                                          method="POST" class="d-inline">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-success"
                                                                onclick="return confirm('Selesaikan promotion dan pindahkan siswa ke kelas baru?')"
                                                                title="Complete">
                                                            <i class="fas fa-arrow-right"></i>
                                                        </button>
                                                    </form>
                                                @elseif($promotion->status == 'completed')
                                                    <span class="text-success" title="Sudah selesai">
                                                        <i class="fas fa-check-circle"></i>
                                                    </span>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="d-flex justify-content-center mt-3">
                        {{ $promotions->links() }}
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-arrow-up fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada data naik kelas</h5>
                        <p class="text-muted">Klik tombol "Buat Data Naik Kelas" untuk membuat data naik kelas pertama.</p>
                        <a href="{{ tenant_route('tenant.promotions.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Buat Data Naik Kelas
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<script>
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.promotion-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });
}
</script>
@endsection

