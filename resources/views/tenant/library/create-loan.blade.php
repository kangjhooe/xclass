@extends('layouts.tenant')

@section('title', 'Tambah Peminjaman')
@section('page-title', 'Tambah Data Peminjaman')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Tambah Data Peminjaman</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.loans') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <form action="{{ tenant_route('library.store-loan') }}" method="POST">
                @csrf
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="book_id">Buku <span class="text-danger">*</span></label>
                                <select name="book_id" id="book_id" class="form-control @error('book_id') is-invalid @enderror" required>
                                    <option value="">Pilih Buku</option>
                                    @foreach($books as $book)
                                        <option value="{{ $book->id }}" {{ old('book_id') == $book->id ? 'selected' : '' }}>
                                            {{ $book->title }} - {{ $book->author }} (Tersedia: {{ $book->available_copies }})
                                        </option>
                                    @endforeach
                                </select>
                                @error('book_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="student_id">Siswa <span class="text-danger">*</span></label>
                                <select name="student_id" id="student_id" class="form-control @error('student_id') is-invalid @enderror" required>
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
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="loan_date">Tanggal Pinjam <span class="text-danger">*</span></label>
                                <input type="date" name="loan_date" id="loan_date" class="form-control @error('loan_date') is-invalid @enderror" 
                                       value="{{ old('loan_date', date('Y-m-d')) }}" required>
                                @error('loan_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="due_date">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
                                <input type="date" name="due_date" id="due_date" class="form-control @error('due_date') is-invalid @enderror" 
                                       value="{{ old('due_date') }}" required>
                                @error('due_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" 
                                  rows="3" placeholder="Masukkan catatan (opsional)">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                    <a href="{{ tenant_route('library.loans') }}" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Set default due date to 7 days from loan date
    $('#loan_date').change(function() {
        const loanDate = new Date($(this).val());
        if (loanDate) {
            const dueDate = new Date(loanDate);
            dueDate.setDate(dueDate.getDate() + 7);
            $('#due_date').val(dueDate.toISOString().split('T')[0]);
        }
    });
    
    // Set initial due date if loan date is already set
    const loanDate = $('#loan_date').val();
    if (loanDate) {
        const dueDate = new Date(loanDate);
        dueDate.setDate(dueDate.getDate() + 7);
        $('#due_date').val(dueDate.toISOString().split('T')[0]);
    }
});
</script>
@endpush
