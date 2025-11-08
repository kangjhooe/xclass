@extends('layouts.tenant')

@section('title', 'Tambah Rekam Medis')
@section('page-title', 'Tambah Rekam Medis')

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
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .form-control:focus, .form-select:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25);
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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
                    Form Tambah Rekam Medis
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

                    <form action="{{ tenant_route('health.records.store') }}" method="POST">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select class="form-select @error('student_id') is-invalid @enderror" 
                                            id="student_id" name="student_id" required>
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

                                <div class="mb-3">
                                    <label for="checkup_date" class="form-label">Tanggal Pemeriksaan <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('checkup_date') is-invalid @enderror" 
                                           id="checkup_date" name="checkup_date" value="{{ old('checkup_date', date('Y-m-d')) }}" required>
                                    @error('checkup_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="health_status" class="form-label">Status Kesehatan <span class="text-danger">*</span></label>
                                    <select class="form-select @error('health_status') is-invalid @enderror" 
                                            id="health_status" name="health_status" required>
                                        <option value="">Pilih Status Kesehatan</option>
                                        <option value="healthy" {{ old('health_status') == 'healthy' ? 'selected' : '' }}>Sehat</option>
                                        <option value="sick" {{ old('health_status') == 'sick' ? 'selected' : '' }}>Sakit</option>
                                        <option value="recovering" {{ old('health_status') == 'recovering' ? 'selected' : '' }}>Pulih</option>
                                    </select>
                                    @error('health_status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="height" class="form-label">Tinggi Badan (cm)</label>
                                    <input type="number" class="form-control @error('height') is-invalid @enderror" 
                                           id="height" name="height" value="{{ old('height') }}" min="0" step="0.1">
                                    @error('height')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="weight" class="form-label">Berat Badan (kg)</label>
                                    <input type="number" class="form-control @error('weight') is-invalid @enderror" 
                                           id="weight" name="weight" value="{{ old('weight') }}" min="0" step="0.1">
                                    @error('weight')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="blood_pressure" class="form-label">Tekanan Darah</label>
                                    <input type="text" class="form-control @error('blood_pressure') is-invalid @enderror" 
                                           id="blood_pressure" name="blood_pressure" value="{{ old('blood_pressure') }}" 
                                           placeholder="120/80">
                                    @error('blood_pressure')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="temperature" class="form-label">Suhu Tubuh (°C)</label>
                                    <input type="number" class="form-control @error('temperature') is-invalid @enderror" 
                                           id="temperature" name="temperature" value="{{ old('temperature') }}" 
                                           min="0" step="0.1" placeholder="36.5">
                                    @error('temperature')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="symptoms" class="form-label">Gejala</label>
                                    <textarea class="form-control @error('symptoms') is-invalid @enderror" 
                                              id="symptoms" name="symptoms" rows="3" 
                                              placeholder="Deskripsikan gejala yang dialami">{{ old('symptoms') }}</textarea>
                                    @error('symptoms')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="diagnosis" class="form-label">Diagnosis</label>
                                    <textarea class="form-control @error('diagnosis') is-invalid @enderror" 
                                              id="diagnosis" name="diagnosis" rows="3" 
                                              placeholder="Diagnosis medis">{{ old('diagnosis') }}</textarea>
                                    @error('diagnosis')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="treatment" class="form-label">Perawatan</label>
                                    <textarea class="form-control @error('treatment') is-invalid @enderror" 
                                              id="treatment" name="treatment" rows="3" 
                                              placeholder="Perawatan yang diberikan">{{ old('treatment') }}</textarea>
                                    @error('treatment')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="medication" class="form-label">Obat-obatan</label>
                                    <textarea class="form-control @error('medication') is-invalid @enderror" 
                                              id="medication" name="medication" rows="3" 
                                              placeholder="Obat-obatan yang diberikan">{{ old('medication') }}</textarea>
                                    @error('medication')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="follow_up_date" class="form-label">Tanggal Tindak Lanjut</label>
                                    <input type="date" class="form-control @error('follow_up_date') is-invalid @enderror" 
                                           id="follow_up_date" name="follow_up_date" value="{{ old('follow_up_date') }}">
                                    @error('follow_up_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan Tambahan</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" 
                                      id="notes" name="notes" rows="4" 
                                      placeholder="Catatan tambahan tentang kondisi kesehatan siswa">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('health.records') }}" class="btn btn-secondary">
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
