@extends('layouts.tenant')

@section('title', 'Edit Data Tamu')
@section('page-title', 'Edit Data Buku Tamu')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-edit me-3"></i>
                Edit Data Tamu
            </h2>
            <p>Perbarui informasi tamu yang berkunjung</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.guest-book.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Edit Data Tamu
        </h5>
    </div>
    <form action="{{ tenant_route('tenant.guest-book.update', $guestBook) }}" method="POST">
        @csrf
        @method('PUT')
        <div class="card-body p-4">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="visitor_name">Nama Tamu <span class="text-danger">*</span></label>
                                <input type="text" name="visitor_name" id="visitor_name" 
                                       class="form-control @error('visitor_name') is-invalid @enderror" 
                                       value="{{ old('visitor_name', $guestBook->visitor_name) }}" placeholder="Masukkan nama tamu" required>
                                @error('visitor_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="visitor_phone">No. Telepon</label>
                                <input type="text" name="visitor_phone" id="visitor_phone" 
                                       class="form-control @error('visitor_phone') is-invalid @enderror" 
                                       value="{{ old('visitor_phone', $guestBook->visitor_phone) }}" placeholder="Masukkan nomor telepon">
                                @error('visitor_phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="visitor_email">Email</label>
                                <input type="email" name="visitor_email" id="visitor_email" 
                                       class="form-control @error('visitor_email') is-invalid @enderror" 
                                       value="{{ old('visitor_email', $guestBook->visitor_email) }}" placeholder="Masukkan email">
                                @error('visitor_email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="visitor_organization">Organisasi/Instansi</label>
                                <input type="text" name="visitor_organization" id="visitor_organization" 
                                       class="form-control @error('visitor_organization') is-invalid @enderror" 
                                       value="{{ old('visitor_organization', $guestBook->visitor_organization) }}" placeholder="Masukkan nama organisasi">
                                @error('visitor_organization')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="visitor_address">Alamat</label>
                        <textarea name="visitor_address" id="visitor_address" 
                                  class="form-control @error('visitor_address') is-invalid @enderror" 
                                  rows="2" placeholder="Masukkan alamat tamu">{{ old('visitor_address', $guestBook->visitor_address) }}</textarea>
                        @error('visitor_address')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="purpose">Tujuan Kunjungan <span class="text-danger">*</span></label>
                                <select name="purpose" id="purpose" 
                                        class="form-control @error('purpose') is-invalid @enderror" required>
                                    <option value="">Pilih Tujuan</option>
                                    @foreach((new \App\Models\Tenant\GuestBook())->getPurposeOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ old('purpose', $guestBook->purpose) == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('purpose')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="person_to_meet">Orang yang Ditemui</label>
                                <input type="text" name="person_to_meet" id="person_to_meet" 
                                       class="form-control @error('person_to_meet') is-invalid @enderror" 
                                       value="{{ old('person_to_meet', $guestBook->person_to_meet) }}" placeholder="Nama orang yang akan ditemui">
                                @error('person_to_meet')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="purpose_description">Deskripsi Tujuan</label>
                        <textarea name="purpose_description" id="purpose_description" 
                                  class="form-control @error('purpose_description') is-invalid @enderror" 
                                  rows="2" placeholder="Jelaskan tujuan kunjungan secara detail">{{ old('purpose_description', $guestBook->purpose_description) }}</textarea>
                        @error('purpose_description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="department">Departemen/Bagian</label>
                                <input type="text" name="department" id="department" 
                                       class="form-control @error('department') is-invalid @enderror" 
                                       value="{{ old('department', $guestBook->department) }}" placeholder="Departemen yang dituju">
                                @error('department')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="visit_date">Tanggal Kunjungan <span class="text-danger">*</span></label>
                                <input type="date" name="visit_date" id="visit_date" 
                                       class="form-control @error('visit_date') is-invalid @enderror" 
                                       value="{{ old('visit_date', $guestBook->visit_date->format('Y-m-d')) }}" required>
                                @error('visit_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="visit_time">Waktu Kunjungan <span class="text-danger">*</span></label>
                                <input type="time" name="visit_time" id="visit_time" 
                                       class="form-control @error('visit_time') is-invalid @enderror" 
                                       value="{{ old('visit_time', $guestBook->visit_time->format('H:i')) }}" required>
                                @error('visit_time')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="status">Status <span class="text-danger">*</span></label>
                                <select name="status" id="status" 
                                        class="form-control @error('status') is-invalid @enderror" required>
                                    @foreach((new \App\Models\Tenant\GuestBook())->getStatusOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ old('status', $guestBook->status) == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('status')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            @if($guestBook->check_in_time)
                            <div class="form-group">
                                <label>Waktu Check In</label>
                                <input type="text" class="form-control" value="{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->check_in_time, true) }}" readonly>
                            </div>
                            @endif
                        </div>
                    </div>

                    @if($guestBook->check_out_time)
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Waktu Check Out</label>
                                <input type="text" class="form-control" value="{{ \App\Helpers\DateHelper::formatIndonesian($guestBook->check_out_time, true) }}" readonly>
                            </div>
                        </div>
                    </div>
                    @endif

                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" 
                                  class="form-control @error('notes') is-invalid @enderror" 
                                  rows="3" placeholder="Catatan tambahan (opsional)">{{ old('notes', $guestBook->notes) }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer bg-light p-4">
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('tenant.guest-book.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-times me-2"></i> Batal
                        </a>
                        <button type="submit" class="btn btn-modern btn-primary">
                            <i class="fas fa-save me-2"></i> Simpan Perubahan
                        </button>
                    </div>
                </div>
            </form>
        </div>
@endsection
