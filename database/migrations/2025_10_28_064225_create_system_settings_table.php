<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, image, file
            $table->text('description')->nullable();
            $table->timestamps();
        });
        
        // Insert default settings
        DB::table('system_settings')->insert([
            [
                'key' => 'system_logo',
                'value' => null,
                'type' => 'image',
                'description' => 'Logo sistem yang ditampilkan di halaman login dan navbar',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'system_favicon',
                'value' => null,
                'type' => 'image',
                'description' => 'Favicon sistem yang ditampilkan di browser tab',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'system_name',
                'value' => 'CLASS',
                'type' => 'text',
                'description' => 'Nama sistem',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
