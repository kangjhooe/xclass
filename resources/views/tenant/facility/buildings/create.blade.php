@extends('layouts.tenant')

@section('title', 'Tambah Gedung')
@section('page-title', 'Tambah Gedung')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Gedung Baru
                    </h5>
                </div>
                <div class="card-body">
                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <form action="{{ tenant_route('facility.buildings.store') }}" method="POST">
                        @csrf
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nama Gedung <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                           id="name" name="name" value="{{ old('name') }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="land_id" class="form-label">Lahan <span class="text-danger">*</span></label>
                                    <select class="form-select @error('land_id') is-invalid @enderror" 
                                            id="land_id" name="land_id" required>
                                        <option value="">Pilih Lahan</option>
                                        @foreach($lands as $land)
                                            <option value="{{ $land->id }}" {{ old('land_id') == $land->id ? 'selected' : '' }}>
                                                {{ $land->name }} 
                                                @if($land->location)
                                                    - {{ $land->location }}
                                                @endif
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="form-text">Pilih lahan tempat gedung ini berada</div>
                                    @error('land_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="floors" class="form-label">Jumlah Lantai <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('floors') is-invalid @enderror" 
                                           id="floors" name="floors" value="{{ old('floors') }}" min="1" required>
                                    @error('floors')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="built_year" class="form-label">Tahun Dibangun</label>
                                    <input type="number" class="form-control @error('built_year') is-invalid @enderror" 
                                           id="built_year" name="built_year" value="{{ old('built_year') }}" 
                                           min="1900" max="{{ date('Y') }}" placeholder="Contoh: 2020">
                                    @error('built_year')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="length" class="form-label">Panjang (m)</label>
                                    <input type="number" class="form-control @error('length') is-invalid @enderror" 
                                           id="length" name="length" value="{{ old('length') }}" 
                                           step="0.01" min="0" placeholder="0.00">
                                    @error('length')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="width" class="form-label">Lebar (m)</label>
                                    <input type="number" class="form-control @error('width') is-invalid @enderror" 
                                           id="width" name="width" value="{{ old('width') }}" 
                                           step="0.01" min="0" placeholder="0.00">
                                    @error('width')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" 
                                            id="status" name="status" required>
                                        <option value="">Pilih Status</option>
                                        <option value="baik" {{ old('status', 'baik') == 'baik' ? 'selected' : '' }}>Baik</option>
                                        <option value="rusak_ringan" {{ old('status') == 'rusak_ringan' ? 'selected' : '' }}>Rusak Ringan</option>
                                        <option value="rusak_berat" {{ old('status') == 'rusak_berat' ? 'selected' : '' }}>Rusak Berat</option>
                                        <option value="rusak_total" {{ old('status') == 'rusak_total' ? 'selected' : '' }}>Rusak Total</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Deskripsi</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" 
                                      id="description" name="description" rows="4">{{ old('description') }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('facility.buildings') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
