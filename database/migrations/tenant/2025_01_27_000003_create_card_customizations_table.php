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
        Schema::create('card_customizations', function (Blueprint $table) {
            $table->id();
            $table->string('npsn', 8);
            $table->foreignId('card_template_id')->constrained('card_templates')->onDelete('cascade');
            $table->text('custom_css')->nullable(); // Custom CSS per tenant
            $table->json('custom_config')->nullable(); // Custom config per tenant
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['instansi_id', 'card_template_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_customizations');
    }
};

