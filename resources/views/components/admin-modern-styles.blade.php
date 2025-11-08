@push('styles')
<style>
    /* Modern Admin UI Styles - Reusable Components */
    
    /* Statistics Cards */
    .stat-card-modern {
        background: white !important;
        border-radius: 1rem !important;
        padding: 1.75rem !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
        transition: all 0.3s ease !important;
        border-left: 4px solid !important;
        height: 100% !important;
        position: relative !important;
        overflow: hidden !important;
    }
    
    .stat-card-modern::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .stat-card-modern:hover {
        transform: translateY(-8px) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
    }
    
    .stat-card-modern:hover::before {
        opacity: 1 !important;
    }
    
    .stat-card-modern.primary { border-left-color: #3b82f6 !important; }
    .stat-card-modern.success { border-left-color: #10b981 !important; }
    .stat-card-modern.warning { border-left-color: #f59e0b !important; }
    .stat-card-modern.info { border-left-color: #06b6d4 !important; }
    .stat-card-modern.danger { border-left-color: #ef4444 !important; }
    .stat-card-modern.purple { border-left-color: #8b5cf6 !important; }
    .stat-card-modern.pink { border-left-color: #ec4899 !important; }
    
    .stat-icon-modern {
        width: 60px;
        height: 60px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1rem;
    }
    
    .stat-card-modern.primary .stat-icon-modern { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .stat-card-modern.success .stat-icon-modern { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .stat-card-modern.warning .stat-icon-modern { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .stat-card-modern.info .stat-icon-modern { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; }
    .stat-card-modern.danger .stat-icon-modern { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    .stat-card-modern.purple .stat-icon-modern { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
    .stat-card-modern.pink .stat-icon-modern { background: linear-gradient(135deg, #ec4899, #db2777); color: white; }
    
    /* Modern Cards */
    .card-modern {
        background: white !important;
        border-radius: 1rem !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
        overflow: hidden !important;
        border: none !important;
    }
    
    .card-modern .card-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
        border-bottom: 2px solid #dee2e6 !important;
        padding: 1.25rem 1.5rem !important;
    }
    
    .card-modern .card-header h5 {
        font-weight: 700 !important;
        color: #495057 !important;
        margin: 0 !important;
    }
    
    /* Modern Table */
    .table-modern {
        margin-bottom: 0 !important;
    }
    
    .table-modern thead {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    }
    
    .table-modern thead th {
        border: none !important;
        padding: 1rem 1.5rem !important;
        font-weight: 600 !important;
        color: #495057 !important;
        text-transform: uppercase !important;
        font-size: 0.75rem !important;
        letter-spacing: 0.5px !important;
    }
    
    .table-modern tbody tr {
        transition: all 0.2s ease !important;
        border-bottom: 1px solid #f0f0f0 !important;
    }
    
    .table-modern tbody tr:hover {
        background-color: rgba(59, 130, 246, 0.05) !important;
        transform: scale(1.01) !important;
    }
    
    .table-modern tbody td {
        padding: 1rem 1.5rem !important;
        vertical-align: middle !important;
    }
    
    /* Modern Buttons */
    .btn-modern {
        border-radius: 0.75rem !important;
        padding: 0.625rem 1.25rem !important;
        font-weight: 600 !important;
        transition: all 0.3s ease !important;
        border: none !important;
    }
    
    .btn-modern:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
    
    /* Modern Badges */
    .badge-modern {
        padding: 0.5rem 1rem !important;
        border-radius: 0.5rem !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
    }
    
    /* Animations */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fade-in-up {
        animation: fadeInUp 0.6s ease-out !important;
        animation-fill-mode: both !important;
    }
    
    .fade-in-up-delay-1 { animation-delay: 0.1s !important; }
    .fade-in-up-delay-2 { animation-delay: 0.2s !important; }
    .fade-in-up-delay-3 { animation-delay: 0.3s !important; }
    .fade-in-up-delay-4 { animation-delay: 0.4s !important; }
    .fade-in-up-delay-5 { animation-delay: 0.5s !important; }
    
    /* Page Header */
    .page-header-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 1rem !important;
        padding: 2rem !important;
        color: white !important;
        margin-bottom: 2rem !important;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3) !important;
    }
    
    .page-header-modern h2 {
        font-weight: 700 !important;
        font-size: 2rem !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        margin: 0 !important;
    }
    
    .page-header-modern p {
        opacity: 0.95 !important;
        font-size: 1.1rem !important;
        margin: 0.5rem 0 0 0 !important;
    }
    
    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
    }
    
    .empty-state i {
        font-size: 4rem;
        color: #dee2e6;
        margin-bottom: 1rem;
    }
    
    .empty-state h5 {
        color: #6c757d;
        margin-bottom: 0.5rem;
    }
    
    .empty-state p {
        color: #adb5bd;
        margin-bottom: 1.5rem;
    }
    
    /* Form Styles */
    .form-modern .form-label {
        font-weight: 600 !important;
        color: #495057 !important;
        margin-bottom: 0.5rem !important;
    }
    
    .form-modern .form-control,
    .form-modern .form-select {
        border-radius: 0.5rem !important;
        border: 1px solid #dee2e6 !important;
        padding: 0.625rem 0.875rem !important;
        transition: all 0.3s ease !important;
    }
    
    .form-modern .form-control:focus,
    .form-modern .form-select:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.15) !important;
    }
    
    .form-modern .form-control.is-invalid,
    .form-modern .form-select.is-invalid {
        border-color: #ef4444 !important;
    }
    
    .form-modern .form-control.is-valid,
    .form-modern .form-select.is-valid {
        border-color: #10b981 !important;
    }
    
    /* Info Item Styles */
    .info-item {
        padding: 1rem 1.5rem !important;
        border-bottom: 1px solid #f0f0f0 !important;
        display: flex !important;
        align-items: center !important;
        transition: background-color 0.2s ease !important;
    }
    
    .info-item:last-child {
        border-bottom: none !important;
    }
    
    .info-item:hover {
        background-color: #f8f9fa !important;
    }
    
    .info-item-label {
        font-weight: 600 !important;
        color: #495057 !important;
        min-width: 180px !important;
        display: flex !important;
        align-items: center !important;
    }
    
    .info-item-label i {
        margin-right: 0.5rem !important;
        color: #6c757d !important;
        width: 20px !important;
    }
    
    .info-item-value {
        color: #212529 !important;
        flex: 1 !important;
    }
    
    .info-item-value a {
        color: #3b82f6 !important;
        transition: color 0.2s ease !important;
        text-decoration: none !important;
    }
    
    .info-item-value a:hover {
        color: #2563eb !important;
    }
    
    /* Info Card Sidebar */
    .info-sidebar {
        position: sticky;
        top: 2rem;
    }
    
    .info-sidebar .card-modern {
        border-left: 4px solid #3b82f6 !important;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .stat-card-modern {
            margin-bottom: 1rem;
        }
        
        .table-modern {
            font-size: 0.875rem;
        }
        
        .table-modern thead th,
        .table-modern tbody td {
            padding: 0.75rem 1rem !important;
        }
        
        .info-sidebar {
            position: static;
            margin-top: 2rem;
        }
    }
</style>
@endpush

