@extends('layouts.tenant')

@section('title', 'Riwayat Aktivitas Surat Keluar')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-history me-2"></i>
                            Riwayat Aktivitas - {{ $outgoingLetter->nomor_surat }}
                        </h3>
                        <a href="{{ tenant_route('letters.outgoing.show', $outgoingLetter) }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Kembali ke Detail Surat
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if($activityLogs->count() > 0)
                        <div class="timeline">
                            @foreach($activityLogs as $log)
                                <div class="timeline-item">
                                    <div class="timeline-marker">
                                        <i class="fas fa-{{ $log->event === 'created' ? 'plus' : ($log->event === 'updated' ? 'edit' : 'trash') }}"></i>
                                    </div>
                                    <div class="timeline-content">
                                        <div class="card">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 class="card-title mb-0">
                                                        {{ $log->description }}
                                                    </h6>
                                                    <small class="text-muted">
                                                        {{ \App\Helpers\DateHelper::formatIndonesian($log->created_at, true) }}
                                                    </small>
                                                </div>
                                                
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <small class="text-muted">
                                                            <i class="fas fa-user me-1"></i>
                                                            {{ $log->causer->name ?? 'System' }}
                                                        </small>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <small class="text-muted">
                                                            <i class="fas fa-clock me-1"></i>
                                                            {{ $log->created_at->diffForHumans() }}
                                                        </small>
                                                    </div>
                                                </div>
                                                
                                                @if($log->properties && count($log->properties) > 0)
                                                    <div class="mt-3">
                                                        <h6 class="small text-muted mb-2">Perubahan Data:</h6>
                                                        <div class="table-responsive">
                                                            <table class="table table-sm table-borderless">
                                                                @foreach($log->properties as $key => $value)
                                                                    @if(is_array($value))
                                                                        <tr>
                                                                            <td width="150" class="text-muted">{{ ucfirst(str_replace('_', ' ', $key)) }}:</td>
                                                                            <td>
                                                                                @if(isset($value['old']) && isset($value['new']))
                                                                                    <span class="text-danger">{{ $value['old'] }}</span>
                                                                                    <i class="fas fa-arrow-right mx-2"></i>
                                                                                    <span class="text-success">{{ $value['new'] }}</span>
                                                                                @else
                                                                                    <code>{{ json_encode($value) }}</code>
                                                                                @endif
                                                                            </td>
                                                                        </tr>
                                                                    @else
                                                                        <tr>
                                                                            <td width="150" class="text-muted">{{ ucfirst(str_replace('_', ' ', $key)) }}:</td>
                                                                            <td><code>{{ $value }}</code></td>
                                                                        </tr>
                                                                    @endif
                                                                @endforeach
                                                            </table>
                                                        </div>
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                        
                        <!-- Pagination -->
                        <div class="d-flex justify-content-center mt-4">
                            {{ $activityLogs->links() }}
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-history fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Belum Ada Riwayat Aktivitas</h5>
                            <p class="text-muted">Surat ini belum memiliki riwayat aktivitas yang tercatat.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #dee2e6;
}

.timeline-item {
    position: relative;
    margin-bottom: 30px;
}

.timeline-marker {
    position: absolute;
    left: -22px;
    top: 10px;
    width: 30px;
    height: 30px;
    background: #007bff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    z-index: 1;
}

.timeline-content {
    margin-left: 20px;
}

.timeline-item:last-child .timeline::before {
    display: none;
}
</style>
@endsection