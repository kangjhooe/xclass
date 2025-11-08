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
        Schema::create('ppdb_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year');
            $table->string('batch_name');
            $table->date('registration_start');
            $table->date('registration_end');
            $table->date('announcement_date');
            $table->date('re_registration_start');
            $table->date('re_registration_end');
            $table->json('available_majors');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppdb_configurations');
    }
};
