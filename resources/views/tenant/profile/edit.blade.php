@extends('layouts.tenant')

@section('title', 'Edit Profil Tenant')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-edit"></i> Edit Profil Tenant
                    </h3>
                </div>
                <div class="card-body">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success') }}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    @endif

                    @if($errors->any())
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <ul class="mb-0">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    @endif

                    <form action="{{ tenant_route('tenant.profile.update') }}" method="POST">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="name">Nama Instansi <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                           id="name" name="name" value="{{ old('name', $tenant->name) }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="npsn">NPSN</label>
                                    <input type="text" class="form-control" id="npsn" value="{{ $tenant->npsn }}" readonly>
                                    <small class="form-text text-muted">NPSN tidak dapat diubah</small>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="type_tenant">Jenis Instansi <span class="text-danger">*</span></label>
                                    <select class="form-control @error('type_tenant') is-invalid @enderror" 
                                            id="type_tenant" name="type_tenant" required>
                                        <option value="">Pilih Jenis Instansi</option>
                                        <option value="Sekolah Umum" {{ old('type_tenant', $tenant->type_tenant) == 'Sekolah Umum' ? 'selected' : '' }}>
                                            Sekolah Umum
                                        </option>
                                        <option value="Madrasah" {{ old('type_tenant', $tenant->type_tenant) == 'Madrasah' ? 'selected' : '' }}>
                                            Madrasah
                                        </option>
                                    </select>
                                    @error('type_tenant')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="jenjang">Jenjang Pendidikan <span class="text-danger">*</span></label>
                                    <select class="form-control @error('jenjang') is-invalid @enderror" 
                                            id="jenjang" name="jenjang" required>
                                        <option value="">Pilih Jenjang</option>
                                        <option value="SD" {{ old('jenjang', $tenant->jenjang) == 'SD' ? 'selected' : '' }}>SD</option>
                                        <option value="MI" {{ old('jenjang', $tenant->jenjang) == 'MI' ? 'selected' : '' }}>MI</option>
                                        <option value="SMP" {{ old('jenjang', $tenant->jenjang) == 'SMP' ? 'selected' : '' }}>SMP</option>
                                        <option value="MTs" {{ old('jenjang', $tenant->jenjang) == 'MTs' ? 'selected' : '' }}>MTs</option>
                                        <option value="SMA" {{ old('jenjang', $tenant->jenjang) == 'SMA' ? 'selected' : '' }}>SMA</option>
                                        <option value="MA" {{ old('jenjang', $tenant->jenjang) == 'MA' ? 'selected' : '' }}>MA</option>
                                        <option value="SMK" {{ old('jenjang', $tenant->jenjang) == 'SMK' ? 'selected' : '' }}>SMK</option>
                                        <option value="Lainnya" {{ old('jenjang', $tenant->jenjang) == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                    </select>
                                    @error('jenjang')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="email">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                           id="email" name="email" value="{{ old('email', $tenant->email) }}" required>
                                    @error('email')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="phone">Telepon</label>
                                    <input type="text" class="form-control @error('phone') is-invalid @enderror" 
                                           id="phone" name="phone" value="{{ old('phone', $tenant->phone) }}">
                                    @error('phone')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="address">Alamat</label>
                            <textarea class="form-control @error('address') is-invalid @enderror" 
                                      id="address" name="address" rows="3">{{ old('address', $tenant->address) }}</textarea>
                            @error('address')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="city">Kota</label>
                                    <input type="text" class="form-control @error('city') is-invalid @enderror" 
                                           id="city" name="city" value="{{ old('city', $tenant->city) }}">
                                    @error('city')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="province">Provinsi</label>
                                    <input type="text" class="form-control @error('province') is-invalid @enderror" 
                                           id="province" name="province" value="{{ old('province', $tenant->province) }}">
                                    @error('province')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="postal_code">Kode Pos</label>
                                    <input type="text" class="form-control @error('postal_code') is-invalid @enderror" 
                                           id="postal_code" name="postal_code" value="{{ old('postal_code', $tenant->postal_code) }}">
                                    @error('postal_code')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="website">Website</label>
                            <input type="url" class="form-control @error('website') is-invalid @enderror" 
                                   id="website" name="website" value="{{ old('website', $tenant->website) }}">
                            @error('website')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Simpan Perubahan
                            </button>
                            <a href="{{ tenant_route('tenant.dashboard') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left"></i> Kembali
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
