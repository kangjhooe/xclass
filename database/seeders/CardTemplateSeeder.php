<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\Tenant\CardTemplate;

class CardTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::where('is_active', true)->get();
        
        foreach ($tenants as $tenant) {
            $this->createDefaultTemplates($tenant);
        }
    }

    /**
     * Create default templates for a tenant
     */
    protected function createDefaultTemplates(Tenant $tenant)
    {
        // Student Card Templates
        $this->createStudentTemplateWithPhoto($tenant);
        $this->createStudentTemplateWithoutPhoto($tenant);
        
        // Teacher Card Templates
        $this->createTeacherTemplateWithPhoto($tenant);
        $this->createTeacherTemplateWithoutPhoto($tenant);
        
        // Staff Card Templates
        $this->createStaffTemplateWithPhoto($tenant);
        $this->createStaffTemplateWithoutPhoto($tenant);
    }

    /**
     * Create student card template with photo
     */
    protected function createStudentTemplateWithPhoto(Tenant $tenant)
    {
        CardTemplate::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kartu Siswa - Dengan Foto',
                'card_type' => 'student',
            ],
            [
                'npsn' => $tenant->npsn,
                'html_template' => $this->getStudentHtmlTemplate(),
                'css_template' => $this->getStudentCssTemplate(),
                'has_photo' => true,
                'has_barcode' => true,
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }

    /**
     * Create student card template without photo
     */
    protected function createStudentTemplateWithoutPhoto(Tenant $tenant)
    {
        CardTemplate::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kartu Siswa - Tanpa Foto',
                'card_type' => 'student',
            ],
            [
                'npsn' => $tenant->npsn,
                'html_template' => $this->getStudentHtmlTemplate(),
                'css_template' => $this->getStudentCssTemplate(),
                'has_photo' => false,
                'has_barcode' => true,
                'is_default' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );
    }

    /**
     * Create teacher card template with photo
     */
    protected function createTeacherTemplateWithPhoto(Tenant $tenant)
    {
        CardTemplate::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kartu Pegawai Guru - Dengan Foto',
                'card_type' => 'teacher',
            ],
            [
                'npsn' => $tenant->npsn,
                'html_template' => $this->getTeacherHtmlTemplate(),
                'css_template' => $this->getTeacherCssTemplate(),
                'has_photo' => true,
                'has_barcode' => true,
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }

    /**
     * Create teacher card template without photo
     */
    protected function createTeacherTemplateWithoutPhoto(Tenant $tenant)
    {
        CardTemplate::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kartu Pegawai Guru - Tanpa Foto',
                'card_type' => 'teacher',
            ],
            [
                'npsn' => $tenant->npsn,
                'html_template' => $this->getTeacherHtmlTemplate(),
                'css_template' => $this->getTeacherCssTemplate(),
                'has_photo' => false,
                'has_barcode' => true,
                'is_default' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );
    }

    /**
     * Create staff card template with photo
     */
    protected function createStaffTemplateWithPhoto(Tenant $tenant)
    {
        CardTemplate::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kartu Pegawai Staf - Dengan Foto',
                'card_type' => 'staff',
            ],
            [
                'npsn' => $tenant->npsn,
                'html_template' => $this->getStaffHtmlTemplate(),
                'css_template' => $this->getStaffCssTemplate(),
                'has_photo' => true,
                'has_barcode' => true,
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }

    /**
     * Create staff card template without photo
     */
    protected function createStaffTemplateWithoutPhoto(Tenant $tenant)
    {
        CardTemplate::updateOrCreate(
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kartu Pegawai Staf - Tanpa Foto',
                'card_type' => 'staff',
            ],
            [
                'npsn' => $tenant->npsn,
                'html_template' => $this->getStaffHtmlTemplate(),
                'css_template' => $this->getStaffCssTemplate(),
                'has_photo' => false,
                'has_barcode' => true,
                'is_default' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );
    }

    /**
     * Get student HTML template
     */
    protected function getStudentHtmlTemplate()
    {
        return '<div class="card-content">
            <div class="card-header">
                <h3>{{tenant_name}}</h3>
                <p class="subtitle">KARTU TANDA SISWA</p>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="label">NISN:</span>
                    <span class="value">{{nisn}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Nama:</span>
                    <span class="value">{{name}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Kelas:</span>
                    <span class="value">{{class}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Tempat/Tgl Lahir:</span>
                    <span class="value">{{birth_place}}, {{birth_date}}</span>
                </div>
            </div>
        </div>';
    }

    /**
     * Get student CSS template
     */
    protected function getStudentCssTemplate()
    {
        return '.card-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
        }
        .card-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .card-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .card-header .subtitle {
            margin: 5px 0 0;
            font-size: 12px;
            opacity: 0.9;
        }
        .card-body {
            margin-top: 15px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
        }
        .info-row .label {
            font-weight: bold;
        }';
    }

    /**
     * Get teacher HTML template
     */
    protected function getTeacherHtmlTemplate()
    {
        return '<div class="card-content">
            <div class="card-header">
                <h3>{{tenant_name}}</h3>
                <p class="subtitle">KARTU TANDA PEGAWAI</p>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="label">NIK:</span>
                    <span class="value">{{nik}}</span>
                </div>
                <div class="info-row">
                    <span class="label">NIP:</span>
                    <span class="value">{{nip}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Nama:</span>
                    <span class="value">{{name}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Jabatan:</span>
                    <span class="value">{{position}}</span>
                </div>
            </div>
        </div>';
    }

    /**
     * Get teacher CSS template
     */
    protected function getTeacherCssTemplate()
    {
        return '.card-content {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
        }
        .card-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .card-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .card-header .subtitle {
            margin: 5px 0 0;
            font-size: 12px;
            opacity: 0.9;
        }
        .card-body {
            margin-top: 15px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
        }
        .info-row .label {
            font-weight: bold;
        }';
    }

    /**
     * Get staff HTML template
     */
    protected function getStaffHtmlTemplate()
    {
        return '<div class="card-content">
            <div class="card-header">
                <h3>{{tenant_name}}</h3>
                <p class="subtitle">KARTU TANDA PEGAWAI</p>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <span class="label">NIK:</span>
                    <span class="value">{{nik}}</span>
                </div>
                <div class="info-row">
                    <span class="label">NIP:</span>
                    <span class="value">{{nip}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Nama:</span>
                    <span class="value">{{name}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Jabatan:</span>
                    <span class="value">{{position}}</span>
                </div>
                <div class="info-row">
                    <span class="label">Departemen:</span>
                    <span class="value">{{department}}</span>
                </div>
            </div>
        </div>';
    }

    /**
     * Get staff CSS template
     */
    protected function getStaffCssTemplate()
    {
        return '.card-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
        }
        .card-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .card-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .card-header .subtitle {
            margin: 5px 0 0;
            font-size: 12px;
            opacity: 0.9;
        }
        .card-body {
            margin-top: 15px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
        }
        .info-row .label {
            font-weight: bold;
        }';
    }
}

