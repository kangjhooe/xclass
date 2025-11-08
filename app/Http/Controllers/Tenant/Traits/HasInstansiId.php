<?php

namespace App\Http\Controllers\Tenant\Traits;

trait HasInstansiId
{
    /**
     * Get current instansi_id from multiple sources
     * 
     * Uses the global helper function current_instansi_id()
     * which tries multiple sources:
     * 1. TenantService (from middleware) - most reliable
     * 2. Authenticated user's instansi_id
     * 3. Session (fallback)
     * 
     * @return int|null
     */
    protected function getInstansiId()
    {
        return current_instansi_id();
    }
}

