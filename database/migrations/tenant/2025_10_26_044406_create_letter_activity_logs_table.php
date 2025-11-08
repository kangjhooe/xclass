<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('letter_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->enum('letter_type', ['incoming', 'outgoing']);
            $table->unsignedBigInteger('letter_id');
            $table->string('action');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['instansi_id', 'letter_type', 'letter_id']);
            $table->index(['instansi_id', 'action']);
            $table->index(['instansi_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_activity_logs');
    }
};