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
        Schema::create('guest_books', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('visitor_name');
            $table->string('visitor_phone', 20)->nullable();
            $table->string('visitor_email')->nullable();
            $table->string('visitor_organization')->nullable();
            $table->text('visitor_address')->nullable();
            $table->enum('purpose', ['meeting', 'consultation', 'inspection', 'other']);
            $table->text('purpose_description')->nullable();
            $table->string('person_to_meet')->nullable();
            $table->string('department', 100)->nullable();
            $table->date('visit_date');
            $table->time('visit_time');
            $table->datetime('check_in_time')->nullable();
            $table->datetime('check_out_time')->nullable();
            $table->enum('status', ['checked_in', 'checked_out', 'cancelled'])->default('checked_in');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['instansi_id', 'visit_date']);
            $table->index(['instansi_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_books');
    }
};
