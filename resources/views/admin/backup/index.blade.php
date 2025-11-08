@extends('layouts.admin')

@section('title', 'Backup Management')
@section('page-title', 'Backup Management')

@include('components.admin-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-database me-3"></i>
                Backup Management
            </h2>
            <p>Kelola backup database dan file sistem</p>
        </div>
    </div>
</div>

<!-- Create Backup Form -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-plus me-2 text-primary"></i>
                    Create New Backup
                </h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.backup.create') }}" class="form-modern">
                    @csrf
                    <div class="row">
                        <div class="col-md-8">
                            <label for="description" class="form-label">Description (Optional)</label>
                            <input type="text" name="description" id="description" class="form-control" 
                                   placeholder="Enter backup description...">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-modern btn-primary">
                                    <i class="fas fa-database me-1"></i>
                                    Create Backup
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Backups List -->
<div class="row">
    <div class="col-12">
        <div class="card-modern fade-in-up">
            <div class="card-header">
                <h5>
                    <i class="fas fa-archive me-2 text-primary"></i>
                    Backup History
                </h5>
            </div>
            <div class="card-body">
                @if($backups->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th>Filename</th>
                                    <th>Description</th>
                                    <th>Size</th>
                                    <th>Status</th>
                                    <th>Created By</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($backups as $backup)
                                    <tr>
                                        <td>
                                            <code>{{ $backup->filename }}</code>
                                        </td>
                                        <td>
                                            {{ $backup->description ?? '-' }}
                                        </td>
                                        <td>
                                            <span class="badge-modern bg-info" style="color: white;">
                                                {{ $backup->formatted_size }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge-modern {{ $backup->status_badge_class }}" style="color: white;">
                                                {{ ucfirst($backup->status) }}
                                            </span>
                                        </td>
                                        <td>
                                            {{ $backup->creator->name }}
                                        </td>
                                        <td>
                                            <small class="text-muted">
                                                {{ \App\Helpers\DateHelper::formatIndonesian($backup->created_at) }} {{ $backup->created_at->format('H:i:s') }}
                                            </small>
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                @if($backup->status === 'completed')
                                                    <a href="{{ route('admin.backup.download', $backup) }}" 
                                                       class="btn btn-modern btn-success" title="Download">
                                                        <i class="fas fa-download"></i>
                                                    </a>
                                                @endif
                                                <button type="button" class="btn btn-modern btn-danger" 
                                                        onclick="deleteBackup({{ $backup->id }})" title="Delete">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="d-flex justify-content-center mt-4">
                        {{ $backups->links() }}
                    </div>
                @else
                    <div class="empty-state">
                        <i class="fas fa-archive"></i>
                        <h5>No backups found</h5>
                        <p>Create your first backup to get started.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Confirm Delete</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this backup? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-modern btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <form id="deleteForm" method="POST" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-modern btn-danger">Delete</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
function deleteBackup(backupId) {
    const form = document.getElementById('deleteForm');
    form.action = `/admin/backup/${backupId}`;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>
@endsection
