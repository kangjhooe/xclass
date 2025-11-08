@extends('layouts.tenant')

@section('title', 'Pesan Baru')
@section('page-title', 'Pesan Baru')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-edit me-3"></i>
                Pesan Baru
            </h2>
            <p>Kirim pesan baru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.messages.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Pesan Baru
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.messages.store') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label for="receiver_id" class="form-label fw-semibold">Penerima <span class="text-danger">*</span></label>
                <select name="receiver_id" id="receiver_id" class="form-select @error('receiver_id') is-invalid @enderror" required>
                    <option value="">Pilih Penerima</option>
                    @foreach($users as $user)
                        <option value="{{ $user->id }}" {{ old('receiver_id') == $user->id ? 'selected' : '' }}>
                            {{ $user->name }} ({{ $user->email }})
                        </option>
                    @endforeach
                </select>
                @error('receiver_id')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-4">
                <label for="subject" class="form-label fw-semibold">Subjek</label>
                <input type="text" name="subject" id="subject" class="form-control @error('subject') is-invalid @enderror" 
                       value="{{ old('subject') }}" placeholder="Subjek pesan (opsional)">
                @error('subject')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-4">
                <label for="content" class="form-label fw-semibold">Isi Pesan <span class="text-danger">*</span></label>
                <textarea name="content" id="content" class="form-control @error('content') is-invalid @enderror" rows="10" required>{{ old('content') }}</textarea>
                @error('content')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <label for="type" class="form-label fw-semibold">Tipe <span class="text-danger">*</span></label>
                    <select name="type" id="type" class="form-select @error('type') is-invalid @enderror" required>
                        <option value="direct" {{ old('type') == 'direct' ? 'selected' : '' }}>Direct</option>
                        <option value="group" {{ old('type') == 'group' ? 'selected' : '' }}>Group</option>
                        <option value="broadcast" {{ old('type') == 'broadcast' ? 'selected' : '' }}>Broadcast</option>
                    </select>
                    @error('type')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label for="priority" class="form-label fw-semibold">Prioritas <span class="text-danger">*</span></label>
                    <select name="priority" id="priority" class="form-select @error('priority') is-invalid @enderror" required>
                        <option value="low" {{ old('priority') == 'low' ? 'selected' : '' }}>Rendah</option>
                        <option value="medium" {{ old('priority') == 'medium' ? 'selected' : '' }}>Sedang</option>
                        <option value="high" {{ old('priority') == 'high' ? 'selected' : '' }}>Tinggi</option>
                        <option value="urgent" {{ old('priority') == 'urgent' ? 'selected' : '' }}>Urgent</option>
                    </select>
                    @error('priority')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-paper-plane me-2"></i>Kirim
                </button>
                <a href="{{ tenant_route('tenant.messages.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i>Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
