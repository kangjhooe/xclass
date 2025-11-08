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
        Schema::table('ppdb_applications', function (Blueprint $table) {
            // Parent income
            if (!Schema::hasColumn('ppdb_applications', 'parent_income')) {
                $table->decimal('parent_income', 15, 2)->nullable()->after('parent_occupation');
            }
            
            // Registration path
            if (!Schema::hasColumn('ppdb_applications', 'registration_path')) {
                $table->string('registration_path')->nullable()->after('batch');
            }
            
            // Scores
            if (!Schema::hasColumn('ppdb_applications', 'selection_score')) {
                $table->decimal('selection_score', 5, 2)->nullable()->after('status');
            }
            if (!Schema::hasColumn('ppdb_applications', 'interview_score')) {
                $table->decimal('interview_score', 5, 2)->nullable()->after('selection_score');
            }
            if (!Schema::hasColumn('ppdb_applications', 'document_score')) {
                $table->decimal('document_score', 5, 2)->nullable()->after('interview_score');
            }
            if (!Schema::hasColumn('ppdb_applications', 'total_score')) {
                $table->decimal('total_score', 5, 2)->nullable()->after('document_score');
            }
            
            // Dates
            if (!Schema::hasColumn('ppdb_applications', 'registration_date')) {
                $table->timestamp('registration_date')->nullable()->after('total_score');
            }
            if (!Schema::hasColumn('ppdb_applications', 'selection_date')) {
                $table->timestamp('selection_date')->nullable()->after('registration_date');
            }
            if (!Schema::hasColumn('ppdb_applications', 'announcement_date')) {
                $table->timestamp('announcement_date')->nullable()->after('selection_date');
            }
            if (!Schema::hasColumn('ppdb_applications', 'accepted_date')) {
                $table->timestamp('accepted_date')->nullable()->after('announcement_date');
            }
            if (!Schema::hasColumn('ppdb_applications', 'rejected_reason')) {
                $table->text('rejected_reason')->nullable()->after('accepted_date');
            }
            
            // Documents (JSON)
            if (!Schema::hasColumn('ppdb_applications', 'documents')) {
                $table->json('documents')->nullable()->after('kk_path');
            }
            
            // Payment fields
            if (!Schema::hasColumn('ppdb_applications', 'payment_status')) {
                $table->boolean('payment_status')->default(false)->after('rejected_reason');
            }
            if (!Schema::hasColumn('ppdb_applications', 'payment_date')) {
                $table->timestamp('payment_date')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('ppdb_applications', 'payment_amount')) {
                $table->decimal('payment_amount', 15, 2)->nullable()->after('payment_date');
            }
            if (!Schema::hasColumn('ppdb_applications', 'payment_receipt')) {
                $table->string('payment_receipt')->nullable()->after('payment_amount');
            }
            
            // User ID (jika belum ada)
            if (!Schema::hasColumn('ppdb_applications', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            }
            
            // Update status enum if needed
            if (Schema::hasColumn('ppdb_applications', 'status')) {
                // Check current enum values - SQLite doesn't support ALTER ENUM, so we skip this
                // The application will handle the status values
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ppdb_applications', function (Blueprint $table) {
            $columns = [
                'parent_income', 'registration_path', 'selection_score', 'interview_score',
                'document_score', 'total_score', 'registration_date', 'selection_date',
                'announcement_date', 'accepted_date', 'rejected_reason', 'documents',
                'payment_status', 'payment_date', 'payment_amount', 'payment_receipt'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('ppdb_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

