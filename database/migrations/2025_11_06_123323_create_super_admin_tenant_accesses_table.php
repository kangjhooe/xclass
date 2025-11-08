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
        Schema::create('super_admin_tenant_accesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // super admin user
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'revoked'])->default('pending');
            $table->text('request_reason')->nullable(); // alasan super admin meminta akses
            $table->text('response_message')->nullable(); // pesan dari admin tenant
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // admin tenant yang approve
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // izin bisa kedaluwarsa
            $table->json('permissions')->nullable(); // izin khusus jika diperlukan
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['tenant_id', 'status']);
            $table->unique(['user_id', 'tenant_id']); // satu super admin hanya bisa punya satu izin per tenant
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('super_admin_tenant_accesses');
    }
};
