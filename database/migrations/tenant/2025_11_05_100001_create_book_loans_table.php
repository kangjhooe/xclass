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
        Schema::create('book_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instansi_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('cascade');
            $table->datetime('loan_date');
            $table->date('due_date');
            $table->datetime('return_date')->nullable();
            $table->enum('status', ['active', 'returned', 'overdue', 'lost', 'damaged'])->default('active');
            $table->text('loan_notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->boolean('fine_paid')->default(false);
            $table->datetime('fine_paid_date')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('returned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index(['instansi_id', 'status']);
            $table->index(['instansi_id', 'book_id']);
            $table->index(['instansi_id', 'student_id']);
            $table->index(['instansi_id', 'due_date']);
            $table->index('loan_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_loans');
    }
};

