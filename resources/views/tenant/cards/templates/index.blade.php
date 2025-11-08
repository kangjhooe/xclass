@extends('layouts.tenant')

@section('title', 'Template Kartu')
@section('page-title', 'Template Kartu')

@section('content')
<div class="row mb-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h4 class="mb-1">
                    <i class="fas fa-palette me-2"></i>
                    Template Kartu
                </h4>
                <p class="text-muted mb-0">Kelola template kartu tanda</p>
            </div>
            <a href="{{ tenant_route('tenant.cards.index') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left me-1"></i>
                Kembali
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-body">
                @if($templates->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Jenis</th>
                                    <th>Foto</th>
                                    <th>Barcode</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($templates as $template)
                                    <tr>
                                        <td>{{ $template->name }}</td>
                                        <td>
                                            @if($template->card_type == 'student')
                                                <span class="badge bg-primary">Siswa</span>
                                            @elseif($template->card_type == 'teacher')
                                                <span class="badge bg-success">Guru</span>
                                            @else
                                                <span class="badge bg-info">Staf</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($template->has_photo)
                                                <span class="badge bg-success">Ya</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($template->has_barcode)
                                                <span class="badge bg-success">Ya</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($template->is_active)
                                                <span class="badge bg-success">Aktif</span>
                                            @else
                                                <span class="badge bg-secondary">Tidak Aktif</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <a href="{{ tenant_route('tenant.cards.templates.show', $template) }}" class="btn btn-info" title="Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.cards.templates.customize', $template) }}" class="btn btn-warning" title="Kustomisasi">
                                                    <i class="fas fa-paint-brush"></i>
                                                </a>
                                                <a href="{{ tenant_route('tenant.cards.templates.preview', $template) }}" class="btn btn-success" title="Preview">
                                                    <i class="fas fa-image"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-3">
                        {{ $templates->links() }}
                    </div>
                @else
                    <div class="text-center py-5">
                        <i class="fas fa-palette fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Belum ada template tersedia</p>
                        <p class="text-muted small">Template default akan dibuat saat pertama kali menggunakan fitur kartu</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection

