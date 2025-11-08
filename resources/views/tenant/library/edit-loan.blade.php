@extends('layouts.tenant')

@section('title', 'Edit Peminjaman')
@section('page-title', 'Edit Data Peminjaman')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Edit Data Peminjaman</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('library.show-loan', $loan->id) }}" class="btn btn-info btn-sm">
                        <i class="fas fa-eye"></i> Lihat Detail
                    </a>
                    <a href="{{ tenant_route('library.loans') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <form action="{{ tenant_route('library.update-loan', $loan->id) }}" method="POST">
                @csrf
                @method('PUT')
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="book_id">Buku <span class="text-danger">*</span></label>
                                <select name="book_id" id="book_id" class="form-control @error('book_id') is-invalid @enderror" required>
                                    <option value="">Pilih Buku</option>
                                    @foreach($books as $book)
                                        <option value="{{ $book->id }}" {{ old('book_id', $loan->book_id) == $book->id ? 'selected' : '' }}>
                                            {{ $book->title }} - {{ $book->author }}
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
                                        <option value="{{ $student->id }}" {{ old('student_id', $loan->student_id) == $student->id ? 'selected' : '' }}>
                                            {{ $student->name }} - {{ $student->student_number ?? $student->nisn ?? '' }}
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
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="loan_date">Tanggal Pinjam <span class="text-danger">*</span></label>
                                <input type="datetime-local" name="loan_date" id="loan_date" class="form-control @error('loan_date') is-invalid @enderror" 
                                       value="{{ old('loan_date', $loan->loan_date ? \Carbon\Carbon::parse($loan->loan_date)->format('Y-m-d\TH:i') : '') }}" required>
                                @error('loan_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="due_date">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
                                <input type="date" name="due_date" id="due_date" class="form-control @error('due_date') is-invalid @enderror" 
                                       value="{{ old('due_date', $loan->due_date ? \Carbon\Carbon::parse($loan->due_date)->format('Y-m-d') : '') }}" required>
                                @error('due_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="status">Status <span class="text-danger">*</span></label>
                                <select name="status" id="status" class="form-control @error('status') is-invalid @enderror" required>
                                    <option value="active" {{ old('status', $loan->status) == 'active' ? 'selected' : '' }}>Aktif</option>
                                    <option value="returned" {{ old('status', $loan->status) == 'returned' ? 'selected' : '' }}>Dikembalikan</option>
                                    <option value="overdue" {{ old('status', $loan->status) == 'overdue' ? 'selected' : '' }}>Terlambat</option>
                                    <option value="lost" {{ old('status', $loan->status) == 'lost' ? 'selected' : '' }}>Hilang</option>
                                    <option value="damaged" {{ old('status', $loan->status) == 'damaged' ? 'selected' : '' }}>Rusak</option>
                                </select>
                                @error('status')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" 
                                  rows="3" placeholder="Masukkan catatan (opsional)">{{ old('notes', $loan->loan_notes) }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan Perubahan
                    </button>
                    <a href="{{ tenant_route('library.show-loan', $loan->id) }}" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

