@extends('layouts.tenant')

@section('title', 'Edit Staf - ' . $nonTeachingStaff->name)
@section('page-title', 'Edit Staf')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">
                    <i class="fas fa-edit me-2"></i>
                    Form Edit Staf Non-Guru
                </h5>
            </div>
            <div class="card-body">
                <form action="{{ tenant_route('tenant.data-pokok.non-teaching-staff.update', $nonTeachingStaff) }}" method="POST">
                    @csrf
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name', $nonTeachingStaff->name) }}" required>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="gender" class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                            <select class="form-select @error('gender') is-invalid @enderror" id="gender" name="gender" required>
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="L" {{ old('gender', $nonTeachingStaff->gender) == 'L' ? 'selected' : '' }}>Laki-laki</option>
                                <option value="P" {{ old('gender', $nonTeachingStaff->gender) == 'P' ? 'selected' : '' }}>Perempuan</option>
                            </select>
                            @error('gender')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="birth_date" class="form-label">Tanggal Lahir</label>
                            <input type="date" class="form-control @error('birth_date') is-invalid @enderror" id="birth_date" name="birth_date" value="{{ old('birth_date', $nonTeachingStaff->birth_date?->format('Y-m-d')) }}">
                            @error('birth_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="birth_place" class="form-label">Tempat Lahir</label>
                            <input type="text" class="form-control @error('birth_place') is-invalid @enderror" id="birth_place" name="birth_place" value="{{ old('birth_place', $nonTeachingStaff->birth_place) }}">
                            @error('birth_place')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="address" class="form-label">Alamat</label>
                        <textarea class="form-control @error('address') is-invalid @enderror" id="address" name="address" rows="3">{{ old('address', $nonTeachingStaff->address) }}</textarea>
                        @error('address')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="phone" class="form-label">Telepon</label>
                            <input type="text" class="form-control @error('phone') is-invalid @enderror" id="phone" name="phone" value="{{ old('phone', $nonTeachingStaff->phone) }}">
                            @error('phone')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email', $nonTeachingStaff->email) }}">
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="religion" class="form-label">Agama</label>
                            <select class="form-select @error('religion') is-invalid @enderror" id="religion" name="religion">
                                <option value="">Pilih Agama</option>
                                <option value="Islam" {{ old('religion', $nonTeachingStaff->religion) == 'Islam' ? 'selected' : '' }}>Islam</option>
                                <option value="Kristen" {{ old('religion', $nonTeachingStaff->religion) == 'Kristen' ? 'selected' : '' }}>Kristen</option>
                                <option value="Katolik" {{ old('religion', $nonTeachingStaff->religion) == 'Katolik' ? 'selected' : '' }}>Katolik</option>
                                <option value="Hindu" {{ old('religion', $nonTeachingStaff->religion) == 'Hindu' ? 'selected' : '' }}>Hindu</option>
                                <option value="Buddha" {{ old('religion', $nonTeachingStaff->religion) == 'Buddha' ? 'selected' : '' }}>Buddha</option>
                                <option value="Konghucu" {{ old('religion', $nonTeachingStaff->religion) == 'Konghucu' ? 'selected' : '' }}>Konghucu</option>
                            </select>
                            @error('religion')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="education_level" class="form-label">Tingkat Pendidikan</label>
                            <select class="form-select @error('education_level') is-invalid @enderror" id="education_level" name="education_level">
                                <option value="">Pilih Tingkat Pendidikan</option>
                                <option value="SD" {{ old('education_level', $nonTeachingStaff->education_level) == 'SD' ? 'selected' : '' }}>SD</option>
                                <option value="SMP" {{ old('education_level', $nonTeachingStaff->education_level) == 'SMP' ? 'selected' : '' }}>SMP</option>
                                <option value="SMA" {{ old('education_level', $nonTeachingStaff->education_level) == 'SMA' ? 'selected' : '' }}>SMA</option>
                                <option value="D1" {{ old('education_level', $nonTeachingStaff->education_level) == 'D1' ? 'selected' : '' }}>D1</option>
                                <option value="D2" {{ old('education_level', $nonTeachingStaff->education_level) == 'D2' ? 'selected' : '' }}>D2</option>
                                <option value="D3" {{ old('education_level', $nonTeachingStaff->education_level) == 'D3' ? 'selected' : '' }}>D3</option>
                                <option value="D4" {{ old('education_level', $nonTeachingStaff->education_level) == 'D4' ? 'selected' : '' }}>D4</option>
                                <option value="S1" {{ old('education_level', $nonTeachingStaff->education_level) == 'S1' ? 'selected' : '' }}>S1</option>
                                <option value="S2" {{ old('education_level', $nonTeachingStaff->education_level) == 'S2' ? 'selected' : '' }}>S2</option>
                                <option value="S3" {{ old('education_level', $nonTeachingStaff->education_level) == 'S3' ? 'selected' : '' }}>S3</option>
                            </select>
                            @error('education_level')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <hr class="my-4">
                    <h6 class="mb-3">Data Kepegawaian</h6>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="employee_number" class="form-label">Nomor Pegawai</label>
                            <input type="text" class="form-control @error('employee_number') is-invalid @enderror" id="employee_number" name="employee_number" value="{{ old('employee_number', $nonTeachingStaff->employee_number) }}">
                            @error('employee_number')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="nip" class="form-label">NIP</label>
                            <input type="text" class="form-control @error('nip') is-invalid @enderror" id="nip" name="nip" value="{{ old('nip', $nonTeachingStaff->nip) }}">
                            @error('nip')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="position" class="form-label">Posisi/Jabatan <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('position') is-invalid @enderror" id="position" name="position" value="{{ old('position', $nonTeachingStaff->position) }}" required>
                            @error('position')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="department" class="form-label">Departemen/Bagian</label>
                            <input type="text" class="form-control @error('department') is-invalid @enderror" id="department" name="department" value="{{ old('department', $nonTeachingStaff->department) }}">
                            @error('department')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="employment_status" class="form-label">Status Kepegawaian <span class="text-danger">*</span></label>
                            <select class="form-select @error('employment_status') is-invalid @enderror" id="employment_status" name="employment_status" required>
                                <option value="">Pilih Status Kepegawaian</option>
                                <option value="permanent" {{ old('employment_status', $nonTeachingStaff->employment_status) == 'permanent' ? 'selected' : '' }}>Pegawai Tetap</option>
                                <option value="contract" {{ old('employment_status', $nonTeachingStaff->employment_status) == 'contract' ? 'selected' : '' }}>Kontrak</option>
                                <option value="honorary" {{ old('employment_status', $nonTeachingStaff->employment_status) == 'honorary' ? 'selected' : '' }}>Honorer</option>
                                <option value="intern" {{ old('employment_status', $nonTeachingStaff->employment_status) == 'intern' ? 'selected' : '' }}>Magang</option>
                                <option value="resigned" {{ old('employment_status', $nonTeachingStaff->employment_status) == 'resigned' ? 'selected' : '' }}>Keluar</option>
                            </select>
                            @error('employment_status')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="hire_date" class="form-label">Tanggal Mulai Bekerja</label>
                            <input type="date" class="form-control @error('hire_date') is-invalid @enderror" id="hire_date" name="hire_date" value="{{ old('hire_date', $nonTeachingStaff->hire_date?->format('Y-m-d')) }}">
                            @error('hire_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="salary" class="form-label">Gaji (Opsional)</label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control @error('salary') is-invalid @enderror" id="salary" name="salary" value="{{ old('salary', $nonTeachingStaff->salary) }}" min="0" step="0.01">
                            @error('salary')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.show', $nonTeachingStaff) }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
