@extends('layouts.tenant')

@section('title', 'Tambah Sesi Konseling')
@section('page-title', 'Tambah Sesi Konseling')

@push('styles')
<style>
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        padding: 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
    }
    
    .page-header h2 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .form-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        backdrop-filter: blur(10px);
        transition: all 0.4s ease;
    }
    
    .form-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .form-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        font-weight: 700;
        color: #374151;
        margin-bottom: 0.75rem;
        font-size: 0.95rem;
        letter-spacing: 0.3px;
    }
    
    .form-label .text-danger {
        color: #ef4444 !important;
        font-weight: 800;
    }
    
    .form-control, .form-select {
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        padding: 0.875rem 1.25rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-size: 0.95rem;
        background: white;
    }
    
    .form-control:focus, .form-select:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
        background: white;
    }
    
    .form-control::placeholder, textarea::placeholder {
        color: #9ca3af;
        font-style: italic;
    }
    
    textarea.form-control {
        min-height: 120px;
        resize: vertical;
    }
    
    .btn-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.875rem 2rem;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        position: relative;
        overflow: hidden;
    }
    
    .btn-gradient::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    .btn-gradient:hover::before {
        width: 300px;
        height: 300px;
    }
    
    .btn-gradient:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        color: white;
    }
    
    .btn-gradient:active {
        transform: translateY(-1px) scale(1.02);
    }
    
    .btn-secondary {
        border-radius: 12px;
        padding: 0.875rem 2rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }
    
    .card-body {
        padding: 2rem;
    }
    
    .card-footer {
        border-top: 2px solid #f3f4f6;
        padding: 1.5rem 2rem;
    }
    
    /* Form Section */
    .form-section {
        background: rgba(102, 126, 234, 0.02);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border-left: 4px solid #667eea;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Page Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="page-header">
                <h2 class="mb-0" style="font-weight: 800; font-size: 2rem;">
                    <i class="fas fa-plus-circle me-2" style="color: #667eea;"></i>
                    Tambah Sesi Konseling
                </h2>
                <p class="text-muted mb-0 mt-2" style="font-size: 1.05rem;">Buat sesi konseling baru untuk siswa</p>
            </div>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="form-card">
                <div class="form-card-header">
                    <i class="fas fa-clipboard-list me-2"></i>
                    Form Tambah Sesi Konseling
                </div>
                <form action="{{ tenant_route('counseling.sessions.store') }}" method="POST">
                    @csrf
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="student_id" class="form-label">
                                    Siswa <span class="text-danger">*</span>
                                </label>
                                <select name="student_id" id="student_id" class="form-select @error('student_id') is-invalid @enderror" required>
                                    <option value="">Pilih Siswa</option>
                                    @forelse($students as $student)
                                        <option value="{{ $student->id }}" {{ old('student_id') == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }} - {{ $student->student_number ?? 'N/A' }} 
                                            @if($student->classRoom)
                                                ({{ $student->classRoom->name }})
                                            @elseif($student->class)
                                                ({{ $student->class->name }})
                                            @endif
                                        </option>
                                    @empty
                                        <option value="" disabled>Belum ada data siswa</option>
                                    @endforelse
                                </select>
                                @if($students->isEmpty())
                                    <div class="alert alert-warning mt-2">
                                        <i class="fas fa-exclamation-triangle me-1"></i>
                                        Belum ada data siswa. Silakan tambahkan data siswa terlebih dahulu.
                                    </div>
                                @endif
                                @error('student_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="counselor_id" class="form-label">
                                    Konselor <span class="text-danger">*</span>
                                </label>
                                <select name="counselor_id" id="counselor_id" class="form-select @error('counselor_id') is-invalid @enderror" required>
                                    <option value="">Pilih Konselor</option>
                                    @foreach($counselors as $counselor)
                                        <option value="{{ $counselor->id }}" {{ old('counselor_id') == $counselor->id ? 'selected' : '' }}>
                                            {{ $counselor->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('counselor_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="session_date" class="form-label">
                                    Tanggal Sesi <span class="text-danger">*</span>
                                </label>
                                <input type="date" name="session_date" id="session_date" 
                                       class="form-control @error('session_date') is-invalid @enderror" 
                                       value="{{ old('session_date', date('Y-m-d')) }}" required>
                                @error('session_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="confidentiality_level" class="form-label">Tingkat Kerahasiaan</label>
                                <select name="confidentiality_level" id="confidentiality_level" class="form-select">
                                    <option value="low" {{ old('confidentiality_level', 'medium') == 'low' ? 'selected' : '' }}>Rendah</option>
                                    <option value="medium" {{ old('confidentiality_level', 'medium') == 'medium' ? 'selected' : '' }}>Sedang</option>
                                    <option value="high" {{ old('confidentiality_level') == 'high' ? 'selected' : '' }}>Tinggi</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="session_type" class="form-label">
                                    Jenis Sesi <span class="text-danger">*</span>
                                </label>
                                <select name="session_type" id="session_type" class="form-select @error('session_type') is-invalid @enderror" required>
                                    <option value="">Pilih Jenis Sesi</option>
                                    <option value="individual" {{ old('session_type') == 'individual' ? 'selected' : '' }}>Individual</option>
                                    <option value="group" {{ old('session_type') == 'group' ? 'selected' : '' }}>Kelompok</option>
                                    <option value="family" {{ old('session_type') == 'family' ? 'selected' : '' }}>Keluarga</option>
                                    <option value="crisis" {{ old('session_type') == 'crisis' ? 'selected' : '' }}>Krisis</option>
                                </select>
                                @error('session_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="category" class="form-label">
                                    Kategori Masalah <span class="text-danger">*</span>
                                </label>
                                <select name="category" id="category" class="form-select @error('category') is-invalid @enderror" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="academic" {{ old('category') == 'academic' ? 'selected' : '' }}>Akademik</option>
                                    <option value="behavioral" {{ old('category') == 'behavioral' ? 'selected' : '' }}>Perilaku</option>
                                    <option value="emotional" {{ old('category') == 'emotional' ? 'selected' : '' }}>Emosional</option>
                                    <option value="social" {{ old('category') == 'social' ? 'selected' : '' }}>Sosial</option>
                                    <option value="career" {{ old('category') == 'career' ? 'selected' : '' }}>Karir</option>
                                    <option value="personal" {{ old('category') == 'personal' ? 'selected' : '' }}>Personal</option>
                                </select>
                                @error('category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="status" class="form-label">Status</label>
                                <select name="status" id="status" class="form-select @error('status') is-invalid @enderror">
                                    <option value="scheduled" {{ old('status', 'scheduled') == 'scheduled' ? 'selected' : '' }}>Terjadwal</option>
                                    <option value="in_progress" {{ old('status') == 'in_progress' ? 'selected' : '' }}>Sedang Berlangsung</option>
                                    <option value="completed" {{ old('status') == 'completed' ? 'selected' : '' }}>Selesai</option>
                                    <option value="cancelled" {{ old('status') == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                    <option value="no_show" {{ old('status') == 'no_show' ? 'selected' : '' }}>Tidak Hadir</option>
                                </select>
                                @error('status')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="confidentiality_level" class="form-label">Tingkat Kerahasiaan</label>
                                <select name="confidentiality_level" id="confidentiality_level" class="form-select">
                                    <option value="low" {{ old('confidentiality_level', 'medium') == 'low' ? 'selected' : '' }}>Rendah</option>
                                    <option value="medium" {{ old('confidentiality_level', 'medium') == 'medium' ? 'selected' : '' }}>Sedang</option>
                                    <option value="high" {{ old('confidentiality_level') == 'high' ? 'selected' : '' }}>Tinggi</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="title" class="form-label">Judul Sesi</label>
                            <input type="text" name="title" id="title" 
                                   class="form-control @error('title') is-invalid @enderror" 
                                   value="{{ old('title') }}" 
                                   placeholder="Masukkan judul sesi konseling">
                            @error('title')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">
                                Deskripsi Masalah <span class="text-danger">*</span>
                            </label>
                            <textarea name="description" id="description" 
                                      class="form-control @error('description') is-invalid @enderror" 
                                      rows="4" 
                                      placeholder="Jelaskan masalah yang dialami siswa" 
                                      required>{{ old('description') }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="goals" class="form-label">Tujuan Konseling</label>
                            <textarea name="goals" id="goals" 
                                      class="form-control @error('goals') is-invalid @enderror" 
                                      rows="3" 
                                      placeholder="Tentukan tujuan yang ingin dicapai melalui konseling (opsional)">{{ old('goals') }}</textarea>
                            @error('goals')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan Tambahan</label>
                            <textarea name="notes" id="notes" 
                                      class="form-control @error('notes') is-invalid @enderror" 
                                      rows="3" 
                                      placeholder="Catatan tambahan (opsional)">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="card-footer bg-white p-4">
                        <div class="d-flex justify-content-between">
                            <a href="{{ tenant_route('counseling.sessions') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                            <button type="submit" class="btn-gradient">
                                <i class="fas fa-save me-1"></i>
                                Simpan Sesi
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
