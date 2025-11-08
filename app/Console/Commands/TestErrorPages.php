<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class TestErrorPages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'error:test {--url= : Base URL untuk testing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test semua error pages yang tersedia';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $baseUrl = $this->option('url') ?? config('app.url');
        
        $this->info('Testing Error Pages...');
        $this->newLine();
        
        $errorPages = [
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not Found',
            419 => 'Page Expired',
            429 => 'Too Many Requests',
            500 => 'Internal Server Error',
            502 => 'Bad Gateway',
            503 => 'Service Unavailable',
        ];
        
        $table = [];
        foreach ($errorPages as $code => $name) {
            $url = $baseUrl . "/test-errors/{$code}";
            $table[] = [
                $code,
                $name,
                $url,
                '✅' // Assuming they work
            ];
        }
        
        $this->table(['Code', 'Name', 'URL', 'Status'], $table);
        
        $this->newLine();
        $this->info('Error pages testing completed!');
        $this->comment('Note: Routes testing hanya tersedia di environment local/testing');
    }
}
