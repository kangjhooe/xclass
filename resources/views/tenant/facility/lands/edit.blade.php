@extends('layouts.tenant')

@section('title', 'Edit Lahan')
@section('page-title', 'Edit Lahan')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-edit me-2"></i>
                        Edit Lahan
                    </h5>
                </div>
                <div class="card-body">
                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <form action="{{ tenant_route('facility.lands.update', $land->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        
                        <!-- Field Utama -->
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nama Lahan <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                           id="name" name="name" value="{{ old('name', $land->name) }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" 
                                            id="status" name="status" required>
                                        <option value="active" {{ old('status', $land->status) == 'active' ? 'selected' : '' }}>Aktif</option>
                                        <option value="inactive" {{ old('status', $land->status) == 'inactive' ? 'selected' : '' }}>Tidak Aktif</option>
                                        <option value="maintenance" {{ old('status', $land->status) == 'maintenance' ? 'selected' : '' }}>Maintenance</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="area" class="form-label">Luas <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('area') is-invalid @enderror" 
                                           id="area" name="area" value="{{ old('area', $land->area) }}" step="0.01" min="0" required>
                                    @error('area')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="area_unit" class="form-label">Satuan <span class="text-danger">*</span></label>
                                    <select class="form-select @error('area_unit') is-invalid @enderror" 
                                            id="area_unit" name="area_unit" required>
                                        <option value="m2" {{ old('area_unit', $land->area_unit) == 'm2' ? 'selected' : '' }}>m²</option>
                                        <option value="hectare" {{ old('area_unit', $land->area_unit) == 'hectare' ? 'selected' : '' }}>Hektar</option>
                                    </select>
                                    @error('area_unit')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="location" class="form-label">Lokasi</label>
                                    <input type="text" class="form-control @error('location') is-invalid @enderror" 
                                           id="location" name="location" value="{{ old('location', $land->location) }}" placeholder="Opsional">
                                    @error('location')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Deskripsi</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" 
                                      id="description" name="description" rows="3" placeholder="Opsional">{{ old('description', $land->description) }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <!-- Detail Kepemilikan (Collapsible) -->
                        <div class="accordion mb-4" id="ownershipAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="ownershipHeading">
                                    <button class="accordion-button {{ old('ownership_type') || old('ownership_number') || old('purchase_date') || old('purchase_price') || $land->ownership_type || $land->ownership_number || $land->purchase_date || $land->purchase_price ? '' : 'collapsed' }}" 
                                            type="button" data-bs-toggle="collapse" 
                                            data-bs-target="#ownershipCollapse" aria-expanded="{{ old('ownership_type') || $land->ownership_type ? 'true' : 'false' }}" 
                                            aria-controls="ownershipCollapse">
                                        <i class="fas fa-file-contract me-2"></i>
                                        Informasi Kepemilikan (Opsional)
                                    </button>
                                </h2>
                                <div id="ownershipCollapse" class="accordion-collapse collapse {{ old('ownership_type') || old('ownership_number') || old('purchase_date') || old('purchase_price') || $land->ownership_type || $land->ownership_number || $land->purchase_date || $land->purchase_price ? 'show' : '' }}" 
                                     aria-labelledby="ownershipHeading" data-bs-parent="#ownershipAccordion">
                                    <div class="accordion-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="ownership_type" class="form-label">Jenis Kepemilikan</label>
                                                    <input type="text" class="form-control @error('ownership_type') is-invalid @enderror" 
                                                           id="ownership_type" name="ownership_type" value="{{ old('ownership_type', $land->ownership_type) }}" 
                                                           placeholder="Contoh: Sertifikat, HGB">
                                                    @error('ownership_type')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="ownership_number" class="form-label">Nomor Kepemilikan</label>
                                                    <input type="text" class="form-control @error('ownership_number') is-invalid @enderror" 
                                                           id="ownership_number" name="ownership_number" value="{{ old('ownership_number', $land->ownership_number) }}">
                                                    @error('ownership_number')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="purchase_date" class="form-label">Tanggal Pembelian</label>
                                                    <input type="date" class="form-control @error('purchase_date') is-invalid @enderror" 
                                                           id="purchase_date" name="purchase_date" value="{{ old('purchase_date', $land->purchase_date) }}">
                                                    @error('purchase_date')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="purchase_price" class="form-label">Harga Pembelian</label>
                                                    <input type="number" class="form-control @error('purchase_price') is-invalid @enderror" 
                                                           id="purchase_price" name="purchase_price" value="{{ old('purchase_price', $land->purchase_price) }}" 
                                                           step="0.01" min="0" placeholder="Dalam Rupiah">
                                                    @error('purchase_price')
                                                        <div class="invalid-feedback">{{ $message }}</div>
                                                    @enderror
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('facility.lands') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Kembali
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

