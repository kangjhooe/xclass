@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $pageTitle)

@push('styles')
<style>
    .table-modern {
        border-radius: 12px;
        overflow: hidden;
    }
    
    .table-modern thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .table-modern thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createScheduledModal">
                <i class="fas fa-plus me-1"></i> Buat Laporan Terjadwal
            </button>
        </div>
    </div>

    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Laporan Terjadwal</h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Nama Laporan</th>
                            <th>Jadwal</th>
                            <th>Waktu</th>
                            <th>Penerima</th>
                            <th>Berikutnya</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($scheduledReports as $scheduled)
                        <tr>
                            <td><strong>{{ $scheduled->name ?? '-' }}</strong></td>
                            <td><span class="badge bg-info">{{ ucfirst($scheduled->schedule_type ?? '-') }}</span></td>
                            <td>{{ $scheduled->schedule_time ?? '-' }}</td>
                            <td>{{ count(json_decode($scheduled->recipient_emails ?? '[]')) }} email</td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($scheduled->next_run ?? now(), true) }}</td>
                            <td>
                                @if($scheduled->is_active)
                                    <span class="badge bg-success">Aktif</span>
                                @else
                                    <span class="badge bg-secondary">Tidak Aktif</span>
                                @endif
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada laporan terjadwal</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($scheduledReports->hasPages())
        <div class="card-footer bg-white">
            {{ $scheduledReports->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Create Scheduled Modal -->
<div class="modal fade" id="createScheduledModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-plus me-2"></i>Buat Laporan Terjadwal</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.report.create-scheduled-report') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Laporan <span class="text-danger">*</span></label>
                        <select name="report_id" class="form-select" required>
                            <option value="">Pilih Laporan</option>
                            <!-- Options will be populated from custom reports -->
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Jenis Jadwal <span class="text-danger">*</span></label>
                            <select name="schedule_type" class="form-select" required>
                                <option value="daily">Harian</option>
                                <option value="weekly">Mingguan</option>
                                <option value="monthly">Bulanan</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Waktu <span class="text-danger">*</span></label>
                            <input type="time" name="schedule_time" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Hari (untuk Mingguan)</label>
                            <input type="number" name="schedule_day" class="form-control" min="1" max="31">
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Email Penerima <span class="text-danger">*</span></label>
                            <input type="email" name="recipient_emails[]" class="form-control mb-2" required>
                            <input type="email" name="recipient_emails[]" class="form-control mb-2">
                            <input type="email" name="recipient_emails[]" class="form-control mb-2">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i> Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

