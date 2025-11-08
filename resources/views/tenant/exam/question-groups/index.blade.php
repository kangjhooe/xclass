@extends('layouts.tenant')

@section('title', 'Kelompok Soal (Stimulus)')
@section('page-title', 'Kelompok Soal (Stimulus)')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-layer-group me-2"></i>
                            Kelompok Soal (Stimulus)
                        </h5>
                        <a href="{{ tenant_route('question-groups.create') }}" class="btn btn-primary">
                            <i class="fas fa-plus me-1"></i>
                            Buat Kelompok Baru
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filters -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <label for="subject_filter" class="form-label">Mata Pelajaran</label>
                            <select class="form-select" id="subject_filter" onchange="filterGroups()">
                                <option value="">Semua Mata Pelajaran</option>
                                @foreach($subjects as $subject)
                                <option value="{{ $subject->id }}" {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                    {{ $subject->name }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="search_filter" class="form-label">Pencarian</label>
                            <input type="text" class="form-control" id="search_filter" placeholder="Cari kelompok soal..." 
                                   value="{{ request('search') }}" onkeyup="filterGroups()">
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button class="btn btn-outline-secondary me-2" onclick="clearFilters()">
                                <i class="fas fa-times me-1"></i>
                                Reset
                            </button>
                            <button class="btn btn-primary" onclick="filterGroups()">
                                <i class="fas fa-search me-1"></i>
                                Cari
                            </button>
                        </div>
                    </div>

                    <!-- Question Groups List -->
                    <div class="row">
                        @forelse($questionGroups as $group)
                        <div class="col-md-6 mb-4">
                            <div class="card h-100">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-0">{{ $group->title }}</h6>
                                        <small class="text-muted">{{ $group->subject->name }}</small>
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="{{ tenant_route('question-groups.show', $group) }}">
                                                <i class="fas fa-eye me-2"></i>Lihat Detail
                                            </a></li>
                                            <li><a class="dropdown-item" href="{{ tenant_route('question-groups.edit', $group) }}">
                                                <i class="fas fa-edit me-2"></i>Edit
                                            </a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteGroup({{ $group->id }})">
                                                <i class="fas fa-trash me-2"></i>Hapus
                                            </a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="card-body">
                                    @if($group->description)
                                    <p class="card-text">{{ Str::limit($group->description, 100) }}</p>
                                    @endif
                                    
                                    <!-- Stimulus Preview -->
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Stimulus:</label>
                                        <div class="border rounded p-3 bg-light">
                                            @if($group->stimulus_type === 'text')
                                                <p class="mb-0">{{ Str::limit($group->stimulus_content, 200) }}</p>
                                            @elseif($group->stimulus_type === 'image')
                                                <img src="{{ $group->stimulus_content }}" alt="Stimulus Image" class="img-fluid" style="max-height: 150px;">
                                            @elseif($group->stimulus_type === 'table')
                                                <div class="table-responsive">
                                                    <table class="table table-sm table-bordered">
                                                        @if(is_array($group->stimulus_content))
                                                            @foreach($group->stimulus_content as $row)
                                                            <tr>
                                                                @foreach($row as $cell)
                                                                <td>{{ $cell }}</td>
                                                                @endforeach
                                                            </tr>
                                                            @endforeach
                                                        @else
                                                            <tr><td>{{ $group->stimulus_content }}</td></tr>
                                                        @endif
                                                    </table>
                                                </div>
                                            @endif
                                        </div>
                                    </div>

                                    <div class="row text-center">
                                        <div class="col-4">
                                            <div class="border-end">
                                                <h6 class="text-primary mb-0">{{ $group->questions->count() }}</h6>
                                                <small class="text-muted">Soal</small>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="border-end">
                                                <h6 class="text-success mb-0">{{ $group->questions->sum('points') }}</h6>
                                                <small class="text-muted">Total Poin</small>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <h6 class="text-info mb-0">{{ ucfirst($group->stimulus_type) }}</h6>
                                            <small class="text-muted">Tipe Stimulus</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">
                                            <i class="fas fa-calendar me-1"></i>
                                            Dibuat: {{ $group->created_at->format('d/m/Y H:i') }}
                                        </small>
                                        <div>
                                            <a href="{{ tenant_route('question-groups.show', $group) }}" class="btn btn-sm btn-outline-primary me-1">
                                                <i class="fas fa-eye me-1"></i>
                                                Lihat
                                            </a>
                                            <a href="{{ tenant_route('question-groups.edit', $group) }}" class="btn btn-sm btn-outline-warning">
                                                <i class="fas fa-edit me-1"></i>
                                                Edit
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @empty
                        <div class="col-12">
                            <div class="text-center py-5">
                                <i class="fas fa-layer-group fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">Belum ada kelompok soal</h5>
                                <p class="text-muted">Mulai buat kelompok soal pertama Anda untuk mengorganisir soal dengan stimulus</p>
                                <a href="{{ tenant_route('question-groups.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Buat Kelompok Pertama
                                </a>
                            </div>
                        </div>
                        @endforelse
                    </div>

                    <!-- Pagination -->
                    @if($questionGroups->hasPages())
                    <div class="d-flex justify-content-center">
                        {{ $questionGroups->links() }}
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Hapus</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Apakah Anda yakin ingin menghapus kelompok soal ini?</p>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Peringatan:</strong> Semua soal dalam kelompok ini akan menjadi soal mandiri (standalone).
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-danger" id="confirmDelete">
                    <i class="fas fa-trash me-1"></i>
                    Hapus
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let groupToDelete = null;

    function filterGroups() {
        const subjectId = document.getElementById('subject_filter').value;
        const search = document.getElementById('search_filter').value;

        const url = new URL(window.location);
        url.searchParams.set('subject_id', subjectId);
        url.searchParams.set('search', search);

        window.location.href = url.toString();
    }

    function clearFilters() {
        document.getElementById('subject_filter').value = '';
        document.getElementById('search_filter').value = '';
        filterGroups();
    }

    function deleteGroup(groupId) {
        groupToDelete = groupId;
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    }

    document.getElementById('confirmDelete').addEventListener('click', function() {
        if (groupToDelete) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `{{ tenant_route('question-groups.index') }}/${groupToDelete}`;
            
            const csrfToken = document.createElement('input');
            csrfToken.type = 'hidden';
            csrfToken.name = '_token';
            csrfToken.value = '{{ csrf_token() }}';
            
            const methodField = document.createElement('input');
            methodField.type = 'hidden';
            methodField.name = '_method';
            methodField.value = 'DELETE';
            
            form.appendChild(csrfToken);
            form.appendChild(methodField);
            document.body.appendChild(form);
            form.submit();
        }
    });
</script>
@endpush