<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule subscription warning check (daily at 9 AM)
Schedule::command('subscription:check-warnings')
    ->dailyAt('09:00')
    ->timezone('Asia/Jakarta');
