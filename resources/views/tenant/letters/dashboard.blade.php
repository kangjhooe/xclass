@extends('layouts.tenant')

@section('title', 'Dashboard Persuratan')

@push('styles')
<style>
    /* Modern Stats Cards */
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
    
    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .stats-card.primary::before {
        --card-color-1: #667eea;
        --card-color-2: #764ba2;
    }
    
    .stats-card.success::before {
        --card-color-1: #f093fb;
        --card-color-2: #f5576c;
    }
    
    .stats-card.warning::before {
        --card-color-1: #4facfe;
        --card-color-2: #00f2fe;
    }
    
    .stats-card.info::before {
        --card-color-1: #43e97b;
        --card-color-2: #38f9d7;
    }
    
    .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
    }
    
    .stats-icon.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .stats-icon.success {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .stats-icon.warning {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    .stats-icon.info {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    
    .stats-number {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0.5rem 0;
        color: #1f2937;
    }
    
    .stats-label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Modern Card Styles */
    .modern-card {
        background: #fff;
        border-radius: 16px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .modern-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
    
    .modern-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border: none;
        font-weight: 600;
    }
    
    .quick-action-btn {
        border-radius: 12px;
        padding: 12px 20px;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    }
    
    .quick-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    /* Page Header */
    .page-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        color: white;
    }
    
    .page-header h3 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .page-header p {
        margin: 0.5rem 0 0;
        opacity: 0.9;
    }
    
    /* Dark mode styles */
    [data-bs-theme="dark"] .modern-card {
        background-color: #2d3748;
        border-color: #4a5568;
    }
    
    [data-bs-theme="dark"] .stats-card {
        background-color: #2d3748;
    }
    
    [data-bs-theme="dark"] .bg-light {
        background-color: #4a5568 !important;
        color: #e2e8f0;
    }
    
    [data-bs-theme="dark"] .text-muted {
        color: #a0aec0 !important;
    }
    
    [data-bs-theme="dark"] .table {
        color: #e2e8f0;
    }
    
    [data-bs-theme="dark"] .table-hover tbody tr:hover {
        background-color: #4a5568;
    }
</style>
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <div class="d-flex justify-content-between align-items-center">
        <div>
            <h3>
                <i class="fas fa-tachometer-alt me-3"></i>
                Dashboard Persuratan
            </h3>
            <p>Kelola surat masuk dan surat keluar sekolah</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-light btn-sm" onclick="toggleDarkMode()" 
                    data-bs-toggle="tooltip" title="Toggle Dark Mode">
                <i class="fas fa-moon" id="darkModeIcon"></i>
            </button>
            <button class="btn btn-light btn-sm" onclick="refreshData()" 
                    data-bs-toggle="tooltip" title="Refresh Data">
                <i class="fas fa-sync-alt"></i>
            </button>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row g-4 mb-4">
    <div class="col-lg-3 col-md-6">
        <div class="stats-card primary">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Surat Masuk</div>
                    <div class="stats-number text-primary">{{ number_format($stats['total_incoming']) }}</div>
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>{{ $stats['this_month_incoming'] }} bulan ini
                    </small>
                </div>
                <div class="stats-icon primary">
                    <i class="fas fa-inbox"></i>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-lg-3 col-md-6">
        <div class="stats-card success">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Total Surat Keluar</div>
                    <div class="stats-number text-success">{{ number_format($stats['total_outgoing']) }}</div>
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>{{ $stats['this_month_outgoing'] }} bulan ini
                    </small>
                </div>
                <div class="stats-icon success">
                    <i class="fas fa-paper-plane"></i>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-lg-3 col-md-6">
        <div class="stats-card warning">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Surat Masuk Pending</div>
                    <div class="stats-number text-warning">{{ number_format($stats['pending_incoming']) }}</div>
                    <small class="text-muted">
                        <i class="fas fa-exclamation-triangle me-1"></i>Perlu diproses
                    </small>
                </div>
                <div class="stats-icon warning">
                    <i class="fas fa-clock"></i>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-lg-3 col-md-6">
        <div class="stats-card info">
            <div class="d-flex align-items-center justify-content-between">
                <div class="flex-grow-1">
                    <div class="stats-label">Draft Surat Keluar</div>
                    <div class="stats-number text-info">{{ number_format($stats['pending_outgoing']) }}</div>
                    <small class="text-muted">
                        <i class="fas fa-edit me-1"></i>Belum dikirim
                    </small>
                </div>
                <div class="stats-icon info">
                    <i class="fas fa-file-alt"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Notifications -->
@if($stats['pending_incoming'] > 0 || $stats['pending_outgoing'] > 0)
<div class="alert alert-warning alert-dismissible fade show mb-4" role="alert" style="border-radius: 12px; border: none;">
    <i class="fas fa-exclamation-triangle me-2"></i>
    <strong>Perhatian!</strong> 
    @if($stats['pending_incoming'] > 0)
        Ada {{ $stats['pending_incoming'] }} surat masuk yang perlu diproses.
    @endif
    @if($stats['pending_outgoing'] > 0)
        @if($stats['pending_incoming'] > 0) Dan @endif
        Ada {{ $stats['pending_outgoing'] }} draft surat keluar yang belum dikirim.
    @endif
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
@endif

<!-- Quick Actions -->
<div class="row mb-4">
    <div class="col-12">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-bolt me-2"></i>
                    Aksi Cepat
                </h6>
                <small class="opacity-75">
                    <i class="fas fa-keyboard me-1"></i>
                    Ctrl+N, Ctrl+M, Ctrl+T, Ctrl+S
                </small>
            </div>
            <div class="card-body p-4">
                <div class="d-flex flex-wrap gap-2">
                    <a href="{{ tenant_route('letters.incoming.create') }}" 
                       class="btn btn-primary quick-action-btn" 
                       data-bs-toggle="tooltip" 
                       title="Ctrl + N">
                        <i class="fas fa-plus me-2"></i> Tambah Surat Masuk
                    </a>
                    <a href="{{ tenant_route('letters.outgoing.create') }}" 
                       class="btn btn-success quick-action-btn"
                       data-bs-toggle="tooltip" 
                       title="Ctrl + M">
                        <i class="fas fa-plus me-2"></i> Tambah Surat Keluar
                    </a>
                    <a href="{{ tenant_route('letters.settings.number-settings.index') }}" 
                       class="btn btn-info quick-action-btn"
                       data-bs-toggle="tooltip" 
                       title="Ctrl + S">
                        <i class="fas fa-cog me-2"></i> Pengaturan Nomor
                    </a>
                    <a href="{{ tenant_route('letters.templates.index') }}" 
                       class="btn btn-warning quick-action-btn"
                       data-bs-toggle="tooltip" 
                       title="Ctrl + T">
                        <i class="fas fa-file-alt me-2"></i> Template Surat
                    </a>
                    <a href="{{ tenant_route('letters.incoming.index') }}" 
                       class="btn btn-outline-primary quick-action-btn">
                        <i class="fas fa-inbox me-2"></i> Lihat Surat Masuk
                    </a>
                    <a href="{{ tenant_route('letters.outgoing.index') }}" 
                       class="btn btn-outline-success quick-action-btn">
                        <i class="fas fa-paper-plane me-2"></i> Lihat Surat Keluar
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Charts Section -->
<div class="row g-4 mb-4">
    <div class="col-md-6">
        <div class="modern-card">
            <div class="modern-card-header">
                <h6 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Distribusi Status Surat Masuk
                </h6>
            </div>
            <div class="card-body">
                <canvas id="incomingStatusChart" width="400" height="200"></canvas>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="modern-card">
            <div class="modern-card-header">
                <h6 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Surat per Bulan (6 Bulan Terakhir)
                </h6>
            </div>
            <div class="card-body">
                <canvas id="monthlyChart" width="400" height="200"></canvas>
            </div>
        </div>
    </div>
</div>

<!-- Recent Letters -->
<div class="row g-4">
    <div class="col-md-6">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-inbox me-2"></i>
                    Surat Masuk Terbaru
                </h6>
                <a href="{{ tenant_route('letters.incoming.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-list me-1"></i>Semua
                </a>
            </div>
            <div class="card-body p-3">
                @forelse($recent_incoming as $letter)
                <div class="d-flex align-items-center mb-3 p-2" style="border-radius: 8px; background: #f9fafb; transition: all 0.3s ease;">
                    <div class="flex-shrink-0">
                        <span class="badge bg-{{ $letter->status_color }}">{{ $letter->status_label }}</span>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-1">{{ $letter->nomor_surat }}</h6>
                        <p class="mb-1 text-muted small">{{ $letter->pengirim }}</p>
                        <small class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($letter->tanggal_terima) }}</small>
                    </div>
                    <div class="flex-shrink-0">
                        <a href="{{ tenant_route('letters.incoming.show', $letter) }}" 
                           class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                </div>
                @empty
                <div class="text-center py-5">
                    <div class="mb-3">
                        <i class="fas fa-inbox fa-4x text-muted" style="opacity: 0.3;"></i>
                    </div>
                    <p class="text-muted mb-0">Tidak ada surat masuk</p>
                </div>
                @endforelse
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="modern-card">
            <div class="modern-card-header d-flex align-items-center justify-content-between">
                <h6 class="mb-0">
                    <i class="fas fa-paper-plane me-2"></i>
                    Surat Keluar Terbaru
                </h6>
                <a href="{{ tenant_route('letters.outgoing.index') }}" class="btn btn-sm btn-light">
                    <i class="fas fa-list me-1"></i>Semua
                </a>
            </div>
            <div class="card-body p-3">
                @forelse($recent_outgoing as $letter)
                <div class="d-flex align-items-center mb-3 p-2" style="border-radius: 8px; background: #f9fafb; transition: all 0.3s ease;">
                    <div class="flex-shrink-0">
                        <span class="badge bg-{{ $letter->status_color }}">{{ $letter->status_label }}</span>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-1">{{ $letter->nomor_surat }}</h6>
                        <p class="mb-1 text-muted small">{{ $letter->tujuan }}</p>
                        <small class="text-muted">{{ \App\Helpers\DateHelper::formatIndonesian($letter->tanggal_surat) }}</small>
                    </div>
                    <div class="flex-shrink-0">
                        <a href="{{ tenant_route('letters.outgoing.show', $letter) }}" 
                           class="btn btn-sm btn-outline-success">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                </div>
                @empty
                <div class="text-center py-5">
                    <div class="mb-3">
                        <i class="fas fa-paper-plane fa-4x text-muted" style="opacity: 0.3;"></i>
                    </div>
                    <p class="text-muted mb-0">Tidak ada surat keluar</p>
                </div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// Real-time notifications
function checkForNewLetters() {
    fetch('{{ tenant_route("tenant.letters.api.new-letters") }}')
        .then(response => response.json())
        .then(data => {
            if (data.newIncoming > 0 || data.newOutgoing > 0) {
                showNotification(data);
            }
        })
        .catch(error => console.log('Error checking for new letters:', error));
}

function showNotification(data) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-bell me-2"></i>
        <strong>Surat Baru!</strong>
        ${data.newIncoming > 0 ? `${data.newIncoming} surat masuk baru` : ''}
        ${data.newIncoming > 0 && data.newOutgoing > 0 ? ' dan ' : ''}
        ${data.newOutgoing > 0 ? `${data.newOutgoing} surat keluar baru` : ''}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Check for new letters every 30 seconds
setInterval(checkForNewLetters, 30000);

// Initial check
document.addEventListener('DOMContentLoaded', function() {
    checkForNewLetters();
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize dark mode
    initializeDarkMode();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + N untuk tambah surat masuk
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            window.location.href = '{{ tenant_route("tenant.letters.incoming.create") }}';
        }
        
        // Ctrl + M untuk tambah surat keluar
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            window.location.href = '{{ tenant_route("tenant.letters.outgoing.create") }}';
        }
        
        // Ctrl + T untuk template
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            window.location.href = '{{ tenant_route("tenant.letters.templates.index") }}';
        }
        
        // Ctrl + S untuk settings
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            window.location.href = '{{ tenant_route("tenant.letters.settings.number-settings.index") }}';
        }
    });
});
</script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Incoming Status Chart
    const incomingCtx = document.getElementById('incomingStatusChart').getContext('2d');
    new Chart(incomingCtx, {
        type: 'doughnut',
        data: {
            labels: ['Baru', 'Diproses', 'Selesai'],
            datasets: [{
                data: [
                    {{ $stats['pending_incoming'] }},
                    {{ $stats['this_month_incoming'] }},
                    {{ $stats['total_incoming'] - $stats['pending_incoming'] - $stats['this_month_incoming'] }}
                ],
                backgroundColor: [
                    '#ffc107',
                    '#17a2b8',
                    '#28a745'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Monthly Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            datasets: [{
                label: 'Surat Masuk',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4
            }, {
                label: 'Surat Keluar',
                data: [8, 15, 7, 12, 6, 9],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

// Dark mode functions
function initializeDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        document.getElementById('darkModeIcon').className = 'fas fa-sun';
    }
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    if (isDarkMode) {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        document.getElementById('darkModeIcon').className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'false');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        document.getElementById('darkModeIcon').className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'true');
    }
}

function refreshData() {
    const refreshBtn = event.target.closest('button');
    const icon = refreshBtn.querySelector('i');
    
    // Add spinning animation
    icon.className = 'fas fa-sync-alt fa-spin';
    
    // Refresh page after 1 second
    setTimeout(() => {
        location.reload();
    }, 1000);
}
</script>
@endsection
