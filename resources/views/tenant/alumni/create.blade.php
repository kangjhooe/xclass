@extends('layouts.tenant')

@section('title', 'Tambah Alumni')
@section('page-title', 'Tambah Data Alumni')

@push('styles')
<style>
    .card {
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border: none;
    }
    
    .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        border: none;
        padding: 1.25rem 1.5rem;
    }
    
    .card-header h3 {
        color: white;
        margin: 0;
    }
    
    .form-label {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
    }
    
    .form-control:focus,
    .form-select:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-plus me-2"></i>Tambah Data Alumni
                        </h3>
                        <a href="{{ tenant_route('tenant.alumni.index') }}" class="btn btn-light btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>

                <form action="{{ tenant_route('tenant.alumni.store') }}" method="POST">
                    @csrf
                    <div class="card-body p-4">
                        <div class="row">
                            <!-- Student Selection -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select name="student_id" id="student_id" class="form-select @error('student_id') is-invalid @enderror" required>
                                        <option value="">Pilih Siswa</option>
                                        @foreach($students as $student)
                                            <option value="{{ $student->id }}" {{ old('student_id') == $student->id ? 'selected' : '' }}>
                                                {{ $student->name }} ({{ $student->student_number }})
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('student_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Graduation Year -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="graduation_year" class="form-label">Tahun Lulus <span class="text-danger">*</span></label>
                                    <input type="number" name="graduation_year" id="graduation_year" 
                                           class="form-control @error('graduation_year') is-invalid @enderror"
                                           value="{{ old('graduation_year', date('Y')) }}" 
                                           min="2000" max="{{ date('Y') }}" required>
                                    @error('graduation_year')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Graduation Date -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="graduation_date" class="form-label">Tanggal Lulus <span class="text-danger">*</span></label>
                                    <input type="date" name="graduation_date" id="graduation_date" 
                                           class="form-control @error('graduation_date') is-invalid @enderror"
                                           value="{{ old('graduation_date') }}" required>
                                    @error('graduation_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Final Grade -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="final_grade" class="form-label">Nilai Akhir <span class="text-danger">*</span></label>
                                    <input type="number" name="final_grade" id="final_grade" 
                                           class="form-control @error('final_grade') is-invalid @enderror"
                                           value="{{ old('final_grade') }}" 
                                           min="0" max="100" step="0.01" required>
                                    @error('final_grade')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- GPA -->
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="gpa" class="form-label">GPA</label>
                                    <input type="number" name="gpa" id="gpa" 
                                           class="form-control @error('gpa') is-invalid @enderror"
                                           value="{{ old('gpa') }}" 
                                           min="0" max="4" step="0.01">
                                    @error('gpa')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Rank -->
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="rank" class="form-label">Peringkat</label>
                                    <input type="number" name="rank" id="rank" 
                                           class="form-control @error('rank') is-invalid @enderror"
                                           value="{{ old('rank') }}" 
                                           min="1">
                                    @error('rank')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Status -->
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                    <select name="status" id="status" class="form-select @error('status') is-invalid @enderror" required>
                                        <option value="">Pilih Status</option>
                                        <option value="employed" {{ old('status') == 'employed' ? 'selected' : '' }}>Bekerja</option>
                                        <option value="unemployed" {{ old('status') == 'unemployed' ? 'selected' : '' }}>Tidak Bekerja</option>
                                        <option value="self_employed" {{ old('status') == 'self_employed' ? 'selected' : '' }}>Wiraswasta</option>
                                        <option value="studying" {{ old('status') == 'studying' ? 'selected' : '' }}>Kuliah</option>
                                        <option value="retired" {{ old('status') == 'retired' ? 'selected' : '' }}>Pensiun</option>
                                        <option value="unknown" {{ old('status') == 'unknown' ? 'selected' : '' }}>Tidak Diketahui</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <hr>

                        <h5 class="mb-3">Informasi Pekerjaan</h5>

                        <div class="row">
                            <!-- Current Occupation -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="current_occupation" class="form-label">Pekerjaan Saat Ini</label>
                                    <input type="text" name="current_occupation" id="current_occupation" 
                                           class="form-control @error('current_occupation') is-invalid @enderror"
                                           value="{{ old('current_occupation') }}">
                                    @error('current_occupation')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Company -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="company" class="form-label">Perusahaan</label>
                                    <input type="text" name="company" id="company" 
                                           class="form-control @error('company') is-invalid @enderror"
                                           value="{{ old('company') }}">
                                    @error('company')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Position -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="position" class="form-label">Jabatan</label>
                                    <input type="text" name="position" id="position" 
                                           class="form-control @error('position') is-invalid @enderror"
                                           value="{{ old('position') }}">
                                    @error('position')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Industry -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="industry" class="form-label">Industri</label>
                                    <input type="text" name="industry" id="industry" 
                                           class="form-control @error('industry') is-invalid @enderror"
                                           value="{{ old('industry') }}">
                                    @error('industry')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Salary Range -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="salary_range" class="form-label">Kisaran Gaji</label>
                                    <input type="number" name="salary_range" id="salary_range" 
                                           class="form-control @error('salary_range') is-invalid @enderror"
                                           value="{{ old('salary_range') }}" 
                                           min="0">
                                    @error('salary_range')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <hr>

                        <h5 class="mb-3">Informasi Kontak</h5>

                        <div class="row">
                            <!-- Address -->
                            <div class="col-md-12">
                                <div class="mb-3">
                                    <label for="address" class="form-label">Alamat</label>
                                    <textarea name="address" id="address" rows="3" 
                                              class="form-control @error('address') is-invalid @enderror">{{ old('address') }}</textarea>
                                    @error('address')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Phone -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Telepon</label>
                                    <input type="text" name="phone" id="phone" 
                                           class="form-control @error('phone') is-invalid @enderror"
                                           value="{{ old('phone') }}">
                                    @error('phone')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" name="email" id="email" 
                                           class="form-control @error('email') is-invalid @enderror"
                                           value="{{ old('email') }}">
                                    @error('email')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Notes -->
                            <div class="col-md-12">
                                <div class="mb-3">
                                    <label for="notes" class="form-label">Catatan</label>
                                    <textarea name="notes" id="notes" rows="3" 
                                              class="form-control @error('notes') is-invalid @enderror">{{ old('notes') }}</textarea>
                                    @error('notes')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer bg-white border-top">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('tenant.alumni.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Batal
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Simpan Data
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Set graduation date to current date if not set
    const graduationDateInput = document.getElementById('graduation_date');
    if (!graduationDateInput.value) {
        graduationDateInput.value = new Date().toISOString().split('T')[0];
    }
});
</script>
@endpush
