<?php

namespace App\Http\Controllers\PPDB;

use App\Http\Controllers\Controller;
use App\Models\PPDBApplication;
use App\Models\PPDBProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function get(PPDBApplication $application)
    {
        $this->authorizeAccess($application);
        $profile = $application->profile;
        return response()->json([
            'application' => $application->only(['id','registration_number','full_name','academic_year','batch','status']),
            'profile' => $profile,
        ]);
    }

    public function saveStep(Request $request, PPDBApplication $application, int $step)
    {
        $this->authorizeAccess($application);

        $rules = $this->rulesForStep($step);
        Validator::make($request->all(), $rules)->validate();

        // If application-level fields are present, update them
        $applicationFields = [];
        foreach (['major_choice','registration_path'] as $f) {
            if ($request->filled($f)) { $applicationFields[$f] = $request->input($f); }
        }
        if (!empty($applicationFields)) {
            $application->update($applicationFields);
        }

        $profile = $application->profile ?: new PPDBProfile(['ppdb_application_id' => $application->id]);
        $profile->fill($request->only(array_keys($rules)));
        $profile->wizard_step = max($profile->wizard_step ?? 1, $step);
        $profile->ppdb_application_id = $application->id;
        $profile->save();

        return response()->json(['success' => true, 'wizard_step' => $profile->wizard_step]);
    }

    protected function rulesForStep(int $step): array
    {
        switch ($step) {
            case 1: // Data Siswa
                return [
                    'nisn' => 'nullable|string|max:20',
                    'nik' => 'nullable|string|max:20',
                    'gender' => 'nullable|in:L,P',
                    'blood_type' => 'nullable|in:A,B,O,AB',
                    'address_street' => 'nullable|string|max:255',
                    'address_village' => 'nullable|string|max:100',
                    'address_sub_district' => 'nullable|string|max:100',
                    'address_district' => 'nullable|string|max:100',
                    'address_city' => 'nullable|string|max:100',
                    'address_province' => 'nullable|string|max:100',
                    'kk_number' => 'nullable|string|max:32',
                    'social_card_number' => 'nullable|string|max:32',
                    'previous_school_name' => 'nullable|string|max:255',
                    'previous_school_address' => 'nullable|string|max:255',
                    'previous_school_npsn' => 'nullable|string|max:20',
                    'phone' => 'nullable|string|max:20',
                    'hobby' => 'nullable|string|max:100',
                    'ambition' => 'nullable|string|max:100',
                    'height_cm' => 'nullable|integer|min:1|max:300',
                    'weight_kg' => 'nullable|integer|min:1|max:300',
                    // pilihan jurusan & jalur
                    'major_choice' => 'nullable|string|max:255',
                    'registration_path' => 'nullable|string|max:255',
                ];
            case 2: // Data Keluarga
                return [
                    'family_child_order' => 'nullable|integer|min:1|max:20',
                    'siblings_count' => 'nullable|integer|min:0|max:20',
                    'step_siblings_count' => 'nullable|integer|min:0|max:20',
                    'parent_income_avg' => 'nullable|numeric|min:0',
                ];
            case 3: // Ayah/Ibu/Wali
                return [
                    'father_status' => 'nullable|string|max:20',
                    'father_nik' => 'nullable|string|max:20',
                    'father_name' => 'nullable|string|max:255',
                    'father_birth_place' => 'nullable|string|max:100',
                    'father_birth_date' => 'nullable|date',
                    'father_education' => 'nullable|string|max:50',
                    'father_occupation' => 'nullable|string|max:100',
                    'mother_status' => 'nullable|string|max:20',
                    'mother_nik' => 'nullable|string|max:20',
                    'mother_name' => 'nullable|string|max:255',
                    'mother_birth_place' => 'nullable|string|max:100',
                    'mother_birth_date' => 'nullable|date',
                    'mother_education' => 'nullable|string|max:50',
                    'mother_occupation' => 'nullable|string|max:100',
                    'guardian_relation_source' => 'nullable|in:same_as_father,same_as_mother,custom',
                    'guardian_nik' => 'nullable|string|max:20',
                    'guardian_name' => 'nullable|string|max:255',
                    'guardian_birth_place' => 'nullable|string|max:100',
                    'guardian_birth_date' => 'nullable|date',
                    'guardian_education' => 'nullable|string|max:50',
                    'guardian_occupation' => 'nullable|string|max:100',
                    'guardian_income' => 'nullable|numeric|min:0',
                ];
            default:
                return [];
        }
    }

    protected function authorizeAccess(PPDBApplication $application): void
    {
        $user = auth()->user();
        if (!$user || $application->user_id !== $user->id) {
            abort(403);
        }
    }

    public function upload(Request $request, PPDBApplication $application)
    {
        $this->authorizeAccess($application);

        // Use FileUploadService for secure uploads
        $uploadService = \App\Core\Services\PPDB\FileUploadService::class;
        
        $data = [];
        $errors = [];

        try {
            if ($request->hasFile('photo')) {
                $result = $uploadService::uploadPhoto($request->file('photo'), $application->photo_path);
                $data = array_merge($data, $result);
            }
            
            if ($request->hasFile('ijazah')) {
                $result = $uploadService::uploadDocument($request->file('ijazah'), 'ijazah', $application->ijazah_path);
                $data = array_merge($data, $result);
            }
            
            if ($request->hasFile('kk')) {
                $result = $uploadService::uploadDocument($request->file('kk'), 'kk', $application->kk_path);
                $data = array_merge($data, $result);
            }
            
            if ($request->hasFile('documents')) {
                $uploadedDocs = $uploadService::uploadDocuments(
                    $request->file('documents'),
                    $application->documents ?? []
                );
                $data['documents'] = array_merge($application->documents ?? [], $uploadedDocs);
            }

            if (!empty($data)) {
                $application->update($data);
            }

            // Set progress ke step 4
            $profile = $application->profile ?: new PPDBProfile(['ppdb_application_id' => $application->id]);
            $profile->wizard_step = max($profile->wizard_step ?? 1, 4);
            $profile->save();

            return response()->json([
                'success' => true,
                'photo_path' => $application->fresh()->photo_path,
                'ijazah_path' => $application->fresh()->ijazah_path,
                'kk_path' => $application->fresh()->kk_path,
                'documents' => $application->fresh()->documents,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}


