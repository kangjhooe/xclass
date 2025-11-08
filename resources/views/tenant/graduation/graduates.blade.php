@extends('layouts.tenant')

@section('title', 'Daftar Lulusan')
@section('page-title', 'Daftar Lulusan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-graduation-cap me-2"></i>
                        Daftar Lulusan
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Action Buttons -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('graduation.graduates.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Tambah Lulusan
                                </a>
                                <a href="{{ tenant_route('graduation.graduates.export') }}" class="btn btn-success">
                                    <i class="fas fa-file-excel me-1"></i>
                                    Export Excel
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Cari lulusan..." id="searchInput">
                                <button class="btn btn-outline-secondary" type="button" onclick="searchGraduates()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Graduates Table -->
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>No</th>
                                    <th>NIS/NISN</th>
                                    <th>Nama Siswa</th>
                                    <th>Tahun Lulus</th>
                                    <th>Tanggal Lulus</th>
                                    <th>Nilai Akhir</th>
                                    <th>Prestasi</th>
                                    <th>No. Sertifikat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($graduates as $graduate)
                                    <tr>
                                        <td>{{ $graduates->firstItem() + $loop->index }}</td>
                                        <td>
                                            <div>{{ $graduate->student->student_number ?? $graduate->student->nis ?? '-' }}</div>
                                            <small class="text-muted">{{ $graduate->student->nisn ?? '-' }}</small>
                                        </td>
                                        <td>
                                            <strong>{{ $graduate->student->name ?? 'N/A' }}</strong><br>
                                            <small class="text-muted">{{ $graduate->student->classRoom->name ?? 'N/A' }}</small>
                                        </td>
                                        <td>{{ $graduate->graduation_year ?? '-' }}</td>
                                        <td>{{ $graduate->graduation_date ? \App\Helpers\DateHelper::formatIndonesian($graduate->graduation_date) : '-' }}</td>
                                        <td>
                                            @if($graduate->final_grade)
                                                <span class="badge bg-info">{{ number_format($graduate->final_grade, 2, ',', '.') }}</span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($graduate->achievements && is_array($graduate->achievements) && count($graduate->achievements) > 0)
                                                @foreach($graduate->achievements as $achievement)
                                                    @if($achievement == 'cum_laude')
                                                        <span class="badge bg-warning text-dark">Cum Laude</span>
                                                    @elseif($achievement == 'magna_laude')
                                                        <span class="badge bg-success">Magna Laude</span>
                                                    @elseif($achievement == 'summa_laude')
                                                        <span class="badge bg-primary">Summa Laude</span>
                                                    @else
                                                        <span class="badge bg-secondary">{{ ucfirst(str_replace('_', ' ', $achievement)) }}</span>
                                                    @endif
                                                @endforeach
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            <small class="text-muted">{{ $graduate->certificate_number ?? '-' }}</small>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm" role="group">
                                                <a href="{{ tenant_route('graduation.graduates.certificate', $graduate->id) }}" 
                                                   class="btn btn-outline-danger" 
                                                   title="Generate Sertifikat PDF"
                                                   data-bs-toggle="tooltip">
                                                    <i class="fas fa-certificate"></i>
                                                </a>
                                                <a href="{{ tenant_route('graduation.graduates.edit', $graduate->id) }}" 
                                                   class="btn btn-outline-warning" 
                                                   title="Edit"
                                                   data-bs-toggle="tooltip">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('graduation.graduates.destroy', $graduate->id) }}" 
                                                      method="POST" 
                                                      class="d-inline"
                                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus data lulusan ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" 
                                                            class="btn btn-outline-danger" 
                                                            title="Hapus"
                                                            data-bs-toggle="tooltip">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="9" class="text-center py-4">
                                            <div class="text-muted">
                                                <i class="fas fa-graduation-cap fa-3x mb-3"></i>
                                                <p class="mb-0">Belum ada data lulusan</p>
                                                <a href="{{ tenant_route('graduation.graduates.create') }}" class="btn btn-primary mt-2">
                                                    <i class="fas fa-plus me-1"></i>
                                                    Tambah Lulusan Pertama
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($graduates->hasPages())
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="text-muted">
                                Menampilkan {{ $graduates->firstItem() }} sampai {{ $graduates->lastItem() }} 
                                dari {{ $graduates->total() }} hasil
                            </div>
                            <div>
                                {{ $graduates->links() }}
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function searchGraduates() {
        const searchTerm = document.getElementById('searchInput').value;
        if (searchTerm) {
            window.location.href = "{{ tenant_route('graduation.graduates') }}?search=" + encodeURIComponent(searchTerm);
        } else {
            window.location.href = "{{ tenant_route('graduation.graduates') }}";
        }
    }

    // Allow Enter key to trigger search
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchGraduates();
        }
    });

    // Initialize tooltips
    document.addEventListener('DOMContentLoaded', function() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    });
</script>
@endpush
@endsection
