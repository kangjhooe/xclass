@extends('layouts.tenant')

@section('title', 'Tahun Pelajaran')
@section('page-title', 'Tahun Pelajaran')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar me-3"></i>
                Tahun Pelajaran
            </h2>
            <p>Kelola tahun pelajaran sekolah</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.academic-years.create') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-plus me-2"></i> Tambah Tahun Pelajaran
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="card-modern fade-in-up fade-in-up-delay-5">
            <div class="card-header">
                <h5>
                    <i class="fas fa-list me-2 text-primary"></i>
                    Daftar Tahun Pelajaran
                </h5>
            </div>
            <div class="card-body">
                @if($academicYears->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tahun Pelajaran</th>
                                    <th>Tanggal Mulai</th>
                                    <th>Tanggal Selesai</th>
                                    <th>Status</th>
                                    <th>Semester Aktif</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($academicYears as $index => $academicYear)
                                    <tr>
                                        <td>{{ $academicYears->firstItem() + $index }}</td>
                                        <td>
                                            <strong>{{ $academicYear->year_name }}</strong>
                                        </td>
                                        <td>{{ \App\Helpers\DateHelper::formatIndonesian($academicYear->start_date) }}</td>
                                        <td>{{ \App\Helpers\DateHelper::formatIndonesian($academicYear->end_date) }}</td>
                                        <td>
                                            @if($academicYear->is_active)
                                                <span class="badge bg-success">Aktif</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak Aktif</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($academicYear->is_active)
                                                @if($academicYear->current_semester == 1)
                                                    <span class="badge bg-primary">Ganjil</span>
                                                @else
                                                    <span class="badge bg-info">Genap</span>
                                                @endif
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <a href="{{ tenant_route('tenant.academic-years.show', $academicYear) }}" 
                                                   class="btn btn-modern btn-primary btn-sm"
                                                   title="Lihat Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.academic-years.edit', $academicYear) }}" 
                                                   class="btn btn-modern btn-warning btn-sm"
                                                   title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                @if($academicYear->is_active)
                                                    <div class="btn-group" role="group">
                                                        <button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle" 
                                                                data-bs-toggle="dropdown" 
                                                                aria-expanded="false"
                                                                title="Ubah Semester">
                                                            <i class="fas fa-calendar-alt"></i>
                                                        </button>
                                                        <ul class="dropdown-menu">
                                                            <li>
                                                                <form action="{{ tenant_route('tenant.academic-years.set-semester', $academicYear) }}" 
                                                                      method="POST" class="d-inline">
                                                                    @csrf
                                                                    <input type="hidden" name="semester" value="1">
                                                                    <button type="submit" 
                                                                            class="dropdown-item {{ $academicYear->current_semester == 1 ? 'active' : '' }}"
                                                                            onclick="return confirm('Ubah semester aktif menjadi Ganjil?')">
                                                                        <i class="fas fa-check-circle me-2"></i>Ganjil
                                                                    </button>
                                                                </form>
                                                            </li>
                                                            <li>
                                                                <form action="{{ tenant_route('tenant.academic-years.set-semester', $academicYear) }}" 
                                                                      method="POST" class="d-inline">
                                                                    @csrf
                                                                    <input type="hidden" name="semester" value="2">
                                                                    <button type="submit" 
                                                                            class="dropdown-item {{ $academicYear->current_semester == 2 ? 'active' : '' }}"
                                                                            onclick="return confirm('Ubah semester aktif menjadi Genap?')">
                                                                        <i class="fas fa-check-circle me-2"></i>Genap
                                                                    </button>
                                                                </form>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                @endif
                                                @if(!$academicYear->is_active)
                                                    <form action="{{ tenant_route('tenant.academic-years.set-active', $academicYear) }}" 
                                                          method="POST" class="d-inline">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-success"
                                                                onclick="return confirm('Aktifkan tahun pelajaran ini?')"
                                                                title="Aktifkan">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                    </form>
                                                @endif
                                                @if(!$academicYear->is_active)
                                                    <form action="{{ tenant_route('tenant.academic-years.destroy', $academicYear) }}" 
                                                          method="POST" class="d-inline"
                                                          onsubmit="return confirm('Hapus tahun pelajaran ini?')">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" class="btn btn-sm btn-outline-danger"
                                                                title="Hapus">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </form>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        {{ $academicYears->links() }}
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Belum ada tahun pelajaran</h5>
                        <p class="text-muted">Klik tombol "Tambah Tahun Pelajaran" untuk menambahkan tahun pelajaran pertama.</p>
                        <a href="{{ tenant_route('tenant.academic-years.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>
                            Tambah Tahun Pelajaran
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
