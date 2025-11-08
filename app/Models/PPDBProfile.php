<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PPDBProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'ppdb_application_id',
        'nisn','nik','gender','blood_type',
        'address_street','address_village','address_sub_district','address_district','address_city','address_province',
        'kk_number','social_card_number',
        'previous_school_name','previous_school_address','previous_school_npsn',
        'phone','hobby','ambition','height_cm','weight_kg',
        'family_child_order','siblings_count','step_siblings_count','parent_income_avg',
        'father_status','father_nik','father_name','father_birth_place','father_birth_date','father_education','father_occupation',
        'mother_status','mother_nik','mother_name','mother_birth_place','mother_birth_date','mother_education','mother_occupation',
        'guardian_relation_source','guardian_nik','guardian_name','guardian_birth_place','guardian_birth_date','guardian_education','guardian_occupation','guardian_income',
        'wizard_step'
    ];

    protected $casts = [
        'father_birth_date' => 'date',
        'mother_birth_date' => 'date',
        'guardian_birth_date' => 'date',
        'parent_income_avg' => 'decimal:2',
        'guardian_income' => 'decimal:2',
    ];

    public function application()
    {
        return $this->belongsTo(PPDBApplication::class, 'ppdb_application_id');
    }
}


