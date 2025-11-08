@extends('layouts.tenant')

@section('title', 'Edit Mata Pelajaran')
@section('page-title', 'Edit Mata Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Edit Mata Pelajaran: {{ $subject->name }}
            </h2>
            <p>Ubah informasi mata pelajaran</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.subjects.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-edit me-2 text-primary"></i>
                    Form Edit Mata Pelajaran
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.subjects.update', $subject) }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name" class="form-label">Nama Mata Pelajaran <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                       id="name" name="name" value="{{ old('name', $subject->name) }}" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="code" class="form-label">Kode Mata Pelajaran <span class="text-danger">*</span></label>
                                <input type="text" class="form-control @error('code') is-invalid @enderror" 
                                       id="code" name="code" value="{{ old('code', $subject->code) }}" required>
                                @error('code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="description" class="form-label">Deskripsi</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" 
                                  id="description" name="description" rows="3">{{ old('description', $subject->description) }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="credits" class="form-label">Jumlah SKS <span class="text-danger">*</span></label>
                                <input type="number" class="form-control @error('credits') is-invalid @enderror" 
                                       id="credits" name="credits" value="{{ old('credits', $subject->credits) }}" 
                                       min="1" max="10" required>
                                @error('credits')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="level" class="form-label">Level</label>
                                <select class="form-control @error('level') is-invalid @enderror" 
                                        id="level" name="level">
                                    <option value="">Pilih Level</option>
                                    <option value="SD" {{ old('level', $subject->level) == 'SD' ? 'selected' : '' }}>SD</option>
                                    <option value="SMP" {{ old('level', $subject->level) == 'SMP' ? 'selected' : '' }}>SMP</option>
                                    <option value="SMA" {{ old('level', $subject->level) == 'SMA' ? 'selected' : '' }}>SMA</option>
                                </select>
                                @error('level')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label for="category" class="form-label">Kategori</label>
                                <select class="form-control @error('category') is-invalid @enderror" 
                                        id="category" name="category">
                                    <option value="">Pilih Kategori</option>
                                    <option value="Umum" {{ old('category', $subject->category) == 'Umum' ? 'selected' : '' }}>Umum</option>
                                    <option value="Kejuruan" {{ old('category', $subject->category) == 'Kejuruan' ? 'selected' : '' }}>Kejuruan</option>
                                    <option value="Pilihan" {{ old('category', $subject->category) == 'Pilihan' ? 'selected' : '' }}>Pilihan</option>
                                </select>
                                @error('category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="is_active" name="is_active" 
                                   value="1" {{ old('is_active', $subject->is_active) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_active">
                                Mata pelajaran aktif
                            </label>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Update
                        </button>
                        <a href="{{ tenant_route('tenant.subjects.index') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="card-title mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi Mata Pelajaran
                </h6>
            </div>
            <div class="card-body">
                <p class="text-muted">
                    <strong>Dibuat:</strong> {{ $subject->created_at->format('d M Y H:i') }}
                </p>
                <p class="text-muted">
                    <strong>Diperbarui:</strong> {{ $subject->updated_at->format('d M Y H:i') }}
                </p>
                <p class="text-muted">
                    <strong>Status:</strong> 
                    <span class="badge bg-{{ $subject->is_active ? 'success' : 'secondary' }}">
                        {{ $subject->is_active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</div>
@endsection
