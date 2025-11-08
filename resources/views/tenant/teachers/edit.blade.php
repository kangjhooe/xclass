@extends('layouts.tenant')

@section('title', 'Lengkapi Data Guru')
@section('page-title', 'Lengkapi Data Guru')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-user-edit me-3"></i>
                Lengkapi Data Guru: {{ $teacher->name }}
            </h2>
            <p>Lengkapi informasi lengkap data guru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div id="progress-container">
                <small class="text-white me-2" style="opacity: 0.9;">Progress: </small>
                <div class="progress" style="width: 200px; height: 25px; display: inline-block; vertical-align: middle; background: rgba(255,255,255,0.3); border-radius: 12px;">
                    <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%; border-radius: 12px; background: rgba(255,255,255,0.9); color: #667eea; font-weight: 600;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                        <span id="progress-text">0%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Lengkapi Data Guru
        </h5>
    </div>
    <div class="card-body">
        <form action="{{ tenant_route('tenant.teachers.update', $teacher) }}" method="POST" id="teacherForm">
                    @csrf
                    @method('PUT')
                    
                    <!-- Tab Navigation -->
                    <ul class="nav nav-tabs card-header-tabs mb-4" id="teacherTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="personal-tab" data-bs-toggle="tab" data-bs-target="#personal" type="button" role="tab">
                                <i class="fas fa-user me-1"></i>Data Pribadi
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="education-tab" data-bs-toggle="tab" data-bs-target="#education" type="button" role="tab">
                                <i class="fas fa-graduation-cap me-1"></i>Data Pendidikan
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="employment-tab" data-bs-toggle="tab" data-bs-target="#employment" type="button" role="tab">
                                <i class="fas fa-briefcase me-1"></i>Status Kepegawaian
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="duty-tab" data-bs-toggle="tab" data-bs-target="#duty" type="button" role="tab">
                                <i class="fas fa-chalkboard me-1"></i>Tugas & Mengajar
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="certification-tab" data-bs-toggle="tab" data-bs-target="#certification" type="button" role="tab">
                                <i class="fas fa-certificate me-1"></i>Sertifikasi
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="allowance-tab" data-bs-toggle="tab" data-bs-target="#allowance" type="button" role="tab">
                                <i class="fas fa-money-bill me-1"></i>Tunjangan
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="award-tab" data-bs-toggle="tab" data-bs-target="#award" type="button" role="tab">
                                <i class="fas fa-trophy me-1"></i>Penghargaan & Pelatihan
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="competence-tab" data-bs-toggle="tab" data-bs-target="#competence" type="button" role="tab">
                                <i class="fas fa-brain me-1"></i>Kompetensi
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="additional-duties-tab" data-bs-toggle="tab" data-bs-target="#additional-duties" type="button" role="tab">
                                <i class="fas fa-briefcase me-1"></i>Tugas Tambahan
                            </button>
                        </li>
                    </ul>

                    <!-- Tab Content -->
                    <div class="tab-content" id="teacherTabsContent">
                        <!-- Tab 1: Data Pribadi -->
                        <div class="tab-pane fade show active" id="personal" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-user me-2"></i>Data Pribadi Guru</h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="name" class="form-label">Nama Lengkap Personal <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                               id="name" name="name" value="{{ old('name', $teacher->name) }}" required>
                                        @error('name')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="nuptk" class="form-label">NUPTK</label>
                                        <input type="text" class="form-control @error('nuptk') is-invalid @enderror" 
                                               id="nuptk" name="nuptk" value="{{ old('nuptk', $teacher->nuptk) }}">
                                        @error('nuptk')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="page_id" class="form-label">Page ID</label>
                                        <input type="text" class="form-control @error('page_id') is-invalid @enderror" 
                                               id="page_id" name="page_id" value="{{ old('page_id', $teacher->page_id) }}">
                                        @error('page_id')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="npk" class="form-label">NPK</label>
                                        <input type="text" class="form-control @error('npk') is-invalid @enderror" 
                                               id="npk" name="npk" value="{{ old('npk', $teacher->npk) }}">
                                        @error('npk')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="nip" class="form-label">NIP</label>
                                        <input type="text" class="form-control @error('nip') is-invalid @enderror" 
                                               id="nip" name="nip" value="{{ old('nip', $teacher->nip) }}">
                                        @error('nip')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="nik" class="form-label">NIK / No. KTP</label>
                                        <input type="text" class="form-control @error('nik') is-invalid @enderror" 
                                               id="nik" name="nik" value="{{ old('nik', $teacher->nik) }}" maxlength="16">
                                        @error('nik')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="birth_place" class="form-label">Tempat Lahir</label>
                                        <input type="text" class="form-control @error('birth_place') is-invalid @enderror" 
                                               id="birth_place" name="birth_place" value="{{ old('birth_place', $teacher->birth_place) }}">
                                        @error('birth_place')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="birth_date" class="form-label">Tanggal Lahir (DD-MM-YYYY)</label>
                                        <input type="date" class="form-control @error('birth_date') is-invalid @enderror" 
                                               id="birth_date" name="birth_date" 
                                               value="{{ old('birth_date', $teacher->birth_date ? $teacher->birth_date->format('Y-m-d') : '') }}">
                                        @error('birth_date')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="gender" class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                                        <select class="form-control @error('gender') is-invalid @enderror" 
                                                id="gender" name="gender" required>
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="L" {{ old('gender', $teacher->gender) == 'L' ? 'selected' : '' }}>Laki-laki</option>
                                            <option value="P" {{ old('gender', $teacher->gender) == 'P' ? 'selected' : '' }}>Perempuan</option>
                                        </select>
                                        @error('gender')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="mother_name" class="form-label">Nama Ibu Kandung</label>
                                        <input type="text" class="form-control @error('mother_name') is-invalid @enderror" 
                                               id="mother_name" name="mother_name" value="{{ old('mother_name', $teacher->mother_name) }}">
                                        @error('mother_name')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="form-group mb-3">
                                <label for="address" class="form-label">Alamat Rumah / Tempat Tinggal</label>
                                <textarea class="form-control @error('address') is-invalid @enderror" 
                                          id="address" name="address" rows="3">{{ old('address', $teacher->address) }}</textarea>
                                @error('address')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="province" class="form-label">Provinsi</label>
                                        <input type="text" class="form-control @error('province') is-invalid @enderror" 
                                               id="province" name="province" value="{{ old('province', $teacher->province) }}">
                                        @error('province')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="city" class="form-label">Kab./Kota</label>
                                        <input type="text" class="form-control @error('city') is-invalid @enderror" 
                                               id="city" name="city" value="{{ old('city', $teacher->city) }}">
                                        @error('city')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="district" class="form-label">Kecamatan</label>
                                        <input type="text" class="form-control @error('district') is-invalid @enderror" 
                                               id="district" name="district" value="{{ old('district', $teacher->district) }}">
                                        @error('district')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="village" class="form-label">Desa/Kelurahan</label>
                                        <input type="text" class="form-control @error('village') is-invalid @enderror" 
                                               id="village" name="village" value="{{ old('village', $teacher->village) }}">
                                        @error('village')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="postal_code" class="form-label">Kode Pos</label>
                                        <input type="text" class="form-control @error('postal_code') is-invalid @enderror" 
                                               id="postal_code" name="postal_code" value="{{ old('postal_code', $teacher->postal_code) }}" maxlength="10">
                                        @error('postal_code')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                               id="email" name="email" value="{{ old('email', $teacher->email) }}">
                                        @error('email')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="phone" class="form-label">Nomor HP</label>
                                        <input type="text" class="form-control @error('phone') is-invalid @enderror" 
                                               id="phone" name="phone" value="{{ old('phone', $teacher->phone) }}">
                                        @error('phone')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 2: Data Pendidikan -->
                        <div class="tab-pane fade" id="education" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-graduation-cap me-2"></i>Data Pendidikan</h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="jenjang" class="form-label">Jenjang</label>
                                        <input type="text" class="form-control @error('jenjang') is-invalid @enderror" 
                                               id="jenjang" name="jenjang" value="{{ old('jenjang', $teacher->jenjang) }}">
                                        @error('jenjang')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="study_program_group" class="form-label">Kelompok Program Studi</label>
                                        <input type="text" class="form-control @error('study_program_group') is-invalid @enderror" 
                                               id="study_program_group" name="study_program_group" value="{{ old('study_program_group', $teacher->study_program_group) }}">
                                        @error('study_program_group')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="education_level" class="form-label">Pendidikan Terakhir</label>
                                        <select class="form-control @error('education_level') is-invalid @enderror" 
                                                id="education_level" name="education_level">
                                            <option value="">Pilih Pendidikan</option>
                                            <option value="SD" {{ old('education_level', $teacher->education_level) == 'SD' ? 'selected' : '' }}>SD</option>
                                            <option value="SMP" {{ old('education_level', $teacher->education_level) == 'SMP' ? 'selected' : '' }}>SMP</option>
                                            <option value="SMA" {{ old('education_level', $teacher->education_level) == 'SMA' ? 'selected' : '' }}>SMA</option>
                                            <option value="D1" {{ old('education_level', $teacher->education_level) == 'D1' ? 'selected' : '' }}>D1</option>
                                            <option value="D2" {{ old('education_level', $teacher->education_level) == 'D2' ? 'selected' : '' }}>D2</option>
                                            <option value="D3" {{ old('education_level', $teacher->education_level) == 'D3' ? 'selected' : '' }}>D3</option>
                                            <option value="D4" {{ old('education_level', $teacher->education_level) == 'D4' ? 'selected' : '' }}>D4</option>
                                            <option value="S1" {{ old('education_level', $teacher->education_level) == 'S1' ? 'selected' : '' }}>S1</option>
                                            <option value="S2" {{ old('education_level', $teacher->education_level) == 'S2' ? 'selected' : '' }}>S2</option>
                                            <option value="S3" {{ old('education_level', $teacher->education_level) == 'S3' ? 'selected' : '' }}>S3</option>
                                        </select>
                                        @error('education_level')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 3: Status Kepegawaian -->
                        <div class="tab-pane fade" id="employment" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-briefcase me-2"></i>Status Kepegawaian</h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="employment_status" class="form-label">Status Kepegawaian Personal/PTK</label>
                                        <input type="text" class="form-control @error('employment_status') is-invalid @enderror" 
                                               id="employment_status" name="employment_status" value="{{ old('employment_status', $teacher->employment_status) }}">
                                        @error('employment_status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="employment_status_detail" class="form-label">Status Kepegawaian (PNS / Non-PNS)</label>
                                        <select class="form-control @error('employment_status_detail') is-invalid @enderror" 
                                                id="employment_status_detail" name="employment_status_detail">
                                            <option value="">Pilih Status</option>
                                            <option value="PNS" {{ old('employment_status_detail', $teacher->employment_status_detail) == 'PNS' ? 'selected' : '' }}>PNS</option>
                                            <option value="Non-PNS" {{ old('employment_status_detail', $teacher->employment_status_detail) == 'Non-PNS' ? 'selected' : '' }}>Non-PNS</option>
                                        </select>
                                        @error('employment_status_detail')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="employment_status_non_pns" class="form-label">Khusus Guru Non-PNS</label>
                                        <input type="text" class="form-control @error('employment_status_non_pns') is-invalid @enderror" 
                                               id="employment_status_non_pns" name="employment_status_non_pns" value="{{ old('employment_status_non_pns', $teacher->employment_status_non_pns) }}">
                                        @error('employment_status_non_pns')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="golongan" class="form-label">Golongan</label>
                                        <input type="text" class="form-control @error('golongan') is-invalid @enderror" 
                                               id="golongan" name="golongan" value="{{ old('golongan', $teacher->golongan) }}">
                                        @error('golongan')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group mb-3">
                                        <label for="tmt_sk_cpns" class="form-label">TMT SK CPNS</label>
                                        <input type="date" class="form-control @error('tmt_sk_cpns') is-invalid @enderror" 
                                               id="tmt_sk_cpns" name="tmt_sk_cpns" 
                                               value="{{ old('tmt_sk_cpns', $teacher->tmt_sk_cpns ? $teacher->tmt_sk_cpns->format('Y-m-d') : '') }}">
                                        @error('tmt_sk_cpns')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="form-group mb-3">
                                        <label for="tmt_sk_awal" class="form-label">TMT SK Awal</label>
                                        <input type="date" class="form-control @error('tmt_sk_awal') is-invalid @enderror" 
                                               id="tmt_sk_awal" name="tmt_sk_awal" 
                                               value="{{ old('tmt_sk_awal', $teacher->tmt_sk_awal ? $teacher->tmt_sk_awal->format('Y-m-d') : '') }}">
                                        @error('tmt_sk_awal')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="form-group mb-3">
                                        <label for="tmt_sk_terakhir" class="form-label">TMT SK Terakhir</label>
                                        <input type="date" class="form-control @error('tmt_sk_terakhir') is-invalid @enderror" 
                                               id="tmt_sk_terakhir" name="tmt_sk_terakhir" 
                                               value="{{ old('tmt_sk_terakhir', $teacher->tmt_sk_terakhir ? $teacher->tmt_sk_terakhir->format('Y-m-d') : '') }}">
                                        @error('tmt_sk_terakhir')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="form-group mb-3">
                                <label for="appointing_institution" class="form-label">Instansi yang Mengangkat</label>
                                <input type="text" class="form-control @error('appointing_institution') is-invalid @enderror" 
                                       id="appointing_institution" name="appointing_institution" value="{{ old('appointing_institution', $teacher->appointing_institution) }}">
                                @error('appointing_institution')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="assignment_status" class="form-label">Status Penugasan</label>
                                        <input type="text" class="form-control @error('assignment_status') is-invalid @enderror" 
                                               id="assignment_status" name="assignment_status" value="{{ old('assignment_status', $teacher->assignment_status) }}">
                                        @error('assignment_status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="salary" class="form-label">Gaji Pokok per Bulan (Rp)</label>
                                        <input type="number" class="form-control @error('salary') is-invalid @enderror" 
                                               id="salary" name="salary" value="{{ old('salary', $teacher->salary) }}" step="0.01">
                                        @error('salary')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="workplace_status" class="form-label">Status Tempat Tugas</label>
                                        <input type="text" class="form-control @error('workplace_status') is-invalid @enderror" 
                                               id="workplace_status" name="workplace_status" value="{{ old('workplace_status', $teacher->workplace_status) }}">
                                        @error('workplace_status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="satminkal_type" class="form-label">Jenis Satminkal</label>
                                        <input type="text" class="form-control @error('satminkal_type') is-invalid @enderror" 
                                               id="satminkal_type" name="satminkal_type" value="{{ old('satminkal_type', $teacher->satminkal_type) }}">
                                        @error('satminkal_type')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="satminkal_npsn" class="form-label">NPSN Satminkal</label>
                                        <input type="text" class="form-control @error('satminkal_npsn') is-invalid @enderror" 
                                               id="satminkal_npsn" name="satminkal_npsn" value="{{ old('satminkal_npsn', $teacher->satminkal_npsn) }}" maxlength="8">
                                        @error('satminkal_npsn')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="satminkal_identity" class="form-label">Identitas Satminkal</label>
                                        <input type="text" class="form-control @error('satminkal_identity') is-invalid @enderror" 
                                               id="satminkal_identity" name="satminkal_identity" value="{{ old('satminkal_identity', $teacher->satminkal_identity) }}">
                                        @error('satminkal_identity')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="inpassing_status" name="inpassing_status" 
                                                   value="1" {{ old('inpassing_status', $teacher->inpassing_status) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="inpassing_status">
                                                Status Inpassing
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="tmt_inpassing" class="form-label">TMT Inpassing</label>
                                        <input type="date" class="form-control @error('tmt_inpassing') is-invalid @enderror" 
                                               id="tmt_inpassing" name="tmt_inpassing" 
                                               value="{{ old('tmt_inpassing', $teacher->tmt_inpassing ? $teacher->tmt_inpassing->format('Y-m-d') : '') }}">
                                        @error('tmt_inpassing')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 4: Tugas dan Mengajar -->
                        <div class="tab-pane fade" id="duty" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-chalkboard me-2"></i>Tugas dan Mengajar</h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="main_duty" class="form-label">Tugas Utama sebagai Pendidik</label>
                                        <input type="text" class="form-control @error('main_duty') is-invalid @enderror" 
                                               id="main_duty" name="main_duty" value="{{ old('main_duty', $teacher->main_duty) }}">
                                        @error('main_duty')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="additional_duty" class="form-label">Tugas Tambahan di Madrasah Ini</label>
                                        <input type="text" class="form-control @error('additional_duty') is-invalid @enderror" 
                                               id="additional_duty" name="additional_duty" value="{{ old('additional_duty', $teacher->additional_duty) }}">
                                        @error('additional_duty')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="main_duty_at_school" class="form-label">Tugas Utama di Madrasah Ini</label>
                                        <input type="text" class="form-control @error('main_duty_at_school') is-invalid @enderror" 
                                               id="main_duty_at_school" name="main_duty_at_school" value="{{ old('main_duty_at_school', $teacher->main_duty_at_school) }}">
                                        @error('main_duty_at_school')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="active_status" class="form-label">Status Keaktifan Personal</label>
                                        <input type="text" class="form-control @error('active_status') is-invalid @enderror" 
                                               id="active_status" name="active_status" value="{{ old('active_status', $teacher->active_status) }}">
                                        @error('active_status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="main_subject" class="form-label">Mapel Utama yang Diampu</label>
                                        <input type="text" class="form-control @error('main_subject') is-invalid @enderror" 
                                               id="main_subject" name="main_subject" value="{{ old('main_subject', $teacher->main_subject) }}">
                                        @error('main_subject')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="teaching_hours_per_week" class="form-label">Total Jam Tatap Muka/Minggu</label>
                                        <input type="number" class="form-control @error('teaching_hours_per_week') is-invalid @enderror" 
                                               id="teaching_hours_per_week" name="teaching_hours_per_week" value="{{ old('teaching_hours_per_week', $teacher->teaching_hours_per_week) }}">
                                        @error('teaching_hours_per_week')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="duty_type" class="form-label">Jenis Tugas</label>
                                        <input type="text" class="form-control @error('duty_type') is-invalid @enderror" 
                                               id="duty_type" name="duty_type" value="{{ old('duty_type', $teacher->duty_type) }}">
                                        @error('duty_type')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="equivalent_teaching_hours" class="form-label">Ekuivalensi Jam Tatap Muka</label>
                                        <input type="number" class="form-control @error('equivalent_teaching_hours') is-invalid @enderror" 
                                               id="equivalent_teaching_hours" name="equivalent_teaching_hours" value="{{ old('equivalent_teaching_hours', $teacher->equivalent_teaching_hours) }}">
                                        @error('equivalent_teaching_hours')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <hr class="my-4">
                            <h6>Tugas Mengajar di Satuan Pendidikan Lain (di luar Madrasah Ini)</h6>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="teach_elsewhere" name="teach_elsewhere" 
                                                   value="1" {{ old('teach_elsewhere', $teacher->teach_elsewhere) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="teach_elsewhere">
                                                Tugas Mengajar di Satuan Pendidikan Lain
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="other_workplace_type" class="form-label">Jenis Tempat Tugas Lain</label>
                                        <input type="text" class="form-control @error('other_workplace_type') is-invalid @enderror" 
                                               id="other_workplace_type" name="other_workplace_type" value="{{ old('other_workplace_type', $teacher->other_workplace_type) }}">
                                        @error('other_workplace_type')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="other_workplace_npsn" class="form-label">NPSN Tempat Tugas Lain</label>
                                        <input type="text" class="form-control @error('other_workplace_npsn') is-invalid @enderror" 
                                               id="other_workplace_npsn" name="other_workplace_npsn" value="{{ old('other_workplace_npsn', $teacher->other_workplace_npsn) }}" maxlength="8">
                                        @error('other_workplace_npsn')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="other_workplace_subject" class="form-label">Mapel yang Diampu (di luar Madrasah)</label>
                                        <input type="text" class="form-control @error('other_workplace_subject') is-invalid @enderror" 
                                               id="other_workplace_subject" name="other_workplace_subject" value="{{ old('other_workplace_subject', $teacher->other_workplace_subject) }}">
                                        @error('other_workplace_subject')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="other_workplace_hours" class="form-label">Jam Tatap Muka/Minggu (di luar Madrasah)</label>
                                        <input type="number" class="form-control @error('other_workplace_hours') is-invalid @enderror" 
                                               id="other_workplace_hours" name="other_workplace_hours" value="{{ old('other_workplace_hours', $teacher->other_workplace_hours) }}">
                                        @error('other_workplace_hours')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 5: Sertifikasi -->
                        <div class="tab-pane fade" id="certification" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-certificate me-2"></i>Informasi Sertifikasi</h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_participation_status" class="form-label">Status Kepesertaan</label>
                                        <input type="text" class="form-control @error('certification_participation_status') is-invalid @enderror" 
                                               id="certification_participation_status" name="certification_participation_status" value="{{ old('certification_participation_status', $teacher->certification_participation_status) }}">
                                        @error('certification_participation_status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_pass_status" class="form-label">Status Kelulusan</label>
                                        <input type="text" class="form-control @error('certification_pass_status') is-invalid @enderror" 
                                               id="certification_pass_status" name="certification_pass_status" value="{{ old('certification_pass_status', $teacher->certification_pass_status) }}">
                                        @error('certification_pass_status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_year" class="form-label">Tahun Lulus</label>
                                        <input type="number" class="form-control @error('certification_year') is-invalid @enderror" 
                                               id="certification_year" name="certification_year" value="{{ old('certification_year', $teacher->certification_year) }}" min="1900" max="2100">
                                        @error('certification_year')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_subject" class="form-label">Mapel yang Disertifikasi</label>
                                        <input type="text" class="form-control @error('certification_subject') is-invalid @enderror" 
                                               id="certification_subject" name="certification_subject" value="{{ old('certification_subject', $teacher->certification_subject) }}">
                                        @error('certification_subject')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="nrg" class="form-label">NRG</label>
                                        <input type="text" class="form-control @error('nrg') is-invalid @enderror" 
                                               id="nrg" name="nrg" value="{{ old('nrg', $teacher->nrg) }}">
                                        @error('nrg')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="nrg_sk_number" class="form-label">Nomor SK NRG</label>
                                        <input type="text" class="form-control @error('nrg_sk_number') is-invalid @enderror" 
                                               id="nrg_sk_number" name="nrg_sk_number" value="{{ old('nrg_sk_number', $teacher->nrg_sk_number) }}">
                                        @error('nrg_sk_number')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="nrg_sk_date" class="form-label">Tanggal SK NRG</label>
                                        <input type="date" class="form-control @error('nrg_sk_date') is-invalid @enderror" 
                                               id="nrg_sk_date" name="nrg_sk_date" 
                                               value="{{ old('nrg_sk_date', $teacher->nrg_sk_date ? $teacher->nrg_sk_date->format('Y-m-d') : '') }}">
                                        @error('nrg_sk_date')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_participant_number" class="form-label">Nomor Peserta Sertifikasi</label>
                                        <input type="text" class="form-control @error('certification_participant_number') is-invalid @enderror" 
                                               id="certification_participant_number" name="certification_participant_number" value="{{ old('certification_participant_number', $teacher->certification_participant_number) }}">
                                        @error('certification_participant_number')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_type" class="form-label">Jenis / Jalur Sertifikasi</label>
                                        <input type="text" class="form-control @error('certification_type') is-invalid @enderror" 
                                               id="certification_type" name="certification_type" value="{{ old('certification_type', $teacher->certification_type) }}">
                                        @error('certification_type')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certification_pass_date" class="form-label">Tanggal Kelulusan Sertifikasi</label>
                                        <input type="date" class="form-control @error('certification_pass_date') is-invalid @enderror" 
                                               id="certification_pass_date" name="certification_pass_date" 
                                               value="{{ old('certification_pass_date', $teacher->certification_pass_date ? $teacher->certification_pass_date->format('Y-m-d') : '') }}">
                                        @error('certification_pass_date')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certificate_number" class="form-label">Nomor Sertifikat Pendidik</label>
                                        <input type="text" class="form-control @error('certificate_number') is-invalid @enderror" 
                                               id="certificate_number" name="certificate_number" value="{{ old('certificate_number', $teacher->certificate_number) }}">
                                        @error('certificate_number')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="certificate_issue_date" class="form-label">Tanggal Penerbitan Sertifikat</label>
                                        <input type="date" class="form-control @error('certificate_issue_date') is-invalid @enderror" 
                                               id="certificate_issue_date" name="certificate_issue_date" 
                                               value="{{ old('certificate_issue_date', $teacher->certificate_issue_date ? $teacher->certificate_issue_date->format('Y-m-d') : '') }}">
                                        @error('certificate_issue_date')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="form-group mb-3">
                                <label for="lptk_name" class="form-label">Nama LPTK</label>
                                <input type="text" class="form-control @error('lptk_name') is-invalid @enderror" 
                                       id="lptk_name" name="lptk_name" value="{{ old('lptk_name', $teacher->lptk_name) }}">
                                @error('lptk_name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <!-- Tab 6: Tunjangan -->
                        <div class="tab-pane fade" id="allowance" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-money-bill me-2"></i>Informasi Tunjangan</h5>
                            
                            <h6 class="mt-4 mb-3">Tunjangan Profesi Guru (TPG)</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="tpg_recipient_status" name="tpg_recipient_status" 
                                                   value="1" {{ old('tpg_recipient_status', $teacher->tpg_recipient_status) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="tpg_recipient_status">
                                                Status Penerima TPG
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="tpg_start_year" class="form-label">Menerima TPG Mulai Tahun</label>
                                        <input type="number" class="form-control @error('tpg_start_year') is-invalid @enderror" 
                                               id="tpg_start_year" name="tpg_start_year" value="{{ old('tpg_start_year', $teacher->tpg_start_year) }}" min="1900" max="2100">
                                        @error('tpg_start_year')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="tpg_amount" class="form-label">Besarnya TPG per Bulan (Rp)</label>
                                        <input type="number" class="form-control @error('tpg_amount') is-invalid @enderror" 
                                               id="tpg_amount" name="tpg_amount" value="{{ old('tpg_amount', $teacher->tpg_amount) }}" step="0.01">
                                        @error('tpg_amount')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <hr class="my-4">
                            <h6 class="mb-3">Tunjangan Fungsional Guru (TFG)</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="tfg_recipient_status" name="tfg_recipient_status" 
                                                   value="1" {{ old('tfg_recipient_status', $teacher->tfg_recipient_status) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="tfg_recipient_status">
                                                Status Penerima TFG
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="tfg_start_year" class="form-label">Menerima TFG Mulai Tahun</label>
                                        <input type="number" class="form-control @error('tfg_start_year') is-invalid @enderror" 
                                               id="tfg_start_year" name="tfg_start_year" value="{{ old('tfg_start_year', $teacher->tfg_start_year) }}" min="1900" max="2100">
                                        @error('tfg_start_year')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="tfg_amount" class="form-label">Besarnya TFG per Bulan (Rp)</label>
                                        <input type="number" class="form-control @error('tfg_amount') is-invalid @enderror" 
                                               id="tfg_amount" name="tfg_amount" value="{{ old('tfg_amount', $teacher->tfg_amount) }}" step="0.01">
                                        @error('tfg_amount')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 7: Penghargaan & Pelatihan -->
                        <div class="tab-pane fade" id="award" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-trophy me-2"></i>Penghargaan dan Pelatihan</h5>
                            
                            <h6 class="mb-3">Penghargaan</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="has_award" name="has_award" 
                                                   value="1" {{ old('has_award', $teacher->has_award) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="has_award">
                                                Apakah Pernah Memperoleh Penghargaan?
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="highest_award" class="form-label">Penghargaan Tertinggi yang Pernah Diperoleh</label>
                                        <input type="text" class="form-control @error('highest_award') is-invalid @enderror" 
                                               id="highest_award" name="highest_award" value="{{ old('highest_award', $teacher->highest_award) }}">
                                        @error('highest_award')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="award_field" class="form-label">Bidang Penghargaan</label>
                                        <input type="text" class="form-control @error('award_field') is-invalid @enderror" 
                                               id="award_field" name="award_field" value="{{ old('award_field', $teacher->award_field) }}">
                                        @error('award_field')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="award_level" class="form-label">Tingkat Penghargaan</label>
                                        <input type="text" class="form-control @error('award_level') is-invalid @enderror" 
                                               id="award_level" name="award_level" value="{{ old('award_level', $teacher->award_level) }}">
                                        @error('award_level')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="award_year" class="form-label">Tahun Perolehan Penghargaan</label>
                                        <input type="number" class="form-control @error('award_year') is-invalid @enderror" 
                                               id="award_year" name="award_year" value="{{ old('award_year', $teacher->award_year) }}" min="1900" max="2100">
                                        @error('award_year')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <hr class="my-4">
                            <h6 class="mb-3">Pelatihan Peningkatan Kompetensi</h6>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="training_participated" name="training_participated" 
                                                   value="1" {{ old('training_participated', $teacher->training_participated) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="training_participated">
                                                Pelatihan Peningkatan Kompetensi yang Pernah Diikuti
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            @for($i = 1; $i <= 5; $i++)
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="training_{{ $i }}" class="form-label">Pelatihan {{ $i }}</label>
                                        <input type="text" class="form-control @error('training_' . $i) is-invalid @enderror" 
                                               id="training_{{ $i }}" name="training_{{ $i }}" value="{{ old('training_' . $i, $teacher->{'training_' . $i}) }}">
                                        @error('training_' . $i)
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="form-group mb-3">
                                        <label for="training_year_{{ $i }}" class="form-label">Tahun Mengikuti {{ $i }}</label>
                                        <input type="number" class="form-control @error('training_year_' . $i) is-invalid @enderror" 
                                               id="training_year_{{ $i }}" name="training_year_{{ $i }}" value="{{ old('training_year_' . $i, $teacher->{'training_year_' . $i}) }}" min="1900" max="2100">
                                        @error('training_year_' . $i)
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                            @endfor
                        </div>

                        <!-- Tab 9: Tugas Tambahan -->
                        <div class="tab-pane fade" id="additional-duties" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-briefcase me-2"></i>Tugas Tambahan</h5>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Catatan:</strong> Tugas tambahan menentukan akses modul yang dapat diakses oleh guru. 
                                Pilih tugas tambahan yang sesuai untuk memberikan akses ke modul tertentu.
                            </div>

                            @php
                                $availableDuties = \App\Models\Tenant\AdditionalDuty::where('instansi_id', $teacher->instansi_id)
                                    ->active()
                                    ->ordered()
                                    ->get();
                                $teacherDuties = $teacher->additionalDuties->pluck('id')->toArray();
                            @endphp

                            <div class="row">
                                @foreach($availableDuties as $duty)
                                <div class="col-md-6 mb-3">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" 
                                                       name="additional_duties[]" 
                                                       value="{{ $duty->id }}"
                                                       id="duty_{{ $duty->id }}"
                                                       {{ in_array($duty->id, old('additional_duties', $teacherDuties)) ? 'checked' : '' }}>
                                                <label class="form-check-label fw-bold" for="duty_{{ $duty->id }}">
                                                    {{ $duty->name }}
                                                </label>
                                            </div>
                                            @if($duty->description)
                                                <small class="text-muted d-block mt-1">{{ $duty->description }}</small>
                                            @endif
                                            
                                            @php
                                                $modules = $duty->activeModuleAccesses;
                                            @endphp
                                            @if($modules->count() > 0)
                                                <div class="mt-2">
                                                    <small class="text-primary">
                                                        <i class="fas fa-shield-alt me-1"></i>
                                                        <strong>Akses Modul:</strong>
                                                    </small>
                                                    <div class="d-flex flex-wrap gap-1 mt-1">
                                                        @foreach($modules as $module)
                                                            <span class="badge bg-info">{{ $module->module_name }}</span>
                                                        @endforeach
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                                @endforeach
                            </div>

                            @if($availableDuties->count() == 0)
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    Belum ada tugas tambahan yang tersedia. Silakan hubungi admin untuk menambahkan tugas tambahan.
                                </div>
                            @endif
                        </div>

                        <!-- Tab 8: Kompetensi -->
                        <div class="tab-pane fade" id="competence" role="tabpanel">
                            <h5 class="mb-4"><i class="fas fa-brain me-2"></i>Kompetensi Kepala Madrasah (Khusus)</h5>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Catatan:</strong> Bagian ini khusus untuk Kepala Madrasah/Wakil Kepala Madrasah
                            </div>

                            <div class="form-group mb-3">
                                <label for="personality_competence" class="form-label">Kompetensi Kepribadian</label>
                                <textarea class="form-control @error('personality_competence') is-invalid @enderror" 
                                          id="personality_competence" name="personality_competence" rows="3">{{ old('personality_competence', $teacher->personality_competence) }}</textarea>
                                @error('personality_competence')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group mb-3">
                                <label for="managerial_competence" class="form-label">Kompetensi Manajerial</label>
                                <textarea class="form-control @error('managerial_competence') is-invalid @enderror" 
                                          id="managerial_competence" name="managerial_competence" rows="3">{{ old('managerial_competence', $teacher->managerial_competence) }}</textarea>
                                @error('managerial_competence')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group mb-3">
                                <label for="entrepreneurship_competence" class="form-label">Kompetensi Kewirausahaan</label>
                                <textarea class="form-control @error('entrepreneurship_competence') is-invalid @enderror" 
                                          id="entrepreneurship_competence" name="entrepreneurship_competence" rows="3">{{ old('entrepreneurship_competence', $teacher->entrepreneurship_competence) }}</textarea>
                                @error('entrepreneurship_competence')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group mb-3">
                                <label for="supervision_competence" class="form-label">Kompetensi Supervisi</label>
                                <textarea class="form-control @error('supervision_competence') is-invalid @enderror" 
                                          id="supervision_competence" name="supervision_competence" rows="3">{{ old('supervision_competence', $teacher->supervision_competence) }}</textarea>
                                @error('supervision_competence')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="form-group mb-3">
                                <label for="social_competence" class="form-label">Kompetensi Sosial</label>
                                <textarea class="form-control @error('social_competence') is-invalid @enderror" 
                                          id="social_competence" name="social_competence" rows="3">{{ old('social_competence', $teacher->social_competence) }}</textarea>
                                @error('social_competence')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <!-- Form Footer -->
                    <div class="d-flex justify-content-between mt-4 pt-4 border-top">
                        <a href="{{ tenant_route('tenant.teachers.index') }}" class="btn btn-modern btn-secondary">
                            <i class="fas fa-arrow-left me-2"></i>
                            Kembali
                        </a>
                        <div>
                            <button type="button" class="btn btn-modern btn-info me-2" onclick="saveDraft()">
                                <i class="fas fa-save me-2"></i>
                                Simpan Draft
                            </button>
                            <button type="submit" class="btn btn-modern btn-primary">
                                <i class="fas fa-check me-2"></i>
                                Simpan Data Lengkap
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
// Auto-save draft functionality (optional)
function saveDraft() {
    // Implementation for draft saving can be added here
    alert('Fitur simpan draft akan segera tersedia');
}

// Keep active tab in session/localStorage
document.addEventListener('DOMContentLoaded', function() {
    var activeTab = localStorage.getItem('teacherEditActiveTab');
    if (activeTab) {
        var tabTrigger = new bootstrap.Tab(document.querySelector(activeTab));
        tabTrigger.show();
    }

    var tabEls = document.querySelectorAll('#teacherTabs button[data-bs-toggle="tab"]');
    tabEls.forEach(function(tabEl) {
        tabEl.addEventListener('shown.bs.tab', function (event) {
            localStorage.setItem('teacherEditActiveTab', event.target.getAttribute('data-bs-target'));
            updateProgress(); // Update progress when tab changes
        });
    });

    // Load progress on page load
    updateProgress();

    // Update progress when form fields change
    var formInputs = document.querySelectorAll('#teacherForm input, #teacherForm select, #teacherForm textarea');
    formInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            // Debounce progress update
            clearTimeout(window.progressUpdateTimeout);
            window.progressUpdateTimeout = setTimeout(updateProgress, 500);
        });
    });

    // Validasi format NIK, NUPTK, NIP
    var nikInput = document.getElementById('nik');
    if (nikInput) {
        nikInput.addEventListener('input', function() {
            validateNik(this);
        });
        nikInput.addEventListener('blur', function() {
            validateNik(this);
        });
    }

    var nuptkInput = document.getElementById('nuptk');
    if (nuptkInput) {
        nuptkInput.addEventListener('input', function() {
            validateNuptk(this);
        });
        nuptkInput.addEventListener('blur', function() {
            validateNuptk(this);
        });
    }

    var nipInput = document.getElementById('nip');
    if (nipInput) {
        nipInput.addEventListener('input', function() {
            validateNip(this);
        });
        nipInput.addEventListener('blur', function() {
            validateNip(this);
        });
    }
});

// Update progress indicator
function updateProgress() {
    var teacherId = {{ $teacher->id }};
    fetch('{{ tenant_route("tenant.teachers.progress", $teacher->nik) }}')
        .then(response => response.json())
        .then(data => {
            var progressBar = document.getElementById('progress-bar');
            var progressText = document.getElementById('progress-text');
            
            if (progressBar && progressText) {
                var percentage = Math.round(data.percentage);
                progressBar.style.width = percentage + '%';
                progressBar.setAttribute('aria-valuenow', percentage);
                progressText.textContent = percentage + '%';
                
                // Change color based on progress
                if (percentage < 30) {
                    progressBar.className = 'progress-bar bg-danger';
                } else if (percentage < 60) {
                    progressBar.className = 'progress-bar bg-warning';
                } else if (percentage < 90) {
                    progressBar.className = 'progress-bar bg-info';
                } else {
                    progressBar.className = 'progress-bar bg-success';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching progress:', error);
        });
}

// Validasi format NIK (16 digit)
function validateNik(input) {
    var value = input.value.replace(/\D/g, ''); // Remove non-digits
    input.value = value;
    
    if (value.length > 0 && value.length !== 16) {
        input.setCustomValidity('NIK harus terdiri dari 16 digit angka');
        input.classList.add('is-invalid');
    } else {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        if (value.length === 16) {
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
        }
    }
}

// Validasi format NUPTK (16 digit)
function validateNuptk(input) {
    var value = input.value.replace(/\D/g, ''); // Remove non-digits
    input.value = value;
    
    if (value.length > 0 && value.length !== 16) {
        input.setCustomValidity('NUPTK harus terdiri dari 16 digit angka');
        input.classList.add('is-invalid');
    } else {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        if (value.length === 16) {
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
        }
    }
}

// Validasi format NIP (18 digit)
function validateNip(input) {
    var value = input.value.replace(/\D/g, ''); // Remove non-digits
    input.value = value;
    
    if (value.length > 0 && value.length !== 18) {
        input.setCustomValidity('NIP harus terdiri dari 18 digit angka');
        input.classList.add('is-invalid');
    } else {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        if (value.length === 18) {
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
        }
    }
}
</script>
@endsection
