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
        Schema::create('grade_weights', function (Blueprint $table) {
            $table->id();
            $table->string('assignment_type'); // tugas, uts, uas, quiz, project
            $table->string('assignment_label'); // Tugas, UTS, UAS, Kuis, Proyek
            $table->decimal('weight_percentage', 5, 2); // 40.00, 30.00, 30.00
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('instansi_id');
            $table->timestamps();
            
            $table->foreign('instansi_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['instansi_id', 'assignment_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grade_weights');
    }
};
