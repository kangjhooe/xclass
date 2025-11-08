@push('styles')
<style>
    /* Tenant Modern UI Styles - Reusable Components */
    
    /* Hero Section */
    .tenant-hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 1rem !important;
        padding: 2.5rem !important;
        color: white !important;
        margin-bottom: 2rem !important;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3) !important;
    }
    
    /* Statistics Cards */
    .stat-card {
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
    
    .stat-card::before {
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
    
    .stat-card:hover {
        transform: translateY(-8px) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
    }
    
    .stat-card:hover::before {
        opacity: 1 !important;
    }
    
    .stat-card.primary { border-left-color: #3b82f6; }
    .stat-card.success { border-left-color: #10b981; }
    .stat-card.warning { border-left-color: #f59e0b; }
    .stat-card.info { border-left-color: #06b6d4; }
    .stat-card.purple { border-left-color: #8b5cf6; }
    .stat-card.pink { border-left-color: #ec4899; }
    .stat-card.danger { border-left-color: #ef4444; }
    
    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1rem;
    }
    
    .stat-card.primary .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .stat-card.success .stat-icon { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .stat-card.warning .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .stat-card.info .stat-icon { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; }
    .stat-card.purple .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
    .stat-card.pink .stat-icon { background: linear-gradient(135deg, #ec4899, #db2777); color: white; }
    .stat-card.danger .stat-icon { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    
    /* Info Cards */
    .info-card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        overflow: hidden;
    }
    
    .info-card .card-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-bottom: 2px solid #dee2e6;
        padding: 1.25rem 1.5rem;
    }
    
    .info-item {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        transition: background-color 0.2s ease;
    }
    
    .info-item:last-child {
        border-bottom: none;
    }
    
    .info-item:hover {
        background-color: #f8f9fa;
    }
    
    .info-item-label {
        font-weight: 600;
        color: #495057;
        min-width: 150px;
        display: flex;
        align-items: center;
    }
    
    .info-item-label i {
        margin-right: 0.5rem;
        color: #6c757d;
        width: 20px;
    }
    
    .info-item-value {
        color: #212529;
        flex: 1;
    }
    
    .info-item-value a {
        color: #3b82f6;
        transition: color 0.2s ease;
    }
    
    .info-item-value a:hover {
        color: #2563eb;
    }
    
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
    
    /* User/Tenant Items */
    .user-item, .tenant-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;
        background: #f8f9fa;
        transition: all 0.3s ease;
    }
    
    .user-item:hover, .tenant-item:hover {
        background: #e9ecef;
        transform: translateX(5px);
    }
    
    .user-avatar, .tenant-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        margin-right: 1rem;
        font-size: 1.1rem;
    }
    
    .tenant-avatar {
        border-radius: 0.5rem;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    
    /* Feature Cards */
    .feature-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
        height: 100%;
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
    }
    
    .feature-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s ease;
    }
    
    .feature-card:hover::after {
        left: 100%;
    }
    
    .feature-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        border-color: #3b82f6 !important;
        text-decoration: none !important;
        color: inherit !important;
    }
    
    .feature-icon {
        width: 60px;
        height: 60px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
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
    
    /* Modern Buttons */
    .btn-modern {
        border-radius: 0.75rem !important;
        padding: 0.625rem 1.25rem !important;
        font-weight: 600 !important;
        transition: all 0.3s ease !important;
        border: none !important;
    }
    
    .btn-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Modern Badges */
    .badge-modern {
        padding: 0.5rem 1rem !important;
        border-radius: 0.5rem !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
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
    
    /* Action Buttons */
    .action-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
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
    
    .stat-card {
        animation: fadeInUp 0.6s ease-out !important;
        animation-fill-mode: both !important;
    }
    
    .stat-card:nth-child(1) { animation-delay: 0.1s !important; }
    .stat-card:nth-child(2) { animation-delay: 0.2s !important; }
    .stat-card:nth-child(3) { animation-delay: 0.3s !important; }
    .stat-card:nth-child(4) { animation-delay: 0.4s !important; }
    
    /* Responsive */
    @media (max-width: 768px) {
        .tenant-hero {
            padding: 1.5rem;
        }
        
        .stat-card {
            margin-bottom: 1rem;
        }
        
        .info-item {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .info-item-label {
            min-width: auto;
            margin-bottom: 0.5rem;
        }
        
        .feature-card {
            margin-bottom: 1rem;
        }
    }
</style>
@endpush

