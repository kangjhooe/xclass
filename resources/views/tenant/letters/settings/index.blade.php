@extends('layouts.tenant')

@section('title', 'Pengaturan Nomor Surat')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-cog text-primary me-2"></i>
                            Pengaturan Nomor Surat
                        </h3>
                        <div class="btn-group">
                            <a href="{{ tenant_route('tenant.letters.settings.number-settings.create') }}" 
                               class="btn btn-primary btn-sm">
                                <i class="fas fa-plus"></i> Tambah Pengaturan
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <!-- Table -->
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th width="5%">No</th>
                                    <th width="20%">Jenis Surat</th>
                                    <th width="25%">Format Nomor</th>
                                    <th width="15%">Nomor Terakhir</th>
                                    <th width="10%">Reset Tahunan</th>
                                    <th width="10%">Kode Lembaga</th>
                                    <th width="15%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($settings as $setting)
                                <tr>
                                    <td class="text-center">{{ $loop->iteration }}</td>
                                    <td>
                                        <strong>{{ $setting->jenis_surat }}</strong>
                                        @if($setting->deskripsi)
                                            <br><small class="text-muted">{{ $setting->deskripsi }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <code>{{ $setting->format_nomor }}</code>
                                        <br><small class="text-muted">Contoh: {{ $setting->example_format }}</small>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge bg-info">{{ $setting->nomor_terakhir }}</span>
                                        <br><small class="text-muted">Berikutnya: {{ $setting->next_number }}</small>
                                    </td>
                                    <td class="text-center">
                                        @if($setting->reset_tahunan)
                                            <span class="badge bg-success">Ya</span>
                                        @else
                                            <span class="badge bg-secondary">Tidak</span>
                                        @endif
                                    </td>
                                    <td class="text-center">
                                        <code>{{ $setting->kode_lembaga ?? '-' }}</code>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm" role="group">
                                            <a href="{{ tenant_route('tenant.letters.settings.number-settings.show', $setting) }}" 
                                               class="btn btn-outline-primary btn-sm" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('tenant.letters.settings.number-settings.edit', $setting) }}" 
                                               class="btn btn-outline-warning btn-sm" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <form action="{{ tenant_route('tenant.letters.settings.number-settings.reset-counter', $setting) }}" 
                                                  method="POST" class="d-inline" 
                                                  onsubmit="return confirm('Apakah Anda yakin ingin mereset counter nomor surat ini?')">
                                                @csrf
                                                <button type="submit" class="btn btn-outline-info btn-sm" title="Reset Counter">
                                                    <i class="fas fa-redo"></i>
                                                </button>
                                            </form>
                                            <form action="{{ tenant_route('tenant.letters.settings.number-settings.destroy', $setting) }}" 
                                                  method="POST" class="d-inline" 
                                                  onsubmit="return confirm('Apakah Anda yakin ingin menghapus pengaturan ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-outline-danger btn-sm" title="Hapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="7" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="fas fa-cog fa-3x mb-3"></i>
                                            <br>Belum ada pengaturan nomor surat
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    @if($settings->count() > 0)
                        <div class="mt-3">
                            <form action="{{ tenant_route('tenant.letters.settings.number-settings.reset-all-counters') }}" 
                                  method="POST" 
                                  onsubmit="return confirm('Apakah Anda yakin ingin mereset semua counter untuk tahun baru?')">
                                @csrf
                                <button type="submit" class="btn btn-warning">
                                    <i class="fas fa-calendar-alt"></i> Reset Semua Counter untuk Tahun Baru
                                </button>
                            </form>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection