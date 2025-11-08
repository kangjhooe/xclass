@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $pageTitle)

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-file-alt me-3"></i>
                {{ $title }}
            </h2>
            <p>Kelola laporan kustom</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button type="button" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);" data-bs-toggle="modal" data-bs-target="#createReportModal">
                <i class="fas fa-plus me-2"></i> Buat Laporan Kustom
            </button>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-list me-2 text-primary"></i>
            Daftar Laporan Kustom
        </h5>
    </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Jenis</th>
                            <th>Deskripsi</th>
                            <th>Dibuat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($customReports as $report)
                        <tr>
                            <td><strong>{{ $report->name ?? '-' }}</strong></td>
                            <td><span class="badge bg-info">{{ ucfirst($report->report_type ?? '-') }}</span></td>
                            <td>{{ Str::limit($report->description ?? '-', 50) }}</td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($report->created_at ?? now()) }}</td>
                            <td>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-modern btn-primary btn-sm" title="Lihat">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-modern btn-success btn-sm" title="Download">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3" style="opacity: 0.3;"></i>
                                    <p class="text-muted">Belum ada laporan kustom</p>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($customReports->hasPages())
        <div class="card-footer">
            {{ $customReports->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Create Report Modal -->
<div class="modal fade" id="createReportModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Buat Laporan Kustom</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.report.create-custom-report') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Nama Laporan <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Jenis Laporan <span class="text-danger">*</span></label>
                        <select name="report_type" class="form-select" required>
                            <option value="academic">Akademik</option>
                            <option value="financial">Keuangan</option>
                            <option value="attendance">Absensi</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Deskripsi</label>
                        <textarea name="description" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Kolom <span class="text-danger">*</span></label>
                        <input type="text" name="columns[]" class="form-control mb-2" placeholder="Kolom 1" required>
                        <input type="text" name="columns[]" class="form-control mb-2" placeholder="Kolom 2">
                        <input type="text" name="columns[]" class="form-control mb-2" placeholder="Kolom 3">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-modern btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-modern btn-primary">
                        <i class="fas fa-save me-2"></i> Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

