@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $pageTitle)

@push('styles')
<style>
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
    }
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-card.primary::before { --card-color-1: #3b82f6; --card-color-2: #1d4ed8; }
    
    .rating-stars {
        color: #fbbf24;
        font-size: 1.2rem;
    }
    
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
    <!-- Actions & Filters -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createReviewModal">
                        <i class="fas fa-plus me-1"></i> Buat Performance Review
                    </button>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <select name="employee_id" class="form-select">
                            <option value="">Semua Karyawan</option>
                            @foreach($employees ?? [] as $employee)
                                <option value="{{ $employee->id }}" {{ request('employee_id') == $employee->id ? 'selected' : '' }}>
                                    {{ $employee->name }}
                                </option>
                            @endforeach
                        </select>
                        <input type="text" name="review_period" class="form-control" placeholder="Periode Review" value="{{ request('review_period') }}">
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Reviews Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-clipboard-list me-2"></i>Performance Reviews
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Nama Karyawan</th>
                            <th>NIK</th>
                            <th>Tanggal Review</th>
                            <th>Periode</th>
                            <th>Rating</th>
                            <th>Kekuatan</th>
                            <th>Kelemahan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($reviews as $review)
                        <tr>
                            <td><strong>{{ $review->employee_name ?? '-' }}</strong></td>
                            <td>{{ $review->employee_number ?? '-' }}</td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($review->review_date ?? now()) }}</td>
                            <td>{{ $review->review_period ?? '-' }}</td>
                            <td>
                                <div class="rating-stars">
                                    @for($i = 1; $i <= 5; $i++)
                                        <i class="fas fa-star{{ $i <= ($review->rating ?? 0) ? '' : '-o' }}"></i>
                                    @endfor
                                    <span class="ms-2 text-dark">{{ $review->rating ?? 0 }}/5</span>
                                </div>
                            </td>
                            <td>{{ Str::limit($review->strengths ?? '-', 50) }}</td>
                            <td>{{ Str::limit($review->weaknesses ?? '-', 50) }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" 
                                    data-bs-target="#viewReviewModal{{ $review->id ?? '' }}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada performance review</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($reviews->hasPages())
        <div class="card-footer bg-white">
            {{ $reviews->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Create Review Modal -->
<div class="modal fade" id="createReviewModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-plus me-2"></i>Buat Performance Review
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.hr.create-performance-review') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Karyawan <span class="text-danger">*</span></label>
                            <select name="employee_id" class="form-select" required>
                                <option value="">Pilih Karyawan</option>
                                @foreach($employees ?? [] as $employee)
                                    <option value="{{ $employee->id }}">{{ $employee->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tanggal Review <span class="text-danger">*</span></label>
                            <input type="date" name="review_date" class="form-control" value="{{ date('Y-m-d') }}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Periode Review <span class="text-danger">*</span></label>
                            <input type="text" name="review_period" class="form-control" placeholder="Contoh: Q1 2024" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Rating <span class="text-danger">*</span></label>
                            <select name="rating" class="form-select" required>
                                <option value="1">1 - Sangat Kurang</option>
                                <option value="2">2 - Kurang</option>
                                <option value="3">3 - Cukup</option>
                                <option value="4">4 - Baik</option>
                                <option value="5">5 - Sangat Baik</option>
                            </select>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Kekuatan <span class="text-danger">*</span></label>
                            <textarea name="strengths" class="form-control" rows="3" required></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Kelemahan</label>
                            <textarea name="weaknesses" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Tujuan/Goals</label>
                            <textarea name="goals" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Catatan</label>
                            <textarea name="notes" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

