<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Core\Tenant;
use App\Models\Core\TenantFeature;
use App\Models\Core\TenantModule;

class TenantAccessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Dapatkan semua tenant yang ada
        $tenants = Tenant::all();

        // Daftar fitur yang tersedia
        $availableFeatures = [
            'online_payment' => 'Pembayaran Online',
            'bulk_export' => 'Export Bulk Data',
            'advanced_reporting' => 'Laporan Lanjutan',
            'api_access' => 'Akses API',
            'custom_domain' => 'Domain Kustom',
            'backup_automation' => 'Backup Otomatis',
            'multi_language' => 'Multi Bahasa',
            'advanced_analytics' => 'Analitik Lanjutan',
            'sso_integration' => 'Integrasi SSO',
            'mobile_app' => 'Aplikasi Mobile',
        ];

        // Daftar modul yang tersedia
        $availableModules = [
            'ppdb' => 'PPDB/SPMB',
            'spp' => 'SPP (Sumbangan Pembinaan Pendidikan)',
            'library' => 'Perpustakaan',
            'inventory' => 'Inventori/Aset',
            'exam' => 'Ujian Online',
            'elearning' => 'E-Learning',
            'extracurricular' => 'Ekstrakurikuler',
            'parent_portal' => 'Portal Orang Tua',
            'counseling' => 'Bimbingan Konseling',
            'discipline' => 'Kedisiplinan',
            'graduation' => 'Pengumuman Kelulusan',
            'events' => 'Event/Agenda',
            'health' => 'Kesehatan',
            'transportation' => 'Transportasi',
            'cafeteria' => 'Kafetaria',
            'alumni' => 'Alumni',
        ];

        // Default permissions untuk setiap modul
        $defaultPermissions = [
            'ppdb' => ['create', 'read', 'update', 'export'],
            'spp' => ['create', 'read', 'update', 'export'],
            'library' => ['create', 'read', 'update', 'delete'],
            'inventory' => ['create', 'read', 'update', 'delete'],
            'exam' => ['create', 'read', 'update', 'delete'],
            'extracurricular' => ['create', 'read', 'update', 'delete'],
            'parent_portal' => ['create', 'read', 'update'],
            'counseling' => ['create', 'read', 'update'],
            'discipline' => ['create', 'read', 'update'],
            'graduation' => ['create', 'read', 'update', 'export'],
            'events' => ['create', 'read', 'update', 'delete'],
            'health' => ['create', 'read', 'update'],
            'transportation' => ['create', 'read', 'update'],
            'cafeteria' => ['create', 'read', 'update'],
            'alumni' => ['create', 'read', 'update'],
        ];

        foreach ($tenants as $tenant) {
            $this->command->info("Setting up access for tenant: {$tenant->name}");

            // Berikan akses fitur dasar untuk semua tenant
            $basicFeatures = ['online_payment', 'bulk_export', 'advanced_reporting'];
            foreach ($basicFeatures as $featureKey) {
                TenantFeature::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'feature_key' => $featureKey,
                    ],
                    [
                        'feature_name' => $availableFeatures[$featureKey],
                        'is_enabled' => true,
                        'settings' => $this->getDefaultFeatureSettings($featureKey),
                    ]
                );
            }

            // Berikan akses modul dasar untuk semua tenant
            $basicModules = ['ppdb', 'spp', 'library', 'inventory'];
            foreach ($basicModules as $moduleKey) {
                TenantModule::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'module_key' => $moduleKey,
                    ],
                    [
                        'module_name' => $availableModules[$moduleKey],
                        'is_enabled' => true,
                        'permissions' => $defaultPermissions[$moduleKey] ?? ['*'],
                        'settings' => $this->getDefaultModuleSettings($moduleKey),
                    ]
                );
            }

            // Berikan akses fitur premium untuk tenant dengan subscription
            if ($tenant->subscription_plan && $tenant->hasValidSubscription()) {
                $premiumFeatures = ['api_access', 'custom_domain', 'backup_automation', 'advanced_analytics'];
                foreach ($premiumFeatures as $featureKey) {
                    TenantFeature::updateOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'feature_key' => $featureKey,
                        ],
                        [
                            'feature_name' => $availableFeatures[$featureKey],
                            'is_enabled' => true,
                            'expires_at' => $tenant->subscription_expires_at,
                            'settings' => $this->getDefaultFeatureSettings($featureKey),
                        ]
                    );
                }

                // Berikan akses modul premium
                $premiumModules = ['exam', 'extracurricular', 'parent_portal', 'counseling'];
                foreach ($premiumModules as $moduleKey) {
                    TenantModule::updateOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'module_key' => $moduleKey,
                        ],
                        [
                            'module_name' => $availableModules[$moduleKey],
                            'is_enabled' => true,
                            'permissions' => $defaultPermissions[$moduleKey] ?? ['*'],
                            'expires_at' => $tenant->subscription_expires_at,
                            'settings' => $this->getDefaultModuleSettings($moduleKey),
                        ]
                    );
                }
            }

            // Berikan akses fitur enterprise untuk tenant enterprise
            if ($tenant->subscription_plan === 'enterprise') {
                $enterpriseFeatures = ['sso_integration', 'mobile_app', 'multi_language'];
                foreach ($enterpriseFeatures as $featureKey) {
                    TenantFeature::updateOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'feature_key' => $featureKey,
                        ],
                        [
                            'feature_name' => $availableFeatures[$featureKey],
                            'is_enabled' => true,
                            'expires_at' => $tenant->subscription_expires_at,
                            'settings' => $this->getDefaultFeatureSettings($featureKey),
                        ]
                    );
                }

                // Berikan akses semua modul untuk enterprise
                foreach ($availableModules as $moduleKey => $moduleName) {
                    if (!in_array($moduleKey, $basicModules) && !in_array($moduleKey, ['exam', 'extracurricular', 'parent_portal', 'counseling'])) {
                        TenantModule::updateOrCreate(
                            [
                                'tenant_id' => $tenant->id,
                                'module_key' => $moduleKey,
                            ],
                            [
                                'module_name' => $moduleName,
                                'is_enabled' => true,
                                'permissions' => $defaultPermissions[$moduleKey] ?? ['*'],
                                'expires_at' => $tenant->subscription_expires_at,
                                'settings' => $this->getDefaultModuleSettings($moduleKey),
                            ]
                        );
                    }
                }
            }
        }

        $this->command->info('Tenant access setup completed!');
    }

    /**
     * Get default settings for feature
     */
    private function getDefaultFeatureSettings(string $featureKey): array
    {
        $settings = [
            'online_payment' => [
                'payment_methods' => ['bank_transfer', 'credit_card'],
                'currency' => 'IDR',
                'fee_percentage' => 2.5,
            ],
            'bulk_export' => [
                'max_records' => 10000,
                'allowed_formats' => ['xlsx', 'csv', 'pdf'],
            ],
            'advanced_reporting' => [
                'max_reports' => 50,
                'retention_days' => 365,
            ],
            'api_access' => [
                'rate_limit' => 1000,
                'allowed_endpoints' => ['*'],
            ],
            'custom_domain' => [
                'ssl_enabled' => true,
                'subdomain_allowed' => true,
            ],
            'backup_automation' => [
                'frequency' => 'daily',
                'retention_days' => 30,
            ],
            'multi_language' => [
                'supported_languages' => ['id', 'en'],
                'default_language' => 'id',
            ],
            'advanced_analytics' => [
                'tracking_enabled' => true,
                'data_retention_days' => 90,
            ],
            'sso_integration' => [
                'providers' => ['google', 'microsoft'],
                'auto_provision' => true,
            ],
            'mobile_app' => [
                'push_notifications' => true,
                'offline_mode' => false,
            ],
        ];

        return $settings[$featureKey] ?? [];
    }

    /**
     * Get default settings for module
     */
    private function getDefaultModuleSettings(string $moduleKey): array
    {
        $settings = [
            'ppdb' => [
                'max_applications' => 1000,
                'registration_period' => 30,
                'auto_approval' => false,
            ],
            'spp' => [
                'payment_deadline' => 10,
                'late_fee_percentage' => 5,
                'auto_generate' => true,
            ],
            'library' => [
                'max_loan_days' => 14,
                'max_books_per_student' => 5,
                'auto_reminder' => true,
            ],
            'inventory' => [
                'low_stock_threshold' => 10,
                'auto_reorder' => false,
                'tracking_enabled' => true,
            ],
            'exam' => [
                'max_questions' => 100,
                'time_limit' => 120,
                'auto_save' => true,
            ],
            'extracurricular' => [
                'max_participants' => 50,
                'attendance_required' => true,
                'certificate_enabled' => true,
            ],
            'parent_portal' => [
                'notification_enabled' => true,
                'message_limit' => 100,
                'real_time_updates' => true,
            ],
            'counseling' => [
                'confidentiality_level' => 'high',
                'session_duration' => 60,
                'follow_up_required' => true,
            ],
            'discipline' => [
                'point_system' => true,
                'auto_escalation' => true,
                'parent_notification' => true,
            ],
            'graduation' => [
                'auto_calculate_gpa' => true,
                'certificate_template' => 'default',
                'ranking_enabled' => true,
            ],
            'events' => [
                'max_attendees' => 500,
                'registration_required' => false,
                'reminder_enabled' => true,
            ],
            'health' => [
                'bmi_tracking' => true,
                'vaccination_reminder' => true,
                'emergency_contacts' => true,
            ],
            'transportation' => [
                'gps_tracking' => false,
                'attendance_auto' => true,
                'route_optimization' => false,
            ],
            'cafeteria' => [
                'pre_order_enabled' => true,
                'payment_methods' => ['cash', 'card'],
                'nutrition_tracking' => false,
            ],
            'alumni' => [
                'networking_enabled' => true,
                'job_board' => true,
                'event_notifications' => true,
            ],
        ];

        return $settings[$moduleKey] ?? [];
    }
}