@props([
    'name',
    'id' => '',
    'placeholder' => '',
    'value' => '',
    'url' => '',
    'displayField' => 'name',
    'valueField' => 'id',
    'minLength' => 2,
    'delay' => 300,
    'required' => false,
    'class' => 'form-control',
    'attributes' => []
])

@php
    $component = new \App\View\Components\AutocompleteInput(
        $name, $id, $placeholder, $value, $url, $displayField, 
        $valueField, $minLength, $delay, $required, $class, $attributes
    );
    $inputAttributes = $component->getInputAttributes();
@endphp

<div class="autocomplete-container position-relative">
    <input {!! $inputAttributes !!}>
    <input type="hidden" name="{{ $name }}_id" id="{{ $id }}_id" value="">
    
    <!-- Loading indicator -->
    <div class="autocomplete-loading position-absolute top-50 end-0 translate-middle-y me-3" style="display: none;">
        <i class="fas fa-spinner fa-spin text-muted"></i>
    </div>
    
    <!-- Dropdown -->
    <div class="autocomplete-dropdown position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm" 
         style="display: none; z-index: 1000; max-height: 200px; overflow-y: auto;">
        <!-- Results will be populated here -->
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector('input[name="{{ $name }}"]');
    if (!input) return;

    const hiddenInput = document.querySelector('input[name="{{ $name }}_id"]');
    const container = input.closest('.autocomplete-container');
    const loading = container.querySelector('.autocomplete-loading');
    const dropdown = container.querySelector('.autocomplete-dropdown');
    
    const url = input.dataset.autocompleteUrl;
    const displayField = input.dataset.displayField || 'name';
    const valueField = input.dataset.valueField || 'id';
    const minLength = parseInt(input.dataset.minLength) || 2;
    const delay = parseInt(input.dataset.delay) || 300;
    
    let timeoutId;
    let currentRequest;
    
    // Handle input
    input.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear previous timeout
        clearTimeout(timeoutId);
        
        // Clear dropdown if query is too short
        if (query.length < minLength) {
            hideDropdown();
            return;
        }
        
        // Set new timeout
        timeoutId = setTimeout(() => {
            search(query);
        }, delay);
    });
    
    // Handle focus
    input.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query.length >= minLength) {
            search(query);
        }
    });
    
    // Handle blur (with delay to allow clicking on dropdown)
    input.addEventListener('blur', function() {
        setTimeout(() => {
            hideDropdown();
        }, 200);
    });
    
    // Handle escape key
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideDropdown();
        }
    });
    
    function search(query) {
        if (!url) return;
        
        // Cancel previous request
        if (currentRequest) {
            currentRequest.abort();
        }
        
        // Show loading
        showLoading();
        
        // Make request
        const searchUrl = new URL(url, window.location.origin);
        searchUrl.searchParams.set('q', query);
        
        currentRequest = fetch(searchUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                showResults(data.data);
            } else {
                hideDropdown();
            }
        })
        .catch(error => {
            if (error.name !== 'AbortError') {
                console.error('Autocomplete error:', error);
                hideDropdown();
            }
        })
        .finally(() => {
            hideLoading();
            currentRequest = null;
        });
    }
    
    function showResults(results) {
        if (!results || results.length === 0) {
            hideDropdown();
            return;
        }
        
        dropdown.innerHTML = results.map(item => `
            <div class="autocomplete-item px-3 py-2 cursor-pointer" 
                 data-value="${item[valueField]}" 
                 data-display="${item[displayField]}">
                ${item[displayField]}
            </div>
        `).join('');
        
        // Add click handlers
        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', function() {
                const value = this.dataset.value;
                const display = this.dataset.display;
                
                input.value = display;
                if (hiddenInput) {
                    hiddenInput.value = value;
                }
                
                // Trigger change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
                
                hideDropdown();
            });
            
            // Add hover effect
            item.addEventListener('mouseenter', function() {
                this.classList.add('bg-light');
            });
            
            item.addEventListener('mouseleave', function() {
                this.classList.remove('bg-light');
            });
        });
        
        dropdown.style.display = 'block';
    }
    
    function hideDropdown() {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
    }
    
    function showLoading() {
        loading.style.display = 'block';
    }
    
    function hideLoading() {
        loading.style.display = 'none';
    }
});
</script>
@endpush

@push('styles')
<style>
.autocomplete-container {
    position: relative;
}

.autocomplete-dropdown {
    border-top: none !important;
}

.autocomplete-item {
    cursor: pointer;
    transition: background-color 0.2s;
}

.autocomplete-item:hover {
    background-color: #f8f9fa !important;
}

.autocomplete-loading {
    pointer-events: none;
}
</style>
@endpush