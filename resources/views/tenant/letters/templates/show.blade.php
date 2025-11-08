@extends('layouts.tenant')

@section('title', 'Detail Template Surat')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-file-alt me-2"></i>
                            {{ $letterTemplate->title }}
                        </h3>
                        <div class="btn-group">
                            <a href="{{ tenant_route('letters.templates.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-1"></i> Kembali
                            </a>
                            <a href="{{ tenant_route('letters.templates.edit', $letterTemplate) }}" class="btn btn-warning">
                                <i class="fas fa-edit me-1"></i> Edit
                            </a>
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a class="dropdown-item" href="{{ tenant_route('letters.templates.preview', $letterTemplate) }}" target="_blank">
                                            <i class="fas fa-external-link-alt me-1"></i> Preview
                                        </a>
                                    </li>
                                    <li>
                                        <form method="POST" action="{{ tenant_route('letters.templates.toggle-active', $letterTemplate) }}" style="display: inline;">
                                            @csrf
                                            <button type="submit" class="dropdown-item">
                                                <i class="fas fa-{{ $letterTemplate->is_active ? 'pause' : 'play' }} me-1"></i>
                                                {{ $letterTemplate->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                                            </button>
                                        </form>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <form method="POST" action="{{ tenant_route('letters.templates.destroy', $letterTemplate) }}" 
                                              onsubmit="return confirm('Apakah Anda yakin ingin menghapus template ini?')" style="display: inline;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="dropdown-item text-danger">
                                                <i class="fas fa-trash me-1"></i> Hapus
                                            </button>
                                        </form>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <!-- Template Info -->
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <table class="table table-borderless">
                                        <tr>
                                            <th width="120">Kategori:</th>
                                            <td>
                                                @if($letterTemplate->category)
                                                    <span class="badge bg-info">{{ $letterTemplate->category }}</span>
                                                @else
                                                    <span class="text-muted">-</span>
                                                @endif
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Status:</th>
                                            <td>
                                                <span class="badge bg-{{ $letterTemplate->is_active ? 'success' : 'secondary' }}">
                                                    {{ $letterTemplate->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Dibuat:</th>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($letterTemplate->created_at, true) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Diupdate:</th>
                                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($letterTemplate->updated_at, true) }}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    @if($letterTemplate->description)
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Deskripsi:</label>
                                            <p class="text-muted">{{ $letterTemplate->description }}</p>
                                        </div>
                                    @endif
                                </div>
                            </div>

                            <!-- Template Content -->
                            <div class="mb-4">
                                <label class="form-label fw-bold">Isi Template:</label>
                                <div class="border p-3 rounded" style="background: #f8f9fa; min-height: 200px;">
                                    {!! $letterTemplate->content !!}
                                </div>
                            </div>

                            <!-- Variables Used -->
                            @if(count($letterTemplate->getAvailableVariables()) > 0)
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Variabel yang Digunakan:</label>
                                    <div class="d-flex flex-wrap">
                                        @foreach($letterTemplate->getAvailableVariables() as $variable)
                                            <span class="badge bg-primary me-1 mb-1">
                                                <code>{{ $variable }}</code>
                                            </span>
                                        @endforeach
                                    </div>
                                </div>
                            @endif
                        </div>
                        
                        <div class="col-md-4">
                            <!-- Preview Section -->
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Preview dengan Variabel</h6>
                                </div>
                                <div class="card-body">
                                    <form id="previewForm">
                                        <div class="mb-3">
                                            <label class="form-label">Masukkan Nilai Variabel:</label>
                                            <div id="variable-inputs">
                                                @foreach($letterTemplate->getAvailableVariables() as $variable)
                                                    <div class="mb-2">
                                                        <label class="form-label small">{{ $variable }}:</label>
                                                        <input type="text" class="form-control form-control-sm" 
                                                               name="variables[{{ $variable }}]" 
                                                               placeholder="Masukkan nilai untuk {{ $variable }}">
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-primary btn-sm w-100" onclick="previewWithVariables()">
                                            <i class="fas fa-eye me-1"></i> Preview
                                        </button>
                                    </form>
                                    
                                    <div id="preview-result" class="mt-3" style="display: none;">
                                        <!-- Preview content will be loaded here -->
                                    </div>
                                </div>
                            </div>

                            <!-- Available Variables -->
                            <div class="card mt-3">
                                <div class="card-header">
                                    <h6 class="card-title mb-0">Variabel yang Tersedia</h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <h6 class="text-primary">Variabel Umum</h6>
                                        @foreach($defaultVariables as $key => $desc)
                                            <div class="small text-muted mb-1">
                                                <code>{{ $key }}</code> - {{ $desc }}
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function previewWithVariables() {
    const form = document.getElementById('previewForm');
    const formData = new FormData(form);
    const variables = {};
    
    // Collect variable values
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('variables[')) {
            const varName = key.match(/variables\[(.+)\]/)[1];
            variables[varName] = value;
        }
    }
    
    // Show loading
    const previewResult = document.getElementById('preview-result');
    previewResult.style.display = 'block';
    previewResult.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin me-1"></i>
            Memproses preview...
        </div>
    `;
    
    // Send AJAX request
    fetch('{{ route("tenant.letters.templates.preview", $letterTemplate) }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({ variables: variables })
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            previewResult.innerHTML = `
                <div class="border p-3 rounded" style="background: #f8f9fa;">
                    <h6>Hasil Preview:</h6>
                    <div style="white-space: pre-wrap; font-family: monospace;">${data.content}</div>
                </div>
            `;
        } else {
            previewResult.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Error: ${data.error || 'Gagal memproses preview'}
                </div>
            `;
        }
    })
    .catch(error => {
        previewResult.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Error: Gagal memproses preview
            </div>
        `;
    });
}
</script>
@endsection