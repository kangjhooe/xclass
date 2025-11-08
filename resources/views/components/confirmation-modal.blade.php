@props([
    'id' => 'confirmationModal',
    'title' => 'Konfirmasi',
    'message' => 'Apakah Anda yakin?',
    'confirmText' => 'Ya, Hapus',
    'cancelText' => 'Batal',
    'confirmClass' => 'btn-danger',
    'actionUrl' => '',
    'method' => 'DELETE'
])

<!-- Confirmation Modal -->
<div class="modal fade" id="{{ $id }}" tabindex="-1" aria-labelledby="{{ $id }}Label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="{{ $id }}Label">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    {{ $title }}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p class="mb-0">{{ $message }}</p>
                <div class="alert alert-warning mt-3 mb-0">
                    <i class="fas fa-info-circle"></i>
                    <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="fas fa-times"></i> {{ $cancelText }}
                </button>
                <form id="{{ $id }}Form" method="POST" action="{{ $actionUrl }}" class="d-inline">
                    @csrf
                    @if($method !== 'POST')
                        @method($method)
                    @endif
                    <button type="submit" class="btn {{ $confirmClass }}">
                        <i class="fas fa-check"></i> {{ $confirmText }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('{{ $id }}');
    const form = document.getElementById('{{ $id }}Form');
    
    if (modal && form) {
        // Update form action when modal is shown
        modal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            if (button) {
                const actionUrl = button.getAttribute('data-action-url');
                const method = button.getAttribute('data-method') || '{{ $method }}';
                const title = button.getAttribute('data-title') || '{{ $title }}';
                const message = button.getAttribute('data-message') || '{{ $message }}';
                const confirmText = button.getAttribute('data-confirm-text') || '{{ $confirmText }}';
                const confirmClass = button.getAttribute('data-confirm-class') || '{{ $confirmClass }}';
                
                // Update form
                form.action = actionUrl;
                form.querySelector('input[name="_method"]').value = method;
                
                // Update modal content
                modal.querySelector('.modal-title').innerHTML = 
                    '<i class="fas fa-exclamation-triangle text-warning"></i> ' + title;
                modal.querySelector('.modal-body p').textContent = message;
                modal.querySelector('.modal-footer button[type="submit"]').textContent = confirmText;
                modal.querySelector('.modal-footer button[type="submit"]').className = 'btn ' + confirmClass;
            }
        });
        
        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            submitBtn.disabled = true;
            
            // Submit form
            fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showToast('success', data.message || 'Data berhasil dihapus');
                    
                    // Close modal
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    modalInstance.hide();
                    
                    // Reload page or update table
                    if (data.reload) {
                        window.location.reload();
                    } else if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    showToast('error', data.message || 'Terjadi kesalahan');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('error', 'Terjadi kesalahan saat memproses');
            })
            .finally(() => {
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

function showToast(type, message) {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}
</script>
@endpush