<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * AJAX Pagination Component
 * 
 * Provides AJAX-based pagination functionality
 */
class AjaxPagination extends Component
{
    public LengthAwarePaginator $paginator;
    public string $containerId;
    public string $url;
    public array $filters;

    /**
     * Create a new component instance.
     */
    public function __construct(
        LengthAwarePaginator $paginator,
        string $containerId = 'data-container',
        string $url = '',
        array $filters = []
    ) {
        $this->paginator = $paginator;
        $this->containerId = $containerId;
        $this->url = $url ?: request()->url();
        $this->filters = $filters;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.ajax-pagination');
    }

    /**
     * Get pagination data for AJAX
     */
    public function getPaginationData(): array
    {
        return [
            'current_page' => $this->paginator->currentPage(),
            'last_page' => $this->paginator->lastPage(),
            'per_page' => $this->paginator->perPage(),
            'total' => $this->paginator->total(),
            'from' => $this->paginator->firstItem(),
            'to' => $this->paginator->lastItem(),
            'has_more_pages' => $this->paginator->hasMorePages(),
            'links' => $this->paginator->linkCollection()->toArray(),
        ];
    }
}