<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HttpsRedirect
{
    /**
     * Redirect ke HTTPS di produksi jika request belum secure.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('production') && !$request->isSecure()) {
            $url = 'https://'.$request->getHttpHost().$request->getRequestUri();
            return redirect()->secure($request->getRequestUri());
        }

        return $next($request);
    }
}


