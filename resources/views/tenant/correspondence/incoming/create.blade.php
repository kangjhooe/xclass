@extends('layouts.tenant')

@section('title', 'Tambah Surat Masuk')
@section('page-title', 'Tambah Surat Masuk')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus-circle me-2"></i>
                        Form Tambah Surat Masuk
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

                    <form action="{{ tenant_route('correspondence.incoming.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="letter_number" class="form-label">Nomor Surat <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('letter_number') is-invalid @enderror" 
                                           id="letter_number" name="letter_number" value="{{ old('letter_number') }}" required>
                                    @error('letter_number')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="letter_date" class="form-label">Tanggal Surat <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('letter_date') is-invalid @enderror" 
                                           id="letter_date" name="letter_date" value="{{ old('letter_date') }}" required>
                                    @error('letter_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="received_date" class="form-label">Tanggal Diterima <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('received_date') is-invalid @enderror" 
                                           id="received_date" name="received_date" value="{{ old('received_date', date('Y-m-d')) }}" required>
                                    @error('received_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="sender" class="form-label">Pengirim <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('sender') is-invalid @enderror" 
                                           id="sender" name="sender" value="{{ old('sender') }}" required>
                                    @error('sender')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="subject" class="form-label">Perihal <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('subject') is-invalid @enderror" 
                                           id="subject" name="subject" value="{{ old('subject') }}" required>
                                    @error('subject')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" 
                                            id="status" name="status" required>
                                        <option value="">Pilih Status</option>
                                        <option value="new" {{ old('status') == 'new' ? 'selected' : '' }}>Baru</option>
                                        <option value="processed" {{ old('status') == 'processed' ? 'selected' : '' }}>Diproses</option>
                                        <option value="archived" {{ old('status') == 'archived' ? 'selected' : '' }}>Diarsipkan</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="file" class="form-label">File Surat</label>
                                    <input type="file" class="form-control @error('file') is-invalid @enderror" 
                                           id="file" name="file" accept=".pdf,.doc,.docx">
                                    @error('file')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Format: PDF, DOC, DOCX. Maksimal 10MB</div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="content" class="form-label">Isi Surat</label>
                            <div id="content-editor-container">
                                <textarea class="form-control @error('content') is-invalid @enderror" 
                                          id="content" name="content" rows="10" 
                                          placeholder="Tuliskan isi surat di sini">{{ old('content') }}</textarea>
                            </div>
                            @error('content')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ tenant_route('correspondence.incoming') }}" class="btn btn-secondary">
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
