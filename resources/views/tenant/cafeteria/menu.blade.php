@extends('layouts.tenant')

@section('title', 'Menu Kafetaria')
@section('page-title', 'Menu Kafetaria')

@push('styles')
<style>
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);
        padding: 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
    }
    
    .page-header h2 {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
    }
    
    /* Modern Card Styles */
    .modern-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
        backdrop-filter: blur(10px);
    }
    
    .modern-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 1.5rem 2rem;
        border: none;
        font-weight: 700;
        font-size: 1.125rem;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
    }
    
    .modern-card-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .modern-card:hover .modern-card-header::before {
        left: 100%;
    }
    
    /* Table Styles */
    .table-modern {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
    }
    
    .table-modern thead th {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #495057;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 1px;
        padding: 1.25rem 1rem;
        border: none;
        border-bottom: 3px solid #f59e0b;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .table-modern tbody tr {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-left: 3px solid transparent;
    }
    
    .table-modern tbody tr:hover {
        background: linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);
        border-left-color: #f59e0b;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
    }
    
    .table-modern tbody td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
        font-size: 0.95rem;
    }
    
    /* Quick Action Buttons */
    .quick-action-btn {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.875rem 1.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }
    
    .quick-action-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        color: white;
    }
    
    .quick-action-btn.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
    
    .quick-action-btn.primary:hover {
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    
    /* Action Buttons */
    .btn-action {
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Page Header with Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 class="mb-2">
                            <i class="fas fa-utensils me-2"></i>
                            Menu Kafetaria
                        </h2>
                        <p class="text-muted mb-0">Kelola menu makanan dan minuman kafetaria</p>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="{{ tenant_route('cafeteria.index') }}" class="quick-action-btn" style="background: white; color: #f59e0b; border: 2px solid #f59e0b;">
                            <i class="fas fa-arrow-left"></i>
                            Kembali
                        </a>
                        <a href="{{ tenant_route('cafeteria.menu.create') }}" class="quick-action-btn primary">
                            <i class="fas fa-plus"></i>
                            Tambah Menu
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Menu Table -->
    <div class="row">
        <div class="col-12">
            <div class="modern-card">
                <div class="modern-card-header">
                    <i class="fas fa-list me-2"></i>
                    Daftar Menu
                </div>
                <div class="card-body p-0">
                    @if($menuItems->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-modern mb-0">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Menu</th>
                                        <th>Kategori</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($menuItems as $index => $item)
                                    <tr>
                                        <td>{{ $menuItems->firstItem() + $index }}</td>
                                        <td>
                                            <strong>{{ $item->name }}</strong>
                                            @if($item->description)
                                                <br><small class="text-muted">{{ Str::limit($item->description, 50) }}</small>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge bg-info text-capitalize">{{ $item->category }}</span>
                                        </td>
                                        <td>
                                            <strong class="text-primary">Rp {{ number_format($item->price, 0, ',', '.') }}</strong>
                                        </td>
                                        <td>
                                            @if($item->stock !== null)
                                                <span class="badge bg-secondary">{{ $item->stock }}</span>
                                            @else
                                                <span class="badge bg-success">Tidak Terbatas</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($item->is_available)
                                                <span class="badge bg-success px-3 py-2" style="font-weight: 600;">Tersedia</span>
                                            @else
                                                <span class="badge bg-danger px-3 py-2" style="font-weight: 600;">Tidak Tersedia</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="d-flex gap-2">
                                                <a href="{{ tenant_route('cafeteria.menu.edit', $item->id) }}" class="btn btn-sm btn-outline-primary btn-action" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ tenant_route('cafeteria.menu.destroy', $item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus menu ini?');">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-outline-danger btn-action" title="Hapus">
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
                        
                        <!-- Pagination -->
                        <div class="card-footer bg-white">
                            {{ $menuItems->links() }}
                        </div>
                    @else
                        <div class="text-center p-5">
                            <div class="mb-4">
                                <i class="fas fa-utensils fa-5x text-muted" style="opacity: 0.3;"></i>
                            </div>
                            <h5 class="text-muted mb-2" style="font-weight: 600;">Belum ada menu</h5>
                            <p class="text-muted mb-4">Mulai dengan menambahkan menu pertama</p>
                            <a href="{{ tenant_route('cafeteria.menu.create') }}" class="quick-action-btn primary">
                                <i class="fas fa-plus"></i>
                                Tambah Menu Pertama
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
