@extends('layouts.tenant')

@section('title', 'Mata Pelajaran')
@section('page-title', 'Mata Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-book me-3"></i>
                Mata Pelajaran
            </h2>
            <p>Kelola mata pelajaran sekolah Anda</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.subjects.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Mata Pelajaran
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Mata Pelajaran
                </h5>
            </div>
            <div class="card-body">
                @if($subjects->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama Mata Pelajaran</th>
                                    <th>Level</th>
                                    <th>Kategori</th>
                                    <th>SKS</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($subjects as $subject)
                                    <tr>
                                        <td>
                                            <span class="badge bg-info">{{ $subject->code }}</span>
                                        </td>
                                        <td>
                                            <strong>{{ $subject->name }}</strong>
                                            @if($subject->description)
                                                <br><small class="text-muted">{{ $subject->description }}</small>
                                            @endif
                                        </td>
                                        <td>{{ $subject->level ?? '-' }}</td>
                                        <td>{{ $subject->category ?? '-' }}</td>
                                        <td>{{ $subject->credits }}</td>
                                        <td>
                                            <span class="badge bg-{{ $subject->is_active ? 'success' : 'secondary' }}">
                                                {{ $subject->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <a href="{{ tenant_route('tenant.subjects.show', $subject) }}" 
                                                   class="btn btn-modern btn-primary btn-sm" title="Lihat">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.subjects.edit', $subject) }}" 
                                                   class="btn btn-modern btn-warning btn-sm" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('tenant.subjects.destroy', $subject) }}" 
                                                      method="POST" class="d-inline"
                                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-modern btn-danger btn-sm" title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        {{ $subjects->links() }}
                    </div>
                @else
                    <div class="text-center py-4">
                        <i class="fas fa-book fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada mata pelajaran</h5>
                        <p class="text-muted">Mulai dengan menambahkan mata pelajaran pertama</p>
                        <a href="{{ tenant_route('tenant.subjects.create') }}" class="btn btn-modern btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Tambah Mata Pelajaran
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
