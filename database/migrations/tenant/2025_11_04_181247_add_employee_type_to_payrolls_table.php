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
        Schema::table('payrolls', function (Blueprint $table) {
            // First, drop the foreign key constraint if it exists
            // Laravel generates foreign key names, so we need to check the actual constraint name
            // Common pattern: table_name_column_name_foreign
            $table->dropForeign(['employee_id']);
            
            // Add employee_type column to distinguish between employee, teacher, and staff
            $table->enum('employee_type', ['employee', 'teacher', 'staff'])->default('employee')->after('employee_id');
            
            // Note: We intentionally don't re-add the foreign key constraint
            // because employee_id can now reference employees, teachers, or staff tables
            // We handle referential integrity in application logic using employee_type
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            // Re-add foreign key constraint
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            
            // Remove employee_type column
            $table->dropColumn('employee_type');
        });
    }
};
