@extends('layouts.tenant')

@section('title', 'Tambah Supervisi Guru')
@section('page-title', 'Tambah Supervisi Guru')

@include('components.tenant-modern-styles')

@push('styles')
<style>
    .score-input-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .score-input-group input {
        max-width: 100px;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-clipboard-check me-3"></i>
                Tambah Supervisi Guru
            </h2>
            <p>Lengkapi form di bawah ini untuk menambahkan supervisi baru</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<form action="{{ tenant_route('tenant.teacher-supervisions.store') }}" method="POST">
    @csrf
    
    <div class="row">
        <div class="col-md-8">
            <!-- Data Dasar Supervisi -->
            <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
                <div class="card-header">
                    <h5><i class="fas fa-info-circle me-2 text-primary"></i>Data Dasar Supervisi</h5>
                </div>
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Guru yang Disupervisi <span class="text-danger">*</span></label>
                                <select name="teacher_id" class="form-select @error('teacher_id') is-invalid @enderror" required>
                                    <option value="">Pilih Guru</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ old('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                            {{ $teacher->name }} - {{ $teacher->employee_number }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('teacher_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Supervisor <span class="text-danger">*</span></label>
                                <select name="supervisor_id" class="form-select @error('supervisor_id') is-invalid @enderror" required>
                                    <option value="">Pilih Supervisor</option>
                                    @foreach($teachers as $teacher)
                                        <option value="{{ $teacher->id }}" {{ old('supervisor_id') == $teacher->id ? 'selected' : '' }}>
                                            {{ $teacher->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('supervisor_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Tanggal Supervisi <span class="text-danger">*</span></label>
                                <input type="date" name="supervision_date" class="form-control @error('supervision_date') is-invalid @enderror" 
                                       value="{{ old('supervision_date', date('Y-m-d')) }}" required>
                                @error('supervision_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Waktu Mulai</label>
                                <input type="time" name="start_time" class="form-control @error('start_time') is-invalid @enderror" 
                                       value="{{ old('start_time') }}">
                                @error('start_time')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Waktu Selesai</label>
                                <input type="time" name="end_time" class="form-control @error('end_time') is-invalid @enderror" 
                                       value="{{ old('end_time') }}">
                                @error('end_time')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Jenis Supervisi <span class="text-danger">*</span></label>
                                <select name="supervision_type" class="form-select @error('supervision_type') is-invalid @enderror" required>
                                    <option value="akademik" {{ old('supervision_type', 'akademik') == 'akademik' ? 'selected' : '' }}>Akademik</option>
                                    <option value="administratif" {{ old('supervision_type') == 'administratif' ? 'selected' : '' }}>Administratif</option>
                                    <option value="kepribadian" {{ old('supervision_type') == 'kepribadian' ? 'selected' : '' }}>Kepribadian</option>
                                    <option value="sosial" {{ old('supervision_type') == 'sosial' ? 'selected' : '' }}>Sosial</option>
                                </select>
                                @error('supervision_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Metode Supervisi <span class="text-danger">*</span></label>
                                <select name="supervision_method" class="form-select @error('supervision_method') is-invalid @enderror" required>
                                    <option value="observasi_kelas" {{ old('supervision_method', 'observasi_kelas') == 'observasi_kelas' ? 'selected' : '' }}>Observasi Kelas</option>
                                    <option value="observasi_non_kelas" {{ old('supervision_method') == 'observasi_non_kelas' ? 'selected' : '' }}>Observasi Non Kelas</option>
                                    <option value="wawancara" {{ old('supervision_method') == 'wawancara' ? 'selected' : '' }}>Wawancara</option>
                                    <option value="dokumentasi" {{ old('supervision_method') == 'dokumentasi' ? 'selected' : '' }}>Dokumentasi</option>
                                    <option value="kombinasi" {{ old('supervision_method') == 'kombinasi' ? 'selected' : '' }}>Kombinasi</option>
                                </select>
                                @error('supervision_method')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Kelas</label>
                                <select name="class_room_id" class="form-select @error('class_room_id') is-invalid @enderror">
                                    <option value="">Pilih Kelas</option>
                                    @foreach($classRooms as $classRoom)
                                        <option value="{{ $classRoom->id }}" {{ old('class_room_id') == $classRoom->id ? 'selected' : '' }}>
                                            {{ $classRoom->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('class_room_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Mata Pelajaran</label>
                                <select name="subject_id" class="form-select @error('subject_id') is-invalid @enderror">
                                    <option value="">Pilih Mata Pelajaran</option>
                                    @foreach($subjects as $subject)
                                        <option value="{{ $subject->id }}" {{ old('subject_id') == $subject->id ? 'selected' : '' }}>
                                            {{ $subject->name }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('subject_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tahun Ajaran</label>
                                <input type="text" name="academic_year" class="form-control" 
                                       value="{{ old('academic_year', $currentAcademicYear) }}" placeholder="2024/2025">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Semester</label>
                                <select name="semester" class="form-select">
                                    <option value="">Pilih Semester</option>
                                    <option value="1" {{ old('semester', $currentSemester) == 1 ? 'selected' : '' }}>Semester 1</option>
                                    <option value="2" {{ old('semester', $currentSemester) == 2 ? 'selected' : '' }}>Semester 2</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Aspek Penilaian -->
                <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-line me-2 text-primary"></i>Aspek Penilaian</h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-4">
                            <label class="form-label">1. Persiapan (0-100)</label>
                            <div class="score-input-group">
                                <input type="number" name="preparation_score" class="form-control" 
                                       value="{{ old('preparation_score') }}" min="0" max="100" step="0.01" placeholder="0-100">
                                <span class="text-muted">/ 100</span>
                            </div>
                            <textarea name="preparation_notes" class="form-control mt-2" rows="2" 
                                      placeholder="Catatan tentang persiapan">{{ old('preparation_notes') }}</textarea>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">2. Pelaksanaan (0-100)</label>
                            <div class="score-input-group">
                                <input type="number" name="implementation_score" class="form-control" 
                                       value="{{ old('implementation_score') }}" min="0" max="100" step="0.01" placeholder="0-100">
                                <span class="text-muted">/ 100</span>
                            </div>
                            <textarea name="implementation_notes" class="form-control mt-2" rows="2" 
                                      placeholder="Catatan tentang pelaksanaan">{{ old('implementation_notes') }}</textarea>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">3. Pengelolaan Kelas (0-100)</label>
                            <div class="score-input-group">
                                <input type="number" name="classroom_management_score" class="form-control" 
                                       value="{{ old('classroom_management_score') }}" min="0" max="100" step="0.01" placeholder="0-100">
                                <span class="text-muted">/ 100</span>
                            </div>
                            <textarea name="classroom_management_notes" class="form-control mt-2" rows="2" 
                                      placeholder="Catatan tentang pengelolaan kelas">{{ old('classroom_management_notes') }}</textarea>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">4. Interaksi dengan Siswa (0-100)</label>
                            <div class="score-input-group">
                                <input type="number" name="student_interaction_score" class="form-control" 
                                       value="{{ old('student_interaction_score') }}" min="0" max="100" step="0.01" placeholder="0-100">
                                <span class="text-muted">/ 100</span>
                            </div>
                            <textarea name="student_interaction_notes" class="form-control mt-2" rows="2" 
                                      placeholder="Catatan tentang interaksi dengan siswa">{{ old('student_interaction_notes') }}</textarea>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">5. Penilaian (0-100)</label>
                            <div class="score-input-group">
                                <input type="number" name="assessment_score" class="form-control" 
                                       value="{{ old('assessment_score') }}" min="0" max="100" step="0.01" placeholder="0-100">
                                <span class="text-muted">/ 100</span>
                            </div>
                            <textarea name="assessment_notes" class="form-control mt-2" rows="2" 
                                      placeholder="Catatan tentang penilaian">{{ old('assessment_notes') }}</textarea>
                        </div>
                    </div>
                </div>

                <!-- Kekuatan dan Kelemahan -->
                <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
                    <div class="card-header">
                        <h5><i class="fas fa-balance-scale me-2 text-primary"></i>Kekuatan dan Kelemahan</h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label">Kekuatan yang Ditemukan</label>
                            <textarea name="strengths" class="form-control" rows="4" 
                                      placeholder="Tuliskan kekuatan yang ditemukan dalam supervisi">{{ old('strengths') }}</textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Kelemahan yang Ditemukan</label>
                            <textarea name="weaknesses" class="form-control" rows="4" 
                                      placeholder="Tuliskan kelemahan yang ditemukan dalam supervisi">{{ old('weaknesses') }}</textarea>
                        </div>
                    </div>
                </div>

                <!-- Rencana Tindak Lanjut -->
                <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
                    <div class="card-header">
                        <h5><i class="fas fa-tasks me-2 text-primary"></i>Rencana Tindak Lanjut (RTL)</h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label">Rencana Tindak Lanjut</label>
                            <textarea name="follow_up_plan" class="form-control" rows="4" 
                                      placeholder="Tuliskan rencana tindak lanjut yang akan dilakukan">{{ old('follow_up_plan') }}</textarea>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tanggal Tindak Lanjut</label>
                                <input type="date" name="follow_up_date" class="form-control" value="{{ old('follow_up_date') }}">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Status Tindak Lanjut</label>
                                <select name="follow_up_status" class="form-select">
                                    <option value="belum" {{ old('follow_up_status', 'belum') == 'belum' ? 'selected' : '' }}>Belum</option>
                                    <option value="sedang" {{ old('follow_up_status') == 'sedang' ? 'selected' : '' }}>Sedang Berjalan</option>
                                    <option value="selesai" {{ old('follow_up_status') == 'selesai' ? 'selected' : '' }}>Selesai</option>
                                    <option value="tidak_perlu" {{ old('follow_up_status') == 'tidak_perlu' ? 'selected' : '' }}>Tidak Perlu</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Catatan Tambahan -->
                <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
                    <div class="card-header">
                        <h5><i class="fas fa-sticky-note me-2 text-primary"></i>Catatan Tambahan</h5>
                    </div>
                    <div class="card-body p-4">
                        <textarea name="notes" class="form-control" rows="4" 
                                  placeholder="Catatan tambahan lainnya">{{ old('notes') }}</textarea>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <!-- Status -->
                <div class="card-modern fade-in-up fade-in-up-delay-5 mb-3">
                    <div class="card-header">
                        <h5><i class="fas fa-cog me-2 text-primary"></i>Status</h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label">Status Supervisi</label>
                            <select name="status" class="form-select">
                                <option value="draft" {{ old('status', 'draft') == 'draft' ? 'selected' : '' }}>Draft</option>
                                <option value="completed" {{ old('status') == 'completed' ? 'selected' : '' }}>Selesai</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="card-modern fade-in-up fade-in-up-delay-5">
                    <div class="card-body p-4">
                        <button type="submit" class="btn btn-modern btn-primary w-100 mb-2">
                            <i class="fas fa-save me-2"></i>Simpan Supervisi
                        </button>
                        <a href="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="btn btn-modern btn-secondary w-100">
                            <i class="fas fa-times me-2"></i>Batal
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </form>
@endsection

@push('scripts')
<script>
    // Auto calculate overall score
    const scoreInputs = document.querySelectorAll('input[type="number"][name$="_score"]');
    scoreInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Overall score akan dihitung di backend
        });
    });
</script>
@endpush

