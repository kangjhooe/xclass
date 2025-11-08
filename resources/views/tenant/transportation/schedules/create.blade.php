@extends('layouts.tenant')

@section('title', 'Tambah Jadwal')
@section('page-title', 'Tambah Jadwal')

@push('styles')
<style>
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
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .form-control:focus, .form-select:focus {
        border-color: #22c55e;
        box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25);
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-plus-circle me-2"></i>
                    Form Tambah Jadwal
                </div>
                <div class="card-body">
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form action="{{ tenant_route('transportation.schedules.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="route_id" class="form-label">Rute <span class="text-danger">*</span></label>
                                    <select class="form-select @error('route_id') is-invalid @enderror" 
                                            id="route_id" name="route_id" required>
                                        <option value="">Pilih Rute</option>
                                        @foreach($routes as $route)
                                            <option value="{{ $route->id }}" {{ old('route_id') == $route->id ? 'selected' : '' }}>
                                                {{ $route->name }} ({{ $route->start_location }} - {{ $route->end_location }})
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('route_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="departure_time" class="form-label">Waktu Keberangkatan <span class="text-danger">*</span></label>
                                    <input type="datetime-local" class="form-control @error('departure_time') is-invalid @enderror" 
                                           id="departure_time" name="departure_time" value="{{ old('departure_time') }}" required>
                                    @error('departure_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="arrival_time" class="form-label">Waktu Kedatangan <span class="text-danger">*</span></label>
                                    <input type="datetime-local" class="form-control @error('arrival_time') is-invalid @enderror" 
                                           id="arrival_time" name="arrival_time" value="{{ old('arrival_time') }}" required>
                                    @error('arrival_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="driver_name" class="form-label">Nama Supir</label>
                                    <input type="text" class="form-control @error('driver_name') is-invalid @enderror" 
                                           id="driver_name" name="driver_name" value="{{ old('driver_name') }}">
                                    @error('driver_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="driver_phone" class="form-label">No. HP Supir</label>
                                    <input type="text" class="form-control @error('driver_phone') is-invalid @enderror" 
                                           id="driver_phone" name="driver_phone" value="{{ old('driver_phone') }}" 
                                           placeholder="08xxxxxxxxxx">
                                    @error('driver_phone')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="vehicle_number" class="form-label">Nomor Kendaraan</label>
                                    <input type="text" class="form-control @error('vehicle_number') is-invalid @enderror" 
                                           id="vehicle_number" name="vehicle_number" value="{{ old('vehicle_number') }}" 
                                           placeholder="B 1234 ABC">
                                    @error('vehicle_number')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="capacity" class="form-label">Kapasitas Penumpang</label>
                                    <input type="number" class="form-control @error('capacity') is-invalid @enderror" 
                                           id="capacity" name="capacity" value="{{ old('capacity') }}" 
                                           min="1" placeholder="0">
                                    @error('capacity')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="price" class="form-label">Harga (Rp)</label>
                                    <input type="number" class="form-control @error('price') is-invalid @enderror" 
                                           id="price" name="price" value="{{ old('price') }}" 
                                           min="0" step="1000" placeholder="0">
                                    @error('price')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" 
                                      id="notes" name="notes" rows="4" 
                                      placeholder="Catatan tambahan tentang jadwal transportasi">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('transportation.schedules') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
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
