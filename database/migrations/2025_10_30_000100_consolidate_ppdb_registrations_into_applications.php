<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ppdb_registrations')) {
            return; // nothing to consolidate
        }

        // Map data from legacy table to current applications table
        $rows = DB::table('ppdb_registrations')->orderBy('id')->get();

        foreach ($rows as $row) {
            // Skip if registration_number already exists in applications
            $exists = DB::table('ppdb_applications')
                ->where('registration_number', $row->registration_number)
                ->exists();
            if ($exists) {
                continue;
            }

            DB::table('ppdb_applications')->insert([
                // Identification
                'registration_number' => $row->registration_number,
                'instansi_id' => $row->instansi_id ?? null,
                // Student identity
                'full_name' => $row->student_name ?? null,
                'email' => $row->email ?? null,
                'phone' => $row->phone ?? null,
                'birth_date' => $row->birth_date ?? null,
                'birth_place' => $row->birth_place ?? null,
                'gender' => $row->gender === 'male' ? 'L' : ($row->gender === 'female' ? 'P' : $row->gender),
                'address' => $row->address ?? '',
                // Previous school
                'previous_school' => $row->previous_school ?? '',
                'previous_school_address' => $row->previous_school_address ?? '',
                // Choices & path (best effort)
                'major_choice' => $row->major_choice ?? ($row->registration_path ?? ''),
                'registration_path' => $row->registration_path ?? null,
                // Parent
                'parent_name' => $row->parent_name ?? '',
                'parent_phone' => $row->parent_phone ?? '',
                'parent_occupation' => $row->parent_occupation ?? '',
                'parent_income' => $row->parent_income ?? null,
                // Status & scoring
                'status' => $row->status ?? 'pending',
                'selection_score' => $row->selection_score ?? null,
                'interview_score' => $row->interview_score ?? null,
                'document_score' => $row->document_score ?? null,
                'total_score' => $row->total_score ?? null,
                'notes' => $row->notes ?? null,
                // Dates
                'registration_date' => $row->registration_date ?? now(),
                'selection_date' => $row->selection_date ?? null,
                'announcement_date' => $row->announcement_date ?? null,
                'accepted_date' => $row->accepted_date ?? null,
                // Files & payment (if any columns exist in legacy, otherwise null)
                'photo_path' => $row->photo_path ?? null,
                'ijazah_path' => $row->ijazah_path ?? null,
                'kk_path' => $row->kk_path ?? null,
                'documents' => $row->documents ?? null,
                'payment_status' => $row->payment_status ?? null,
                'payment_date' => $row->payment_date ?? null,
                'payment_amount' => $row->payment_amount ?? null,
                'payment_receipt' => $row->payment_receipt ?? null,
                // Academic attributes (fallback)
                'academic_year' => $row->academic_year ?? (date('Y').'/'.(date('Y')+1)),
                'batch' => $row->batch ?? 'Gelombang 1',
                // Timestamps
                'created_at' => $row->created_at ?? now(),
                'updated_at' => $row->updated_at ?? now(),
            ]);
        }
    }

    public function down(): void
    {
        // No destructive rollback for data consolidation
    }
};


