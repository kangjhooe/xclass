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
        Schema::table('questions', function (Blueprint $table) {
            $table->foreignId('question_group_id')->nullable()->constrained('question_groups')->onDelete('set null')->after('subject_id');
            $table->integer('group_order')->default(0)->comment('Order within the group')->after('question_group_id');
            
            $table->index(['question_group_id', 'group_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['question_group_id']);
            $table->dropIndex(['question_group_id', 'group_order']);
            $table->dropColumn(['question_group_id', 'group_order']);
        });
    }
};
