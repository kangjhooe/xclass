@extends('layouts.tenant')

@section('title', 'Tambah Silabus')
@section('page-title', 'Tambah Silabus')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus-circle me-2"></i>
                        Form Tambah Silabus
                    </h5>
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

                    <form action="{{ tenant_route('academic.syllabus.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Judul Silabus <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                           id="title" name="title" value="{{ old('title') }}" required>
                                    @error('title')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
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

                                <div class="mb-3">
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

                                <div class="mb-3">
                                    <label for="academic_year_id" class="form-label">Tahun Akademik <span class="text-danger">*</span></label>
                                    <select class="form-select @error('academic_year_id') is-invalid @enderror" 
                                            id="academic_year_id" name="academic_year_id" required>
                                        <option value="">Pilih Tahun Akademik</option>
                                        @foreach($academicYears as $year)
                                            <option value="{{ $year->id }}" {{ old('academic_year_id') == $year->id ? 'selected' : '' }}>
                                                {{ $year->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('academic_year_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="description" class="form-label">Deskripsi</label>
                                    <textarea class="form-control @error('description') is-invalid @enderror" 
                                              id="description" name="description" rows="3" 
                                              placeholder="Tuliskan deskripsi silabus di sini">{{ old('description') }}</textarea>
                                    @error('description')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="objectives" class="form-label">Tujuan Pembelajaran</label>
                                    <textarea class="form-control @error('objectives') is-invalid @enderror" 
                                              id="objectives" name="objectives" rows="5" 
                                              placeholder="Tuliskan tujuan pembelajaran di sini">{{ old('objectives') }}</textarea>
                                    @error('objectives')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="materials" class="form-label">Materi Pembelajaran</label>
                                    <textarea class="form-control @error('materials') is-invalid @enderror" 
                                              id="materials" name="materials" rows="5" 
                                              placeholder="Tuliskan materi pembelajaran di sini">{{ old('materials') }}</textarea>
                                    @error('materials')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="activities" class="form-label">Kegiatan Pembelajaran</label>
                                    <textarea class="form-control @error('activities') is-invalid @enderror" 
                                              id="activities" name="activities" rows="5" 
                                              placeholder="Tuliskan kegiatan pembelajaran di sini">{{ old('activities') }}</textarea>
                                    @error('activities')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="assessment" class="form-label">Penilaian</label>
                                    <textarea class="form-control @error('assessment') is-invalid @enderror" 
                                              id="assessment" name="assessment" rows="5" 
                                              placeholder="Tuliskan metode penilaian di sini">{{ old('assessment') }}</textarea>
                                    @error('assessment')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="resources" class="form-label">Sumber Belajar</label>
                            <textarea class="form-control @error('resources') is-invalid @enderror" 
                                      id="resources" name="resources" rows="3" 
                                      placeholder="Tuliskan sumber belajar yang digunakan di sini">{{ old('resources') }}</textarea>
                            @error('resources')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('academic.syllabus') }}" class="btn btn-secondary">
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
