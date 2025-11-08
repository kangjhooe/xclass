@props(['paginator', 'containerId' => 'data-container', 'url' => '', 'filters' => []])

@php
    $paginationData = $paginator->getPaginationData();
@endphp

<div class="ajax-pagination" data-container="{{ $containerId }}" data-url="{{ $url }}" data-filters="{{ json_encode($filters) }}">
    <!-- Pagination Info -->
    <div class="pagination-info mb-3">
        <small class="text-muted">
            Menampilkan {{ $paginationData['from'] }} sampai {{ $paginationData['to'] }} 
            dari {{ $paginationData['total'] }} data
        </small>
    </div>

    <!-- Pagination Links -->
    @if($paginationData['last_page'] > 1)
    <nav aria-label="Pagination">
        <ul class="pagination justify-content-center">
            <!-- Previous Page Link -->
            <li class="page-item {{ $paginationData['current_page'] == 1 ? 'disabled' : '' }}">
                <a class="page-link ajax-pagination-link" 
                   href="#" 
                   data-page="{{ $paginationData['current_page'] - 1 }}"
                   {{ $paginationData['current_page'] == 1 ? 'tabindex="-1" aria-disabled="true"' : '' }}>
                    <i class="fas fa-chevron-left"></i> Sebelumnya
                </a>
            </li>

            <!-- Page Numbers -->
            @php
                $start = max(1, $paginationData['current_page'] - 2);
                $end = min($paginationData['last_page'], $paginationData['current_page'] + 2);
            @endphp

            @if($start > 1)
                <li class="page-item">
                    <a class="page-link ajax-pagination-link" href="#" data-page="1">1</a>
                </li>
                @if($start > 2)
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                @endif
            @endif

            @for($i = $start; $i <= $end; $i++)
                <li class="page-item {{ $i == $paginationData['current_page'] ? 'active' : '' }}">
                    <a class="page-link ajax-pagination-link" 
                       href="#" 
                       data-page="{{ $i }}">
                        {{ $i }}
                    </a>
                </li>
            @endfor

            @if($end < $paginationData['last_page'])
                @if($end < $paginationData['last_page'] - 1)
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                @endif
                <li class="page-item">
                    <a class="page-link ajax-pagination-link" 
                       href="#" 
                       data-page="{{ $paginationData['last_page'] }}">
                        {{ $paginationData['last_page'] }}
                    </a>
                </li>
            @endif

            <!-- Next Page Link -->
            <li class="page-item {{ !$paginationData['has_more_pages'] ? 'disabled' : '' }}">
                <a class="page-link ajax-pagination-link" 
                   href="#" 
                   data-page="{{ $paginationData['current_page'] + 1 }}"
                   {{ !$paginationData['has_more_pages'] ? 'tabindex="-1" aria-disabled="true"' : '' }}>
                    Selanjutnya <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        </ul>
    </nav>
    @endif
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const paginationContainer = document.querySelector('.ajax-pagination');
    if (!paginationContainer) return;

    const containerId = paginationContainer.dataset.container;
    const baseUrl = paginationContainer.dataset.url;
    const filters = JSON.parse(paginationContainer.dataset.filters || '{}');

    // Handle pagination clicks
    paginationContainer.addEventListener('click', function(e) {
        e.preventDefault();
        
        const link = e.target.closest('.ajax-pagination-link');
        if (!link || link.classList.contains('disabled')) return;

        const page = link.dataset.page;
        if (!page) return;

        // Show loading
        showLoading(containerId);

        // Build URL with filters and page
        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.set('page', page);
        
        // Add filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                url.searchParams.set(key, filters[key]);
            }
        });

        // Make AJAX request
        fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update container content
                document.getElementById(containerId).innerHTML = data.html;
                
                // Update pagination
                const newPagination = document.createElement('div');
                newPagination.innerHTML = data.pagination;
                paginationContainer.innerHTML = newPagination.querySelector('.ajax-pagination').innerHTML;
                
                // Update URL without reload
                window.history.pushState({}, '', url);
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showError('Gagal memuat data');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Terjadi kesalahan saat memuat data');
        })
        .finally(() => {
            hideLoading(containerId);
        });
    });

    function showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';
        }
    }

    function hideLoading(containerId) {
        // Loading will be replaced by new content
    }

    function showError(message) {
        // You can implement a toast notification here
        alert(message);
    }
});
</script>
@endpush