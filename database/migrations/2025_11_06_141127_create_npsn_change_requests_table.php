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
        Schema::create('npsn_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('current_npsn', 8); // NPSN saat ini
            $table->string('requested_npsn', 8); // NPSN yang diminta
            $table->text('reason')->nullable(); // Alasan perubahan
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade'); // Admin tenant yang mengajukan
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Super admin yang approve/reject
            $table->text('response_message')->nullable(); // Pesan dari super admin
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['tenant_id', 'status']);
            $table->index(['status']);
            $table->index(['requested_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('npsn_change_requests');
    }
};
