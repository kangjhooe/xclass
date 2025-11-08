@extends('layouts.tenant')

@section('title', 'Edit Tindakan Disiplin')
@section('page-title', 'Edit Tindakan Disiplin')

@push('styles')
<style>
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
        padding: 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
    }
    
    .page-header h2 {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
    }
    
    .form-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
        backdrop-filter: blur(10px);
    }
    
    .form-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .form-card-header {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 1.5rem 2rem;
        border: none;
        font-weight: 700;
        font-size: 1.125rem;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
    }
    
    .form-card-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .form-card:hover .form-card-header::before {
        left: 100%;
    }
    
    .form-label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        letter-spacing: 0.3px;
    }
    
    .form-control, .form-select {
        border-radius: 10px;
        border: 2px solid #e5e7eb;
        padding: 0.875rem 1.25rem;
        transition: all 0.3s ease;
        font-size: 0.95rem;
    }
    
    .form-control:focus, .form-select:focus {
        border-color: #ef4444;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        outline: none;
    }
    
    .form-control::placeholder {
        color: #9ca3af;
    }
    
    .btn-gradient {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.875rem 1.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }
    
    .btn-gradient:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        color: white;
    }
    
    .btn-secondary-modern {
        border-radius: 12px;
        padding: 0.875rem 1.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .btn-secondary-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Page Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="page-header">
                <h2 class="mb-2">
                    <i class="fas fa-edit me-2"></i>
                    Edit Tindakan Disiplin
                </h2>
                <p class="text-muted mb-0">Perbarui informasi tindakan disiplin di bawah ini</p>
            </div>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="form-card">
                <div class="form-card-header">
                    <i class="fas fa-file-alt me-2"></i>
                    Form Edit Tindakan Disiplin
                </div>
                <form action="{{ tenant_route('discipline.actions.update', $action->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="student_id" class="form-label">
                                    Siswa <span class="text-danger">*</span>
                                </label>
                                <select name="student_id" id="student_id" class="form-select @error('student_id') is-invalid @enderror" required>
                                    <option value="">Pilih Siswa</option>
                                    @foreach($students as $student)
                                        <option value="{{ $student->id }}" {{ old('student_id', $action->student_id) == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }} - {{ $student->student_number ?? 'N/A' }} 
                                            @if($student->classRoom)
                                                ({{ $student->classRoom->name }})
                                            @elseif($student->class)
                                                ({{ $student->class->name }})
                                            @endif
                                        </option>
                                    @endforeach
                                </select>
                                @error('student_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="reported_by" class="form-label">
                                    Dilaporkan Oleh <span class="text-danger">*</span>
                                </label>
                                <select name="reported_by" id="reported_by" class="form-select @error('reported_by') is-invalid @enderror" required>
                                    <option value="">Pilih Petugas</option>
                                    @foreach($users as $user)
                                        <option value="{{ $user->id }}" {{ old('reported_by', $action->reported_by) == $user->id ? 'selected' : '' }}>
                                            {{ $user->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('reported_by')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="violation_date" class="form-label">
                                    Tanggal Pelanggaran <span class="text-danger">*</span>
                                </label>
                                <input type="date" name="violation_date" id="violation_date" 
                                       class="form-control @error('violation_date') is-invalid @enderror" 
                                       value="{{ old('violation_date', $action->violation_date ? $action->violation_date->format('Y-m-d') : '') }}" required>
                                @error('violation_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="violation_type" class="form-label">
                                    Jenis Pelanggaran <span class="text-danger">*</span>
                                </label>
                                <select name="violation_type" id="violation_type" class="form-select @error('violation_type') is-invalid @enderror" required>
                                    <option value="">Pilih Jenis Pelanggaran</option>
                                    <option value="minor" {{ old('violation_type', $action->violation_type) == 'minor' ? 'selected' : '' }}>Ringan</option>
                                    <option value="moderate" {{ old('violation_type', $action->violation_type) == 'moderate' ? 'selected' : '' }}>Sedang</option>
                                    <option value="major" {{ old('violation_type', $action->violation_type) == 'major' ? 'selected' : '' }}>Berat</option>
                                    <option value="severe" {{ old('violation_type', $action->violation_type) == 'severe' ? 'selected' : '' }}>Sangat Berat</option>
                                </select>
                                @error('violation_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="violation_category" class="form-label">
                                    Kategori Pelanggaran <span class="text-danger">*</span>
                                </label>
                                <select name="violation_category" id="violation_category" class="form-select @error('violation_category') is-invalid @enderror" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="academic" {{ old('violation_category', $action->violation_category) == 'academic' ? 'selected' : '' }}>Akademik</option>
                                    <option value="behavior" {{ old('violation_category', $action->violation_category) == 'behavior' ? 'selected' : '' }}>Perilaku</option>
                                    <option value="attendance" {{ old('violation_category', $action->violation_category) == 'attendance' ? 'selected' : '' }}>Kehadiran</option>
                                    <option value="dress_code" {{ old('violation_category', $action->violation_category) == 'dress_code' ? 'selected' : '' }}>Seragam</option>
                                    <option value="safety" {{ old('violation_category', $action->violation_category) == 'safety' ? 'selected' : '' }}>Keamanan</option>
                                    <option value="other" {{ old('violation_category', $action->violation_category) == 'other' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('violation_category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="severity_level" class="form-label">
                                    Tingkat Keparahan <span class="text-danger">*</span>
                                </label>
                                <select name="severity_level" id="severity_level" class="form-select @error('severity_level') is-invalid @enderror" required>
                                    <option value="">Pilih Tingkat Keparahan</option>
                                    <option value="low" {{ old('severity_level', $action->severity_level) == 'low' ? 'selected' : '' }}>Rendah</option>
                                    <option value="medium" {{ old('severity_level', $action->severity_level) == 'medium' ? 'selected' : '' }}>Sedang</option>
                                    <option value="high" {{ old('severity_level', $action->severity_level) == 'high' ? 'selected' : '' }}>Tinggi</option>
                                    <option value="critical" {{ old('severity_level', $action->severity_level) == 'critical' ? 'selected' : '' }}>Kritis</option>
                                </select>
                                @error('severity_level')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="sanction_type" class="form-label">
                                    Jenis Tindakan <span class="text-danger">*</span>
                                </label>
                                <select name="sanction_type" id="sanction_type" class="form-select @error('sanction_type') is-invalid @enderror" required>
                                    <option value="">Pilih Jenis Tindakan</option>
                                    <option value="warning" {{ old('sanction_type', $action->sanction_type) == 'warning' ? 'selected' : '' }}>Peringatan</option>
                                    <option value="reprimand" {{ old('sanction_type', $action->sanction_type) == 'reprimand' ? 'selected' : '' }}>Teguran</option>
                                    <option value="detention" {{ old('sanction_type', $action->sanction_type) == 'detention' ? 'selected' : '' }}>Hukuman</option>
                                    <option value="suspension" {{ old('sanction_type', $action->sanction_type) == 'suspension' ? 'selected' : '' }}>Skorsing</option>
                                    <option value="expulsion" {{ old('sanction_type', $action->sanction_type) == 'expulsion' ? 'selected' : '' }}>Dikeluarkan</option>
                                    <option value="community_service" {{ old('sanction_type', $action->sanction_type) == 'community_service' ? 'selected' : '' }}>Layanan Masyarakat</option>
                                </select>
                                @error('sanction_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="status" class="form-label">Status</label>
                                <select name="status" id="status" class="form-select @error('status') is-invalid @enderror">
                                    <option value="pending" {{ old('status', $action->status) == 'pending' ? 'selected' : '' }}>Menunggu</option>
                                    <option value="approved" {{ old('status', $action->status) == 'approved' ? 'selected' : '' }}>Disetujui</option>
                                    <option value="active" {{ old('status', $action->status) == 'active' ? 'selected' : '' }}>Aktif</option>
                                    <option value="completed" {{ old('status', $action->status) == 'completed' ? 'selected' : '' }}>Selesai</option>
                                    <option value="cancelled" {{ old('status', $action->status) == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                </select>
                                @error('status')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">
                                Deskripsi Pelanggaran <span class="text-danger">*</span>
                            </label>
                            <textarea name="description" id="description" 
                                      class="form-control @error('description') is-invalid @enderror" 
                                      rows="4" 
                                      placeholder="Jelaskan detail pelanggaran yang dilakukan siswa" 
                                      required>{{ old('description', $action->description) }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="sanction_description" class="form-label">Deskripsi Tindakan</label>
                            <textarea name="sanction_description" id="sanction_description" 
                                      class="form-control @error('sanction_description') is-invalid @enderror" 
                                      rows="3" 
                                      placeholder="Jelaskan tindakan yang diberikan (opsional)">{{ old('sanction_description', $action->sanction_description) }}</textarea>
                            @error('sanction_description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan Tambahan</label>
                            <textarea name="notes" id="notes" 
                                      class="form-control @error('notes') is-invalid @enderror" 
                                      rows="3" 
                                      placeholder="Catatan tambahan (opsional)">{{ old('notes', $action->notes) }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="card-footer bg-white p-4" style="border-top: 1px solid #e9ecef;">
                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <a href="{{ tenant_route('discipline.actions') }}" class="btn btn-secondary btn-secondary-modern">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                            <button type="submit" class="btn-gradient">
                                <i class="fas fa-save me-1"></i>
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

