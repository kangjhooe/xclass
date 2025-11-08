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
        Schema::create('ppdb_registrations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instansi_id');
            $table->string('registration_number')->unique();
            $table->string('student_name');
            $table->string('student_nisn', 10)->unique();
            $table->string('student_nik', 16);
            $table->string('birth_place');
            $table->date('birth_date');
            $table->enum('gender', ['male', 'female']);
            $table->string('religion');
            $table->text('address');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('parent_name');
            $table->string('parent_phone');
            $table->string('parent_occupation');
            $table->decimal('parent_income', 15, 2);
            $table->string('previous_school');
            $table->text('previous_school_address');
            $table->enum('registration_path', ['zonasi', 'affirmative', 'transfer', 'achievement', 'academic']);
            $table->enum('status', ['pending', 'registered', 'selection', 'announced', 'accepted', 'rejected', 'cancelled'])->default('pending');
            $table->decimal('selection_score', 5, 2)->nullable();
            $table->decimal('interview_score', 5, 2)->nullable();
            $table->decimal('document_score', 5, 2)->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->datetime('registration_date');
            $table->datetime('selection_date')->nullable();
            $table->datetime('announcement_date')->nullable();
            $table->datetime('accepted_date')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->json('documents')->nullable();
            $table->boolean('payment_status')->default(false);
            $table->datetime('payment_date')->nullable();
            $table->decimal('payment_amount', 15, 2)->nullable();
            $table->string('payment_receipt')->nullable();
            $table->timestamps();

            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['instansi_id', 'status']);
            $table->index(['instansi_id', 'registration_path']);
            $table->index('registration_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppdb_registrations');
    }
};
