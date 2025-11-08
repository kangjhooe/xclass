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
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createPlanModal">
                        <i class="fas fa-plus me-1"></i> Buat Rencana Pembelajaran
                    </button>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <select name="class_id" class="form-select">
                            <option value="">Semua Kelas</option>
                            @foreach($classes ?? [] as $class)
                                <option value="{{ $class->id }}" {{ request('class_id') == $class->id ? 'selected' : '' }}>
                                    {{ $class->name }}
                                </option>
                            @endforeach
                        </select>
                        <select name="subject_id" class="form-select">
                            <option value="">Semua Mata Pelajaran</option>
                            @foreach($subjects ?? [] as $subject)
                                <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                    {{ $subject->name }}
                                </option>
                            @endforeach
                        </select>
                        <input type="date" name="date" class="form-control" value="{{ request('date') }}">
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Lesson Plans Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-book me-2"></i>Rencana Pembelajaran
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Kelas</th>
                            <th>Mata Pelajaran</th>
                            <th>Topik</th>
                            <th>Tujuan</th>
                            <th>Aktivitas</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($plans as $plan)
                        <tr>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($plan->lesson_date ?? now()) }}</td>
                            <td>{{ $plan->class_name ?? '-' }}</td>
                            <td>{{ $plan->subject_name ?? '-' }}</td>
                            <td><strong>{{ $plan->topic ?? '-' }}</strong></td>
                            <td>{{ Str::limit($plan->objectives ?? '-', 50) }}</td>
                            <td>{{ Str::limit($plan->activities ?? '-', 50) }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada rencana pembelajaran</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($plans->hasPages())
        <div class="card-footer bg-white">
            {{ $plans->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Create Plan Modal -->
<div class="modal fade" id="createPlanModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="fas fa-plus me-2"></i>Buat Rencana Pembelajaran
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.academic.create-lesson-plan') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                            <select name="subject_id" class="form-select" required>
                                <option value="">Pilih Mata Pelajaran</option>
                                @foreach($subjects ?? [] as $subject)
                                    <option value="{{ $subject->id }}">{{ $subject->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Kelas <span class="text-danger">*</span></label>
                            <select name="class_id" class="form-select" required>
                                <option value="">Pilih Kelas</option>
                                @foreach($classes ?? [] as $class)
                                    <option value="{{ $class->id }}">{{ $class->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tanggal Pembelajaran <span class="text-danger">*</span></label>
                            <input type="date" name="lesson_date" class="form-control" required>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Topik <span class="text-danger">*</span></label>
                            <input type="text" name="topic" class="form-control" required>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Tujuan Pembelajaran <span class="text-danger">*</span></label>
                            <textarea name="objectives" class="form-control" rows="3" required></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Materi</label>
                            <textarea name="materials" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Aktivitas <span class="text-danger">*</span></label>
                            <textarea name="activities" class="form-control" rows="3" required></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Penilaian</label>
                            <textarea name="assessment" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">Tugas Rumah</label>
                            <textarea name="homework" class="form-control" rows="2"></textarea>
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

