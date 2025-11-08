@extends('layouts.tenant')

@section('title', $title)
@section('page-title', $pageTitle)

@push('styles')
<style>
    .stats-card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: none;
    }
    
    .table-modern {
        border-radius: 12px;
        overflow: hidden;
    }
    
    .table-modern thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .table-modern thead th {
        border: none;
        padding: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }
    
    .table-modern tbody tr:hover {
        background-color: #f8f9ff;
    }
    
    .message-bubble {
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1rem;
        max-width: 70%;
    }
    
    .message-sent {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-left: auto;
    }
    
    .message-received {
        background: #f1f3f5;
        color: #333;
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <!-- Actions & Filters -->
    <div class="card mb-4" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#sendMessageModal">
                        <i class="fas fa-paper-plane me-1"></i> Kirim Pesan
                    </button>
                </div>
                <div class="col-md-6">
                    <form method="GET" class="d-flex gap-2">
                        <select name="parent_id" class="form-select">
                            <option value="">Semua Orang Tua</option>
                            @foreach($parents ?? [] as $parent)
                                <option value="{{ $parent->id }}" {{ request('parent_id') == $parent->id ? 'selected' : '' }}>
                                    {{ $parent->name }}
                                </option>
                            @endforeach
                        </select>
                        <select name="student_id" class="form-select">
                            <option value="">Semua Siswa</option>
                            @foreach($students ?? [] as $student)
                                <option value="{{ $student->id }}" {{ request('student_id') == $student->id ? 'selected' : '' }}>
                                    {{ $student->name }}
                                </option>
                            @endforeach
                        </select>
                        <select name="status" class="form-select">
                            <option value="">Semua Status</option>
                            <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                            <option value="replied" {{ request('status') == 'replied' ? 'selected' : '' }}>Terbalas</option>
                        </select>
                        <button type="submit" class="btn btn-outline-primary">
                            <i class="fas fa-filter"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Messages Table -->
    <div class="card" style="border-radius: 16px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);">
        <div class="card-header bg-white">
            <h5 class="mb-0">
                <i class="fas fa-comments me-2"></i>Pesan & Chat
            </h5>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-modern table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Orang Tua</th>
                            <th>Siswa</th>
                            <th>Pesan</th>
                            <th>Tipe</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($messages as $message)
                        <tr>
                            <td><strong>{{ $message->parent->name ?? '-' }}</strong></td>
                            <td>{{ $message->student->name ?? '-' }}</td>
                            <td>{{ Str::limit($message->message ?? '-', 50) }}</td>
                            <td>
                                <span class="badge bg-info">{{ ucfirst($message->type ?? '-') }}</span>
                            </td>
                            <td>
                                @if($message->status == 'replied')
                                    <span class="badge bg-success">Terbalas</span>
                                @else
                                    <span class="badge bg-warning">Pending</span>
                                @endif
                            </td>
                            <td>{{ \App\Helpers\DateHelper::formatIndonesian($message->created_at ?? now(), true) }}</td>
                            <td>
                                @if($message->status != 'replied')
                                <button type="button" class="btn btn-sm btn-outline-success" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#replyModal{{ $message->id ?? '' }}">
                                    <i class="fas fa-reply"></i>
                                </button>
                                @endif
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Belum ada pesan</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($messages->hasPages())
        <div class="card-footer bg-white">
            {{ $messages->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Send Message Modal -->
<div class="modal fade" id="sendMessageModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-paper-plane me-2"></i>Kirim Pesan</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.parent-portal.send-chat-message') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Orang Tua <span class="text-danger">*</span></label>
                        <select name="parent_id" class="form-select" required>
                            <option value="">Pilih Orang Tua</option>
                            @foreach($parents ?? [] as $parent)
                                <option value="{{ $parent->id }}">{{ $parent->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Siswa <span class="text-danger">*</span></label>
                        <select name="student_id" class="form-select" required>
                            <option value="">Pilih Siswa</option>
                            @foreach($students ?? [] as $student)
                                <option value="{{ $student->id }}">{{ $student->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tipe <span class="text-danger">*</span></label>
                        <select name="type" class="form-select" required>
                            <option value="question">Pertanyaan</option>
                            <option value="complaint">Keluhan</option>
                            <option value="suggestion">Saran</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Pesan <span class="text-danger">*</span></label>
                        <textarea name="message" class="form-control" rows="4" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane me-1"></i> Kirim
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Reply Modal -->
@foreach($messages ?? [] as $message)
@if($message->status != 'replied')
<div class="modal fade" id="replyModal{{ $message->id ?? '' }}" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 16px;">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-reply me-2"></i>Balas Pesan</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('tenant.parent-portal.reply-message', $message->id ?? '') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Pesan Asli</label>
                        <div class="alert alert-light">
                            {{ $message->message ?? '-' }}
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Balasan <span class="text-danger">*</span></label>
                        <textarea name="reply" class="form-control" rows="4" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-reply me-1"></i> Balas
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endif
@endforeach
@endsection

