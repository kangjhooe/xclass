@extends('layouts.tenant')

@section('title', 'Surat Masuk')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-inbox text-primary me-2"></i>
                            Daftar Surat Masuk
                        </h3>
                        <div class="btn-group">
                            <div class="dropdown">
                                <button class="btn btn-success btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-download"></i> Export
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="{{ tenant_route('letters.incoming.export', array_merge(request()->query(), ['format' => 'excel'])) }}">
                                        <i class="fas fa-file-excel text-success me-2"></i> Excel
                                    </a></li>
                                    <li><a class="dropdown-item" href="{{ tenant_route('letters.incoming.export', array_merge(request()->query(), ['format' => 'pdf'])) }}">
                                        <i class="fas fa-file-pdf text-danger me-2"></i> PDF
                                    </a></li>
                                    <li><a class="dropdown-item" href="{{ tenant_route('letters.incoming.export', array_merge(request()->query(), ['format' => 'csv'])) }}">
                                        <i class="fas fa-file-csv text-info me-2"></i> CSV
                                    </a></li>
                                </ul>
                            </div>
                            <a href="{{ tenant_route('letters.incoming.print', request()->query()) }}" 
                               class="btn btn-info btn-sm">
                                <i class="fas fa-print"></i> Cetak
                            </a>
                            <a href="{{ tenant_route('letters.incoming.create') }}" 
                               class="btn btn-primary btn-sm">
                                <i class="fas fa-plus"></i> Tambah Surat Masuk
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <div class="bg-light p-4 rounded mb-4 shadow-sm">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0">
                                <i class="fas fa-filter me-2"></i>Filter & Pencarian
                            </h6>
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="toggleAdvancedSearch()">
                                <i class="fas fa-cog me-1"></i> Pencarian Lanjutan
                            </button>
                        </div>
                        <form method="GET" class="row g-3">
                            <div class="col-md-3">
                                <label for="search" class="form-label fw-bold">Pencarian</label>
                                <div class="position-relative">
                                    <input type="text" class="form-control" id="search" name="search" 
                                           value="{{ request('search') }}" 
                                           placeholder="Nomor surat, pengirim, atau perihal"
                                           autocomplete="off">
                                    <div class="position-absolute top-50 end-0 translate-middle-y pe-3">
                                        <i class="fas fa-search text-muted"></i>
                                    </div>
                                    <div id="searchSuggestions" class="position-absolute w-100 bg-white border rounded shadow-lg" 
                                         style="top: 100%; z-index: 1000; display: none; max-height: 200px; overflow-y: auto;">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <label for="status" class="form-label fw-bold">Status</label>
                                <select class="form-select" id="status" name="status">
                                    <option value="">Semua Status</option>
                                    <option value="baru" {{ request('status') == 'baru' ? 'selected' : '' }}>Baru</option>
                                    <option value="diproses" {{ request('status') == 'diproses' ? 'selected' : '' }}>Diproses</option>
                                    <option value="selesai" {{ request('status') == 'selesai' ? 'selected' : '' }}>Selesai</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="jenis_surat" class="form-label fw-bold">Jenis Surat</label>
                                <select class="form-select" id="jenis_surat" name="jenis_surat">
                                    <option value="">Semua Jenis</option>
                                    @foreach(\App\Models\Tenant\IncomingLetter::getJenisSuratOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ request('jenis_surat') == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="prioritas" class="form-label fw-bold">Prioritas</label>
                                <select class="form-select" id="prioritas" name="prioritas">
                                    <option value="">Semua Prioritas</option>
                                    @foreach(\App\Models\Tenant\IncomingLetter::getPrioritasOptions() as $value => $label)
                                        <option value="{{ $value }}" {{ request('prioritas') == $value ? 'selected' : '' }}>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="start_date" class="form-label fw-bold">Tanggal Mulai</label>
                                <input type="date" class="form-control" id="start_date" name="start_date" 
                                       value="{{ request('start_date') }}">
                            </div>
                            <div class="col-md-2">
                                <label for="end_date" class="form-label fw-bold">Tanggal Akhir</label>
                                <input type="date" class="form-control" id="end_date" name="end_date" 
                                       value="{{ request('end_date') }}">
                            </div>
                            <!-- Advanced Search Fields (Hidden by default) -->
                            <div id="advancedSearchFields" class="col-12" style="display: none;">
                                <hr>
                                <h6 class="mb-3">Pencarian Lanjutan</h6>
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label for="sifat_surat" class="form-label fw-bold">Sifat Surat</label>
                                        <select class="form-select" id="sifat_surat" name="sifat_surat">
                                            <option value="">Semua Sifat</option>
                                            @foreach(\App\Models\Tenant\IncomingLetter::getSifatSuratOptions() as $value => $label)
                                                <option value="{{ $value }}" {{ request('sifat_surat') == $value ? 'selected' : '' }}>
                                                    {{ $label }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="created_by" class="form-label fw-bold">Dibuat Oleh</label>
                                        <input type="text" class="form-control" id="created_by" name="created_by" 
                                               value="{{ request('created_by') }}" 
                                               placeholder="Nama pembuat surat">
                                    </div>
                                    <div class="col-md-4">
                                        <label for="has_file" class="form-label fw-bold">Lampiran</label>
                                        <select class="form-select" id="has_file" name="has_file">
                                            <option value="">Semua</option>
                                            <option value="1" {{ request('has_file') == '1' ? 'selected' : '' }}>Ada Lampiran</option>
                                            <option value="0" {{ request('has_file') == '0' ? 'selected' : '' }}>Tidak Ada Lampiran</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-12">
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-search"></i> Filter
                                    </button>
                                    <a href="{{ tenant_route('letters.incoming.index') }}" class="btn btn-secondary">
                                        <i class="fas fa-times"></i> Reset
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Bulk Actions -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="selectAll()">
                                    <i class="fas fa-check-square"></i> Pilih Semua
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="deselectAll()">
                                    <i class="fas fa-square"></i> Batal Pilih
                                </button>
                                <button type="button" class="btn btn-outline-success btn-sm" onclick="bulkUpdateStatus('diproses')">
                                    <i class="fas fa-play"></i> Proses Terpilih
                                </button>
                                <button type="button" class="btn btn-outline-warning btn-sm" onclick="bulkUpdateStatus('selesai')">
                                    <i class="fas fa-check"></i> Selesai Terpilih
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6 text-end">
                            <span class="text-muted" id="selectedCount">0 surat dipilih</span>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th width="3%">
                                        <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll()">
                                    </th>
                                    <th width="5%">No</th>
                                    <th width="15%">Nomor Surat</th>
                                    <th width="12%">Tanggal Terima</th>
                                    <th width="15%">Pengirim</th>
                                    <th width="20%">Perihal</th>
                                    <th width="10%">Jenis</th>
                                    <th width="8%">Prioritas</th>
                                    <th width="8%">Status</th>
                                    <th width="7%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($letters as $letter)
                                <tr>
                                    <td class="text-center">
                                        <input type="checkbox" class="letter-checkbox" value="{{ $letter->id }}" onchange="updateSelectedCount()">
                                    </td>
                                    <td class="text-center">{{ $letters->firstItem() + $loop->index }}</td>
                                    <td>
                                        <strong>{{ $letter->nomor_surat }}</strong>
                                        @if($letter->file_path)
                                            <br><small class="text-muted">
                                                <i class="fas fa-paperclip"></i> Ada lampiran
                                            </small>
                                        @endif
                                    </td>
                                    <td>{{ \App\Helpers\DateHelper::formatIndonesian($letter->tanggal_terima) }}</td>
                                    <td>{{ $letter->pengirim }}</td>
                                    <td>
                                        <div class="text-truncate" style="max-width: 200px;" title="{{ $letter->perihal }}">
                                            {{ $letter->perihal }}
                                        </div>
                                        @if($letter->isi_ringkas)
                                            <br><small class="text-muted">{{ Str::limit($letter->isi_ringkas, 50) }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge bg-info">{{ $letter->jenis_surat ?? '-' }}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $letter->prioritas_color }}">
                                            {{ $letter->prioritas_label ?? '-' }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $letter->status_color }}">
                                            {{ $letter->status_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm" role="group">
                                            <a href="{{ tenant_route('letters.incoming.show', $letter) }}" 
                                               class="btn btn-outline-primary btn-sm" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ tenant_route('letters.incoming.edit', $letter) }}" 
                                               class="btn btn-outline-warning btn-sm" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            @if($letter->file_path)
                                                <a href="{{ tenant_route('letters.incoming.download', $letter) }}" 
                                                   class="btn btn-outline-success btn-sm" title="Download">
                                                    <i class="fas fa-download"></i>
                                                </a>
                                            @endif
                                            <a href="{{ tenant_route('letters.incoming.activity-logs', $letter) }}" 
                                               class="btn btn-outline-info btn-sm" title="Log Aktivitas">
                                                <i class="fas fa-history"></i>
                                            </a>
                                            <form action="{{ tenant_route('letters.incoming.destroy', $letter) }}" 
                                                  method="POST" class="d-inline" 
                                                  onsubmit="return confirm('Apakah Anda yakin ingin menghapus surat ini?')">
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
                                    <td colspan="9" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="fas fa-inbox fa-3x mb-3"></i>
                                            <br>Tidak ada surat masuk
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    @if($letters->hasPages())
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="text-muted">
                                Menampilkan {{ $letters->firstItem() }} sampai {{ $letters->lastItem() }} 
                                dari {{ $letters->total() }} data
                            </div>
                            <div>
                                {{ $letters->links() }}
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function selectAll() {
    const checkboxes = document.querySelectorAll('.letter-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = true);
    document.getElementById('selectAllCheckbox').checked = true;
    updateSelectedCount();
}

function deselectAll() {
    const checkboxes = document.querySelectorAll('.letter-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    document.getElementById('selectAllCheckbox').checked = false;
    updateSelectedCount();
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.letter-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
    updateSelectedCount();
}

function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.letter-checkbox:checked');
    const count = selectedCheckboxes.length;
    document.getElementById('selectedCount').textContent = `${count} surat dipilih`;
    
    // Update select all checkbox state
    const allCheckboxes = document.querySelectorAll('.letter-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (count === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (count === allCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function bulkUpdateStatus(status) {
    const selectedCheckboxes = document.querySelectorAll('.letter-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Pilih surat yang akan diupdate statusnya');
        return;
    }
    
    const letterIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    const statusText = status === 'diproses' ? 'diproses' : 'selesai';
    
    if (confirm(`Apakah Anda yakin ingin mengubah status ${letterIds.length} surat menjadi ${statusText}?`)) {
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '{{ tenant_route("tenant.letters.incoming.bulk-status") }}';
        
        const csrfToken = document.createElement('input');
        csrfToken.type = 'hidden';
        csrfToken.name = '_token';
        csrfToken.value = '{{ csrf_token() }}';
        
        const statusInput = document.createElement('input');
        statusInput.type = 'hidden';
        statusInput.name = 'status';
        statusInput.value = status;
        
        const idsInput = document.createElement('input');
        idsInput.type = 'hidden';
        idsInput.name = 'letter_ids';
        idsInput.value = JSON.stringify(letterIds);
        
        form.appendChild(csrfToken);
        form.appendChild(statusInput);
        form.appendChild(idsInput);
        document.body.appendChild(form);
        form.submit();
    }
}

function toggleAdvancedSearch() {
    const advancedFields = document.getElementById('advancedSearchFields');
    const button = event.target;
    
    if (advancedFields.style.display === 'none') {
        advancedFields.style.display = 'block';
        button.innerHTML = '<i class="fas fa-cog me-1"></i> Sembunyikan Pencarian Lanjutan';
    } else {
        advancedFields.style.display = 'none';
        button.innerHTML = '<i class="fas fa-cog me-1"></i> Pencarian Lanjutan';
    }
}

// Search autocomplete
let searchTimeout;
document.getElementById('search').addEventListener('input', function() {
    const query = this.value;
    const suggestions = document.getElementById('searchSuggestions');
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }
    
    searchTimeout = setTimeout(() => {
        fetch(`{{ tenant_route('letters.incoming.search-suggestions') }}?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    suggestions.innerHTML = data.map(item => 
                        `<div class="p-2 border-bottom suggestion-item" style="cursor: pointer;" 
                             onclick="selectSuggestion('${item.text}')">
                            <div class="fw-bold">${item.text}</div>
                            <small class="text-muted">${item.type}</small>
                         </div>`
                    ).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                suggestions.style.display = 'none';
            });
    }, 300);
});

function selectSuggestion(text) {
    document.getElementById('search').value = text;
    document.getElementById('searchSuggestions').style.display = 'none';
}

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('#search') && !e.target.closest('#searchSuggestions')) {
        document.getElementById('searchSuggestions').style.display = 'none';
    }
});
</script>
@endsection
