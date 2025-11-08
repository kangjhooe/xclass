@extends('layouts.tenant')

@section('title', 'Rekam Medis')
@section('page-title', 'Rekam Medis')

@push('styles')
<style>
    /* Modern Card Styles */
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    /* Table Styles */
    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
    }
    
    .table-modern thead th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        padding: 1rem;
        border: none;
        border-bottom: 2px solid #e9ecef;
    }
    
    .table-modern tbody tr {
        transition: all 0.2s ease;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9fa;
        transform: scale(1.01);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .table-modern tbody td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
    }
    
    /* Filter Card */
    .filter-card {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        border: none;
    }
    
    .quick-action-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quick-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        color: white;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Header Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">
                    <i class="fas fa-file-medical me-2 text-success"></i>
                    Daftar Rekam Medis
                </h4>
                <a href="{{ tenant_route('health.records.create') }}" class="quick-action-btn">
                    <i class="fas fa-plus"></i>
                    Tambah Rekam Medis
                </a>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="modern-card">
                <div class="card-body">
                    <form method="GET" action="{{ tenant_route('health.records') }}" class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Cari</label>
                            <input type="text" name="search" class="form-control" 
                                   placeholder="Nama atau NIS siswa..." 
                                   value="{{ request('search') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Siswa</label>
                            <select name="student_id" class="form-select">
                                <option value="">Semua Siswa</option>
                                @foreach($students as $student)
                                    <option value="{{ $student->id }}" {{ request('student_id') == $student->id ? 'selected' : '' }}>
                                        {{ $student->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Status Kesehatan</label>
                            <select name="health_status" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="healthy" {{ request('health_status') == 'healthy' ? 'selected' : '' }}>Sehat</option>
                                <option value="sick" {{ request('health_status') == 'sick' ? 'selected' : '' }}>Sakit</option>
                                <option value="recovering" {{ request('health_status') == 'recovering' ? 'selected' : '' }}>Pulih</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Tanggal Mulai</label>
                            <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Tanggal Akhir</label>
                            <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}">
                        </div>
                        <div class="col-md-1 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Records Table -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-list me-2"></i>
                    Data Rekam Medis
                </div>
                <div class="card-body p-0">
                    @if($records->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Siswa</th>
                                        <th>Kelas</th>
                                        <th>Gejala</th>
                                        <th>Diagnosis</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($records as $record)
                                    <tr>
                                        <td>{{ \App\Helpers\DateHelper::formatIndonesian($record->checkup_date) }}</td>
                                        <td>
                                            <div>
                                                <strong>{{ $record->student->name }}</strong><br>
                                                <small class="text-muted">{{ $record->student->student_number }}</small>
                                            </div>
                                        </td>
                                        <td>{{ $record->student->classRoom->name ?? 'N/A' }}</td>
                                        <td>
                                            @if($record->symptoms)
                                                <span class="text-truncate d-inline-block" style="max-width: 150px;" title="{{ $record->symptoms }}">
                                                    {{ Str::limit($record->symptoms, 30) }}
                                                </span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($record->diagnosis)
                                                <span class="text-truncate d-inline-block" style="max-width: 150px;" title="{{ $record->diagnosis }}">
                                                    {{ Str::limit($record->diagnosis, 30) }}
                                                </span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($record->health_status == 'healthy')
                                                <span class="badge bg-success">Sehat</span>
                                            @elseif($record->health_status == 'sick')
                                                <span class="badge bg-danger">Sakit</span>
                                            @elseif($record->health_status == 'recovering')
                                                <span class="badge bg-warning">Pulih</span>
                                            @else
                                                <span class="badge bg-secondary">{{ ucfirst($record->health_status) }}</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="{{ tenant_route('health.records.show', $record->id) }}" class="btn btn-sm btn-outline-info" title="Lihat Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('health.records.edit', $record->id) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('health.records.destroy', $record->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="card-footer bg-white border-top">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <small class="text-muted">
                                        Menampilkan {{ $records->firstItem() }} sampai {{ $records->lastItem() }} dari {{ $records->total() }} data
                                    </small>
                                </div>
                                <div>
                                    {{ $records->links() }}
                                </div>
                            </div>
                        </div>
                    @else
                        <div class="text-center p-4">
                            <i class="fas fa-heartbeat fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Belum ada data rekam medis</p>
                            <a href="{{ tenant_route('health.records.create') }}" class="quick-action-btn">
                                <i class="fas fa-plus"></i>
                                Tambah Rekam Medis Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

