@extends('layouts.tenant')

@section('title', 'Tambah Ruangan')
@section('page-title', 'Tambah Ruangan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Tambah Ruangan Baru
                    </h5>
                </div>
                <div class="card-body">
                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <form action="{{ tenant_route('facility.rooms.store') }}" method="POST">
                        @csrf
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nama Ruangan <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                           id="name" name="name" value="{{ old('name') }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="building_id" class="form-label">Gedung <span class="text-danger">*</span></label>
                                    <select class="form-select @error('building_id') is-invalid @enderror" 
                                            id="building_id" name="building_id" required>
                                        <option value="">Pilih Gedung</option>
                                        @foreach($buildings as $building)
                                            <option value="{{ $building->id }}" {{ old('building_id') == $building->id ? 'selected' : '' }}>
                                                {{ $building->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('building_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="type" class="form-label">Jenis Ruangan <span class="text-danger">*</span></label>
                                    <select class="form-select @error('type') is-invalid @enderror" 
                                            id="type" name="type" required>
                                        <option value="">Pilih Jenis</option>
                                        <option value="classroom" {{ old('type') == 'classroom' ? 'selected' : '' }}>Kelas</option>
                                        <option value="office" {{ old('type') == 'office' ? 'selected' : '' }}>Kantor</option>
                                        <option value="library" {{ old('type') == 'library' ? 'selected' : '' }}>Perpustakaan</option>
                                        <option value="laboratory" {{ old('type') == 'laboratory' ? 'selected' : '' }}>Laboratorium</option>
                                        <option value="auditorium" {{ old('type') == 'auditorium' ? 'selected' : '' }}>Auditorium</option>
                                        <option value="other" {{ old('type') == 'other' ? 'selected' : '' }}>Lainnya</option>
                                    </select>
                                    @error('type')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="floor" class="form-label">Lantai <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('floor') is-invalid @enderror" 
                                           id="floor" name="floor" value="{{ old('floor') }}" min="0" required>
                                    @error('floor')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="capacity" class="form-label">Kapasitas <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('capacity') is-invalid @enderror" 
                                           id="capacity" name="capacity" value="{{ old('capacity') }}" min="1" required>
                                    @error('capacity')
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
                                           id="length" name="length" value="{{ old('length') }}" min="0" step="0.01" placeholder="0.00">
                                    @error('length')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="width" class="form-label">Lebar (m)</label>
                                    <input type="number" class="form-control @error('width') is-invalid @enderror" 
                                           id="width" name="width" value="{{ old('width') }}" min="0" step="0.01" placeholder="0.00">
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
                                        <option value="active" {{ old('status') == 'active' ? 'selected' : '' }}>Aktif</option>
                                        <option value="inactive" {{ old('status') == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                                        <option value="maintenance" {{ old('status') == 'maintenance' ? 'selected' : '' }}>Maintenance</option>
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
                            <a href="{{ tenant_route('facility.rooms') }}" class="btn btn-secondary">
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
