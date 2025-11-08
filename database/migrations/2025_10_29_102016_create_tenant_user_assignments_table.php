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
        Schema::create('tenant_user_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tenant_id');
            $table->enum('role', ['teacher', 'staff', 'admin'])->default('teacher');
            $table->boolean('is_primary')->default(false);
            $table->json('permissions')->nullable(); // Store specific permissions
            $table->timestamp('assigned_at');
            $table->timestamp('unassigned_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['tenant_id', 'is_active']);
            $table->index(['role', 'is_active']);
            $table->unique(['user_id', 'tenant_id', 'role']);

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_user_assignments');
    }
};
