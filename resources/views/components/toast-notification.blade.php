@props([
    'id' => 'toastContainer',
    'type' => 'info',
    'title' => '',
    'message' => '',
    'autohide' => true,
    'delay' => 5000
])

@php
    $types = \App\View\Components\ToastNotification::getTypes();
    $icons = \App\View\Components\ToastNotification::getIcons();
    $toastType = $types[$type] ?? 'info';
    $toastIcon = $icons[$type] ?? 'fas fa-info-circle';
@endphp

<!-- Toast Container -->
<div id="{{ $id }}" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
    <!-- Toast will be dynamically added here -->
</div>

@push('scripts')
<script>
class ToastNotification {
    constructor(containerId = '{{ $id }}') {
        this.container = document.getElementById(containerId);
        this.toasts = new Map();
    }

    show(type, message, title = '', options = {}) {
        const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const defaultOptions = {
            autohide: {{ $autohide ? 'true' : 'false' }},
            delay: {{ $delay }},
            position: 'top-end'
        };
        
        const config = { ...defaultOptions, ...options };
        
        const toastHtml = this.createToastHtml(toastId, type, title, message, config);
        
        // Add toast to container
        this.container.insertAdjacentHTML('beforeend', toastHtml);
        
        // Get toast element
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: config.autohide,
            delay: config.delay
        });
        
        // Store toast instance
        this.toasts.set(toastId, toast);
        
        // Show toast
        toast.show();
        
        // Remove from map when hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            this.toasts.delete(toastId);
            toastElement.remove();
        });
        
        return toastId;
    }

    createToastHtml(id, type, title, message, config) {
        const types = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        
        const toastType = types[type] || 'info';
        const toastIcon = icons[type] || 'fas fa-info-circle';
        
        return `
            <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${toastType} text-white">
                    <i class="${toastIcon} me-2"></i>
                    <strong class="me-auto">${title || this.getDefaultTitle(type)}</strong>
                    <small class="text-white-50">baru saja</small>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
    }

    getDefaultTitle(type) {
        const titles = {
            'success': 'Berhasil',
            'error': 'Error',
            'warning': 'Peringatan',
            'info': 'Informasi'
        };
        
        return titles[type] || 'Notifikasi';
    }

    success(message, title = '', options = {}) {
        return this.show('success', message, title, options);
    }

    error(message, title = '', options = {}) {
        return this.show('error', message, title, options);
    }

    warning(message, title = '', options = {}) {
        return this.show('warning', message, title, options);
    }

    info(message, title = '', options = {}) {
        return this.show('info', message, title, options);
    }

    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (toast) {
            toast.hide();
        }
    }

    hideAll() {
        this.toasts.forEach(toast => toast.hide());
    }
}

// Global toast instance
window.toast = new ToastNotification('{{ $id }}');

// Helper functions
window.showToast = function(type, message, title = '', options = {}) {
    return window.toast.show(type, message, title, options);
};

window.showSuccess = function(message, title = '', options = {}) {
    return window.toast.success(message, title, options);
};

window.showError = function(message, title = '', options = {}) {
    return window.toast.error(message, title, options);
};

window.showWarning = function(message, title = '', options = {}) {
    return window.toast.warning(message, title, options);
};

window.showInfo = function(message, title = '', options = {}) {
    return window.toast.info(message, title, options);
};

// Handle session flash messages
document.addEventListener('DOMContentLoaded', function() {
    @if(session('success'))
        window.showSuccess('{{ session('success') }}');
    @endif

    @if(session('error'))
        window.showError('{{ session('error') }}');
    @endif

    @if(session('warning'))
        window.showWarning('{{ session('warning') }}');
    @endif

    @if(session('info'))
        window.showInfo('{{ session('info') }}');
    @endif
});
</script>
@endpush