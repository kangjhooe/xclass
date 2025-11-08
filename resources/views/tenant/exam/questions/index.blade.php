@extends('layouts.tenant')

@section('title', 'Bank Soal')
@section('page-title', 'Bank Soal')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-question-circle me-2"></i>
                        Bank Soal
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <a href="{{ tenant_route('questions.create') }}" class="btn btn-primary">
                                    <i class="fas fa-plus me-1"></i>
                                    Buat Soal Baru
                                </a>
                                <a href="{{ tenant_route('questions.shared') }}" class="btn btn-info">
                                    <i class="fas fa-share-alt me-1"></i>
                                    Soal yang Dibagikan
                                </a>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-end">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Anda dapat membagikan soal ke tenant lain atau menyalin soal yang dibagikan.
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['total_questions'] }}</h4>
                                            <p class="mb-0">Total Soal</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-question-circle fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['shared_questions'] }}</h4>
                                            <p class="mb-0">Dibagikan</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-share-alt fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['copied_questions'] }}</h4>
                                            <p class="mb-0">Disalin</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-copy fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <h4 class="mb-0">{{ $statistics['sharing_rate'] }}%</h4>
                                            <p class="mb-0">Tingkat Berbagi</p>
                                        </div>
                                        <div class="align-self-center">
                                            <i class="fas fa-chart-pie fa-2x"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <form method="GET" action="{{ tenant_route('exam.questions') }}">
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <label for="subject_id" class="form-label">Mata Pelajaran</label>
                                        <select class="form-select" id="subject_id" name="subject_id">
                                            <option value="">Semua Mata Pelajaran</option>
                                            @foreach($subjects as $subject)
                                                <option value="{{ $subject->id }}" 
                                                        {{ request('subject_id') == $subject->id ? 'selected' : '' }}>
                                                    {{ $subject->name }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="type" class="form-label">Tipe Soal</label>
                                        <select class="form-select" id="type" name="type">
                                            <option value="">Semua Tipe</option>
                                            <option value="multiple_choice" {{ request('type') == 'multiple_choice' ? 'selected' : '' }}>Pilihan Ganda</option>
                                            <option value="true_false" {{ request('type') == 'true_false' ? 'selected' : '' }}>Benar/Salah</option>
                                            <option value="essay" {{ request('type') == 'essay' ? 'selected' : '' }}>Esai</option>
                                            <option value="fill_blank" {{ request('type') == 'fill_blank' ? 'selected' : '' }}>Isian</option>
                                            <option value="matching" {{ request('type') == 'matching' ? 'selected' : '' }}>Menjodohkan</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="difficulty" class="form-label">Kesulitan</label>
                                        <select class="form-select" id="difficulty" name="difficulty">
                                            <option value="">Semua Tingkat</option>
                                            <option value="easy" {{ request('difficulty') == 'easy' ? 'selected' : '' }}>Mudah</option>
                                            <option value="medium" {{ request('difficulty') == 'medium' ? 'selected' : '' }}>Sedang</option>
                                            <option value="hard" {{ request('difficulty') == 'hard' ? 'selected' : '' }}>Sulit</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="visibility" class="form-label">Visibilitas</label>
                                        <select class="form-select" id="visibility" name="visibility">
                                            <option value="">Semua</option>
                                            <option value="private" {{ request('visibility') == 'private' ? 'selected' : '' }}>Private</option>
                                            <option value="shared" {{ request('visibility') == 'shared' ? 'selected' : '' }}>Shared</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="search" class="form-label">Pencarian</label>
                                        <input type="text" class="form-control" id="search" name="search" 
                                               value="{{ request('search') }}" placeholder="Cari soal...">
                                    </div>
                                    <div class="col-md-1">
                                        <label class="form-label">&nbsp;</label>
                                        <button type="submit" class="btn btn-primary w-100">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Questions Table -->
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th width="5%">
                                        <input type="checkbox" id="selectAll" class="form-check-input">
                                    </th>
                                    <th width="40%">Pertanyaan</th>
                                    <th width="15%">Mata Pelajaran</th>
                                    <th width="10%">Tipe</th>
                                    <th width="10%">Kesulitan</th>
                                    <th width="10%">Poin</th>
                                    <th width="10%">Status</th>
                                    <th width="10%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($questions as $question)
                                <tr>
                                    <td>
                                        <input type="checkbox" name="question_ids[]" value="{{ $question->id }}" 
                                               class="form-check-input question-checkbox">
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{{ Str::limit($question->question_text, 100) }}</strong>
                                            @if($question->isFromAnotherTenant())
                                                <br><small class="text-info">
                                                    <i class="fas fa-share-alt me-1"></i>
                                                    Dari: {{ $question->originTenant->name ?? 'Tenant Lain' }}
                                                </small>
                                            @endif
                                        </div>
                                    </td>
                                    <td>{{ $question->subject->name }}</td>
                                    <td>
                                        <span class="badge bg-secondary">
                                            <i class="{{ $question->type_icon }} me-1"></i>
                                            {{ $question->type_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $question->difficulty_color }}">
                                            {{ $question->difficulty_label }}
                                        </span>
                                    </td>
                                    <td>{{ $question->points }}</td>
                                    <td>
                                        <span class="badge bg-{{ $question->visibility_color }}">
                                            {{ $question->visibility_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ tenant_route('questions.show', $question) }}" 
                                               class="btn btn-sm btn-outline-primary" title="Lihat Detail">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            @if($question->creator_id === auth()->id() && $question->tenant_id === tenant('id'))
                                                <a href="{{ tenant_route('questions.edit', $question) }}" 
                                                   class="btn btn-sm btn-outline-warning" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                @if($question->isShared())
                                                    <form action="{{ tenant_route('questions.unshare', $question) }}" 
                                                          method="POST" class="d-inline">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-danger" 
                                                                title="Hentikan Berbagi" 
                                                                onclick="return confirm('Yakin ingin menghentikan berbagi soal ini?')">
                                                            <i class="fas fa-share-slash"></i>
                                                        </button>
                                                    </form>
                                                @else
                                                    <form action="{{ tenant_route('questions.share', $question) }}" 
                                                          method="POST" class="d-inline">
                                                        @csrf
                                                        <button type="submit" class="btn btn-sm btn-outline-success" 
                                                                title="Bagikan Soal" 
                                                                onclick="return confirm('Yakin ingin membagikan soal ini?')">
                                                            <i class="fas fa-share"></i>
                                                        </button>
                                                    </form>
                                                @endif
                                            @elseif($question->isFromAnotherTenant())
                                                <form action="{{ tenant_route('questions.copy', $question) }}" 
                                                      method="POST" class="d-inline">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-outline-info" 
                                                            title="Salin ke Bank Soal Saya" 
                                                            onclick="return confirm('Yakin ingin menyalin soal ini ke bank soal Anda?')">
                                                        <i class="fas fa-copy"></i>
                                                    </button>
                                                </form>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="fas fa-question-circle fa-3x mb-3"></i>
                                            <p>Belum ada soal yang dibuat</p>
                                            <a href="{{ tenant_route('questions.create') }}" class="btn btn-primary">
                                                <i class="fas fa-plus me-1"></i>
                                                Buat Soal Pertama
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Bulk Actions -->
                    @if($questions->count() > 0)
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-success" id="bulkShareBtn" disabled>
                                    <i class="fas fa-share me-1"></i>
                                    Bagikan Terpilih
                                </button>
                                <button type="button" class="btn btn-danger" id="bulkUnshareBtn" disabled>
                                    <i class="fas fa-share-slash me-1"></i>
                                    Hentikan Berbagi Terpilih
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-end">
                                <small class="text-muted">
                                    Pilih soal untuk melakukan aksi massal
                                </small>
                            </div>
                        </div>
                    </div>
                    @endif

                    <!-- Pagination -->
                    <div class="d-flex justify-content-center mt-4">
                        {{ $questions->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bulk Share Modal -->
<div class="modal fade" id="bulkShareModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Bagikan Soal Terpilih</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="bulkShareForm" method="POST" action="{{ tenant_route('questions.bulk-share') }}">
                @csrf
                <div class="modal-body">
                    <p>Yakin ingin membagikan soal-soal terpilih?</p>
                    <div id="selectedQuestionsList"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-success">Bagikan</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Bulk Unshare Modal -->
<div class="modal fade" id="bulkUnshareModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Hentikan Berbagi Soal Terpilih</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="bulkUnshareForm" method="POST" action="{{ tenant_route('questions.bulk-unshare') }}">
                @csrf
                <div class="modal-body">
                    <p>Yakin ingin menghentikan berbagi soal-soal terpilih?</p>
                    <div id="selectedQuestionsList2"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-danger">Hentikan Berbagi</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Select all functionality
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.question-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkButtons();
    });

    // Individual checkbox change
    document.querySelectorAll('.question-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateBulkButtons();
        });
    });

    function updateBulkButtons() {
        const checkedBoxes = document.querySelectorAll('.question-checkbox:checked');
        const bulkShareBtn = document.getElementById('bulkShareBtn');
        const bulkUnshareBtn = document.getElementById('bulkUnshareBtn');
        
        if (checkedBoxes.length > 0) {
            bulkShareBtn.disabled = false;
            bulkUnshareBtn.disabled = false;
        } else {
            bulkShareBtn.disabled = true;
            bulkUnshareBtn.disabled = true;
        }
    }

    // Bulk share
    document.getElementById('bulkShareBtn').addEventListener('click', function() {
        const checkedBoxes = document.querySelectorAll('.question-checkbox:checked');
        const form = document.getElementById('bulkShareForm');
        const list = document.getElementById('selectedQuestionsList');
        
        // Clear previous inputs
        form.querySelectorAll('input[name="question_ids[]"]').forEach(input => input.remove());
        
        // Add selected question IDs
        checkedBoxes.forEach(checkbox => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'question_ids[]';
            input.value = checkbox.value;
            form.appendChild(input);
        });
        
        // Show selected questions
        list.innerHTML = '<ul>' + Array.from(checkedBoxes).map(checkbox => {
            const row = checkbox.closest('tr');
            const questionText = row.querySelector('td:nth-child(2) strong').textContent;
            return '<li>' + questionText + '</li>';
        }).join('') + '</ul>';
        
        new bootstrap.Modal(document.getElementById('bulkShareModal')).show();
    });

    // Bulk unshare
    document.getElementById('bulkUnshareBtn').addEventListener('click', function() {
        const checkedBoxes = document.querySelectorAll('.question-checkbox:checked');
        const form = document.getElementById('bulkUnshareForm');
        const list = document.getElementById('selectedQuestionsList2');
        
        // Clear previous inputs
        form.querySelectorAll('input[name="question_ids[]"]').forEach(input => input.remove());
        
        // Add selected question IDs
        checkedBoxes.forEach(checkbox => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'question_ids[]';
            input.value = checkbox.value;
            form.appendChild(input);
        });
        
        // Show selected questions
        list.innerHTML = '<ul>' + Array.from(checkedBoxes).map(checkbox => {
            const row = checkbox.closest('tr');
            const questionText = row.querySelector('td:nth-child(2) strong').textContent;
            return '<li>' + questionText + '</li>';
        }).join('') + '</ul>';
        
        new bootstrap.Modal(document.getElementById('bulkUnshareModal')).show();
    });
</script>
@endpush