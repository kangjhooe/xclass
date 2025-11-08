@extends('layouts.tenant')

@section('title', 'Tambah Ujian')
@section('page-title', 'Tambah Ujian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus me-2"></i>
                        Form Tambah Ujian
                    </h5>
                </div>
                <div class="card-body">
                    <form action="{{ tenant_route('exam.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <!-- Basic Information -->
                            <div class="col-md-8">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Informasi Dasar</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-12 mb-3">
                                                <label for="title" class="form-label">Nama Ujian <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                                       id="title" name="title" value="{{ old('title') }}" required>
                                                @error('title')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-12 mb-3">
                                                <label for="description" class="form-label">Deskripsi</label>
                                                <textarea class="form-control @error('description') is-invalid @enderror" 
                                                          id="description" name="description" rows="3">{{ old('description') }}</textarea>
                                                @error('description')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="subject_id" class="form-label">Mata Pelajaran <span class="text-danger">*</span></label>
                                                <select class="form-select @error('subject_id') is-invalid @enderror" 
                                                        id="subject_id" name="subject_id" required>
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
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="class_id" class="form-label">Kelas <span class="text-danger">*</span></label>
                                                <select class="form-select @error('class_id') is-invalid @enderror" 
                                                        id="class_id" name="class_id" required>
                                                    <option value="">Pilih Kelas</option>
                                                    @foreach($classes as $class)
                                                        <option value="{{ $class->id }}" {{ old('class_id') == $class->id ? 'selected' : '' }}>
                                                            {{ $class->name }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                                @error('class_id')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="teacher_id" class="form-label">Guru <span class="text-danger">*</span></label>
                                                <select class="form-select @error('teacher_id') is-invalid @enderror" 
                                                        id="teacher_id" name="teacher_id" required>
                                                    <option value="">Pilih Guru</option>
                                                    @foreach($teachers as $teacher)
                                                        <option value="{{ $teacher->id }}" {{ old('teacher_id') == $teacher->id ? 'selected' : '' }}>
                                                            {{ $teacher->name }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                                @error('teacher_id')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="exam_type" class="form-label">Jenis Ujian <span class="text-danger">*</span></label>
                                                <select class="form-select @error('exam_type') is-invalid @enderror" 
                                                        id="exam_type" name="exam_type" required>
                                                    <option value="">Pilih Jenis Ujian</option>
                                                    <option value="quiz" {{ old('exam_type') == 'quiz' ? 'selected' : '' }}>Kuis</option>
                                                    <option value="midterm" {{ old('exam_type') == 'midterm' ? 'selected' : '' }}>UTS</option>
                                                    <option value="final" {{ old('exam_type') == 'final' ? 'selected' : '' }}>UAS</option>
                                                    <option value="assignment" {{ old('exam_type') == 'assignment' ? 'selected' : '' }}>Tugas</option>
                                                </select>
                                                @error('exam_type')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Time and Duration -->
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Waktu dan Durasi</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="start_time" class="form-label">Waktu Mulai <span class="text-danger">*</span></label>
                                                <input type="datetime-local" class="form-control @error('start_time') is-invalid @enderror" 
                                                       id="start_time" name="start_time" value="{{ old('start_time') }}" required>
                                                @error('start_time')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="end_time" class="form-label">Waktu Selesai <span class="text-danger">*</span></label>
                                                <input type="datetime-local" class="form-control @error('end_time') is-invalid @enderror" 
                                                       id="end_time" name="end_time" value="{{ old('end_time') }}" required>
                                                @error('end_time')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="duration" class="form-label">Durasi (menit) <span class="text-danger">*</span></label>
                                                <input type="number" class="form-control @error('duration') is-invalid @enderror" 
                                                       id="duration" name="duration" value="{{ old('duration') }}" 
                                                       min="1" max="480" required>
                                                @error('duration')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                                <div class="form-text">Maksimal 8 jam (480 menit)</div>
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="max_attempts" class="form-label">Maksimal Percobaan <span class="text-danger">*</span></label>
                                                <input type="number" class="form-control @error('max_attempts') is-invalid @enderror" 
                                                       id="max_attempts" name="max_attempts" value="{{ old('max_attempts', 1) }}" 
                                                       min="1" max="10" required>
                                                @error('max_attempts')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Scoring -->
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Penilaian</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="total_score" class="form-label">Total Nilai <span class="text-danger">*</span></label>
                                                <input type="number" class="form-control @error('total_score') is-invalid @enderror" 
                                                       id="total_score" name="total_score" value="{{ old('total_score') }}" 
                                                       min="1" required>
                                                @error('total_score')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                            
                                            <div class="col-md-6 mb-3">
                                                <label for="passing_score" class="form-label">Nilai Kelulusan (%) <span class="text-danger">*</span></label>
                                                <input type="number" class="form-control @error('passing_score') is-invalid @enderror" 
                                                       id="passing_score" name="passing_score" value="{{ old('passing_score') }}" 
                                                       min="0" max="100" required>
                                                @error('passing_score')
                                                    <div class="invalid-feedback">{{ $message }}</div>
                                                @enderror
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Instructions -->
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Instruksi Ujian</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="instructions" class="form-label">Instruksi untuk Siswa</label>
                                            <textarea class="form-control @error('instructions') is-invalid @enderror" 
                                                      id="instructions" name="instructions" rows="4">{{ old('instructions') }}</textarea>
                                            @error('instructions')
                                                <div class="invalid-feedback">{{ $message }}</div>
                                            @enderror
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Settings -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Pengaturan Ujian</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" id="allow_review" 
                                                   name="allow_review" value="1" {{ old('allow_review') ? 'checked' : '' }}>
                                            <label class="form-check-label" for="allow_review">
                                                Izinkan Review Jawaban
                                            </label>
                                        </div>
                                        
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" id="show_correct_answers" 
                                                   name="show_correct_answers" value="1" {{ old('show_correct_answers') ? 'checked' : '' }}>
                                            <label class="form-check-label" for="show_correct_answers">
                                                Tampilkan Jawaban Benar
                                            </label>
                                        </div>
                                        
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" id="randomize_questions" 
                                                   name="randomize_questions" value="1" {{ old('randomize_questions') ? 'checked' : '' }}>
                                            <label class="form-check-label" for="randomize_questions">
                                                Acak Urutan Soal
                                            </label>
                                        </div>
                                        
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" id="randomize_answers" 
                                                   name="randomize_answers" value="1" {{ old('randomize_answers') ? 'checked' : '' }}>
                                            <label class="form-check-label" for="randomize_answers">
                                                Acak Urutan Jawaban
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="card mt-3">
                                    <div class="card-body">
                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save me-1"></i>
                                                Simpan Ujian
                                            </button>
                                            <a href="{{ tenant_route('exam.index') }}" class="btn btn-outline-secondary">
                                                <i class="fas fa-times me-1"></i>
                                                Batal
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Auto-calculate end time based on start time and duration
    const startTimeInput = document.getElementById('start_time');
    const endTimeInput = document.getElementById('end_time');
    const durationInput = document.getElementById('duration');
    
    function calculateEndTime() {
        if (startTimeInput.value && durationInput.value) {
            const startTime = new Date(startTimeInput.value);
            const duration = parseInt(durationInput.value);
            const endTime = new Date(startTime.getTime() + (duration * 60000));
            
            // Format to datetime-local input
            const year = endTime.getFullYear();
            const month = String(endTime.getMonth() + 1).padStart(2, '0');
            const day = String(endTime.getDate()).padStart(2, '0');
            const hours = String(endTime.getHours()).padStart(2, '0');
            const minutes = String(endTime.getMinutes()).padStart(2, '0');
            
            endTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }
    
    startTimeInput.addEventListener('change', calculateEndTime);
    durationInput.addEventListener('input', calculateEndTime);
    
    // Set default start time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    if (!startTimeInput.value) {
        startTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
});
</script>
@endpush
@endsection
