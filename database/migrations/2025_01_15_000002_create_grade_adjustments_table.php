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
        Schema::create('grade_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['admin', 'teacher'])->comment('Role of user who made the adjustment');
            $table->enum('adjustment_type', ['percent', 'minimum', 'manual'])->comment('Type of grade adjustment');
            $table->decimal('before_value', 5, 2)->comment('Grade value before adjustment');
            $table->decimal('after_value', 5, 2)->comment('Grade value after adjustment');
            $table->foreignId('applied_to')->constrained('students')->onDelete('cascade')->comment('Student whose grade was adjusted');
            $table->text('note')->nullable()->comment('Note or reason for adjustment');
            $table->json('adjustment_data')->nullable()->comment('Additional data for the adjustment');
            $table->timestamps();
            
            $table->index(['exam_id', 'applied_to']);
            $table->index(['user_id', 'role']);
            $table->index(['adjustment_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grade_adjustments');
    }
};
