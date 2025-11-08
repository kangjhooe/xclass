<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        // Handle specific HTTP exceptions
        if ($exception instanceof HttpException) {
            $statusCode = $exception->getStatusCode();
            
            // Custom error pages for specific status codes
            switch ($statusCode) {
                case 404:
                    return response()->view('errors.404', [], 404);
                case 403:
                    return response()->view('errors.403', [], 403);
                case 401:
                    return response()->view('errors.401', [], 401);
                case 500:
                    return response()->view('errors.500', [], 500);
                case 502:
                    return response()->view('errors.502', [], 502);
                case 503:
                    // Check if it's maintenance mode
                    if (app()->isDownForMaintenance()) {
                        return response()->view('errors.503-maintenance', [], 503);
                    }
                    return response()->view('errors.503', [], 503);
                case 419:
                    return response()->view('errors.419', [], 419);
                case 429:
                    return response()->view('errors.429', [], 429);
                default:
                    return response()->view('errors.error', [
                        'exception' => $exception
                    ], $statusCode);
            }
        }

        return parent::render($request, $exception);
    }
}
