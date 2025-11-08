@extends('layouts.tenant')

@section('title', 'Tambah SPP')
@section('page-title', 'Tambah Data SPP')

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
    
    .input-group-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
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
                            <i class="fas fa-file-invoice me-2"></i>Tambah Data SPP
                        </h3>
                        <a href="{{ tenant_route('spp.index') }}" class="btn btn-light btn-sm">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
                <form action="{{ tenant_route('spp.store') }}" method="POST">
                    @csrf
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select name="student_id" id="student_id" class="form-select @error('student_id') is-invalid @enderror" required>
                                        <option value="">Pilih Siswa</option>
                                        @foreach($students as $student)
                                            <option value="{{ $student->id }}" {{ old('student_id') == $student->id ? 'selected' : '' }}>
                                                {{ $student->name }} - {{ $student->student_number }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('student_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="academic_year_id" class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                                    <select name="academic_year_id" id="academic_year_id" class="form-select @error('academic_year_id') is-invalid @enderror" required>
                                        <option value="">Pilih Tahun Ajaran</option>
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
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="month" class="form-label">Bulan <span class="text-danger">*</span></label>
                                    <select name="month" id="month" class="form-select @error('month') is-invalid @enderror" required>
                                        <option value="">Pilih Bulan</option>
                                        <option value="1" {{ old('month') == '1' ? 'selected' : '' }}>Januari</option>
                                        <option value="2" {{ old('month') == '2' ? 'selected' : '' }}>Februari</option>
                                        <option value="3" {{ old('month') == '3' ? 'selected' : '' }}>Maret</option>
                                        <option value="4" {{ old('month') == '4' ? 'selected' : '' }}>April</option>
                                        <option value="5" {{ old('month') == '5' ? 'selected' : '' }}>Mei</option>
                                        <option value="6" {{ old('month') == '6' ? 'selected' : '' }}>Juni</option>
                                        <option value="7" {{ old('month') == '7' ? 'selected' : '' }}>Juli</option>
                                        <option value="8" {{ old('month') == '8' ? 'selected' : '' }}>Agustus</option>
                                        <option value="9" {{ old('month') == '9' ? 'selected' : '' }}>September</option>
                                        <option value="10" {{ old('month') == '10' ? 'selected' : '' }}>Oktober</option>
                                        <option value="11" {{ old('month') == '11' ? 'selected' : '' }}>November</option>
                                        <option value="12" {{ old('month') == '12' ? 'selected' : '' }}>Desember</option>
                                    </select>
                                    @error('month')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="amount" class="form-label">Jumlah SPP <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">Rp</span>
                                        <input type="number" name="amount" id="amount" class="form-control @error('amount') is-invalid @enderror" 
                                               value="{{ old('amount') }}" placeholder="Masukkan jumlah SPP" required>
                                    </div>
                                    @error('amount')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="due_date" class="form-label">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
                                    <input type="date" name="due_date" id="due_date" class="form-control @error('due_date') is-invalid @enderror" 
                                           value="{{ old('due_date') }}" required>
                                    @error('due_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status</label>
                                    <select name="status" id="status" class="form-select @error('status') is-invalid @enderror">
                                        <option value="unpaid" {{ old('status') == 'unpaid' ? 'selected' : '' }}>Belum Bayar</option>
                                        <option value="paid" {{ old('status') == 'paid' ? 'selected' : '' }}>Sudah Bayar</option>
                                        <option value="overdue" {{ old('status') == 'overdue' ? 'selected' : '' }}>Terlambat</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan</label>
                            <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" 
                                      rows="3" placeholder="Masukkan catatan (opsional)">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('spp.index') }}" class="btn btn-secondary">
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
$(document).ready(function() {
    // Set default due date to end of month
    $('#month').change(function() {
        const month = $(this).val();
        const year = new Date().getFullYear();
        if (month) {
            const lastDay = new Date(year, month, 0).getDate();
            $('#due_date').val(`${year}-${month.toString().padStart(2, '0')}-${lastDay}`);
        }
    });
});
</script>
@endpush
