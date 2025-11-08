<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// use Modules\PublicPage\Models\Menu;
// use Modules\PublicPage\Models\News;
// use Modules\PublicPage\Models\Gallery;
// use Modules\PublicPage\Models\TenantProfile;
use App\Models\Core\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PublicPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a tenant
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'npsn' => '12345678',
                'name' => 'SMA Al Falah Krui',
                'email' => 'admin@alfalahkrui.com',
                'phone' => '08123456789',
                'address' => 'Jl. Pendidikan No. 1',
                'city' => 'Krui',
                'province' => 'Lampung',
                'postal_code' => '34884',
                'custom_domain' => 'alfalahkrui.com',
                'is_active' => true,
                'subscription_plan' => 'premium',
            ]);
        }

        // Create admin user for tenant
        $admin = User::firstOrCreate(
            ['email' => 'admin@alfalahkrui.com'],
            [
                'name' => 'Admin SMA Al Falah',
                'password' => Hash::make('password'),
                'role' => 'school_admin',
                'instansi_id' => $tenant->id,
                'is_active' => true,
            ]
        );

        // Create tenant profile using DB facade
        \DB::table('tenant_profiles')->insertOrIgnore([
            'instansi_id' => $tenant->id,
            'institution_name' => 'SMA Al Falah Krui',
            'institution_type' => 'Sekolah Menengah Atas',
            'slogan' => 'Mencerdaskan Generasi Bangsa',
            'description' => 'SMA Al Falah Krui adalah sekolah menengah atas yang berkomitmen untuk memberikan pendidikan berkualitas tinggi dengan mengintegrasikan nilai-nilai Islam dalam setiap aspek pembelajaran.',
            'vision' => 'Menjadi sekolah unggulan yang menghasilkan lulusan berakhlak mulia, cerdas, dan berdaya saing global.',
            'mission' => 'Menyelenggarakan pendidikan yang berkualitas dengan mengintegrasikan nilai-nilai Islam, mengembangkan potensi peserta didik secara optimal, dan membentuk karakter yang kuat.',
            'address' => 'Jl. Pendidikan No. 1, Krui',
            'city' => 'Krui',
            'province' => 'Lampung',
            'postal_code' => '34884',
            'phone' => '08123456789',
            'email' => 'info@alfalahkrui.com',
            'website' => 'https://alfalahkrui.com',
            'social_media' => json_encode([
                'facebook' => 'https://facebook.com/alfalahkrui',
                'instagram' => 'https://instagram.com/alfalahkrui',
                'youtube' => 'https://youtube.com/alfalahkrui',
            ]),
            'hero_title' => 'Selamat Datang di SMA Al Falah Krui',
            'hero_subtitle' => 'Mencerdaskan Generasi Bangsa dengan Pendidikan Berkualitas',
            'about_title' => 'Tentang SMA Al Falah Krui',
            'about_content' => 'SMA Al Falah Krui telah berdiri sejak tahun 1995 dan telah meluluskan ribuan siswa yang berhasil melanjutkan pendidikan ke perguruan tinggi terbaik di Indonesia. Kami berkomitmen untuk memberikan pendidikan yang holistik, mengembangkan potensi akademik dan non-akademik siswa.',
            'contact_info' => json_encode([
                'whatsapp' => '08123456789',
                'email' => 'info@alfalahkrui.com',
                'address' => 'Jl. Pendidikan No. 1, Krui, Lampung',
            ]),
            'seo_title' => 'SMA Al Falah Krui - Sekolah Unggulan di Lampung',
            'seo_description' => 'SMA Al Falah Krui adalah sekolah menengah atas unggulan di Lampung yang mengintegrasikan nilai-nilai Islam dalam pendidikan berkualitas tinggi.',
            'seo_keywords' => 'SMA Al Falah, Krui, Lampung, Sekolah Islam, Pendidikan Berkualitas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create menus
        $menus = [
            [
                'title' => 'Beranda',
                'slug' => 'beranda',
                'url' => '/',
                'type' => 'page',
                'order' => 1,
                'is_active' => true,
                'is_external' => false,
                'icon' => 'fas fa-home',
            ],
            [
                'title' => 'Profil',
                'slug' => 'profil',
                'url' => '/about',
                'type' => 'page',
                'order' => 2,
                'is_active' => true,
                'is_external' => false,
                'icon' => 'fas fa-info-circle',
            ],
            [
                'title' => 'Berita',
                'slug' => 'berita',
                'url' => '/news',
                'type' => 'page',
                'order' => 3,
                'is_active' => true,
                'is_external' => false,
                'icon' => 'fas fa-newspaper',
            ],
            [
                'title' => 'Galeri',
                'slug' => 'galeri',
                'url' => '/gallery',
                'type' => 'page',
                'order' => 4,
                'is_active' => true,
                'is_external' => false,
                'icon' => 'fas fa-images',
            ],
            [
                'title' => 'Kontak',
                'slug' => 'kontak',
                'url' => '/contact',
                'type' => 'page',
                'order' => 5,
                'is_active' => true,
                'is_external' => false,
                'icon' => 'fas fa-phone',
            ],
        ];

        foreach ($menus as $menuData) {
            \DB::table('menus')->insertOrIgnore(array_merge($menuData, [
                'instansi_id' => $tenant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Create sample news
        $newsItems = [
            [
                'title' => 'Penerimaan Siswa Baru Tahun Ajaran 2024/2025',
                'slug' => 'penerimaan-siswa-baru-tahun-ajaran-2024-2025',
                'content' => '<p>Kami mengundang calon siswa dan orang tua untuk bergabung dengan SMA Al Falah Krui. Pendaftaran dibuka mulai tanggal 1 Januari 2024.</p><p>Persyaratan pendaftaran:</p><ul><li>Lulusan SMP/MTs</li><li>Usia maksimal 18 tahun</li><li>Membawa fotocopy ijazah dan transkrip nilai</li><li>Membawa pas foto 3x4 sebanyak 2 lembar</li></ul>',
                'excerpt' => 'Pendaftaran siswa baru SMA Al Falah Krui untuk tahun ajaran 2024/2025 telah dibuka. Segera daftarkan putra-putri Anda.',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'is_featured' => true,
                'author_id' => $admin->id,
            ],
            [
                'title' => 'Kegiatan Ekstrakurikuler Semester Genap',
                'slug' => 'kegiatan-ekstrakurikuler-semester-genap',
                'content' => '<p>Berbagai kegiatan ekstrakurikuler menarik telah disiapkan untuk semester genap ini. Siswa dapat memilih sesuai minat dan bakat mereka.</p><p>Ekstrakurikuler yang tersedia:</p><ul><li>Pramuka</li><li>Olahraga (Basket, Voli, Futsal)</li><li>Seni (Tari, Musik, Teater)</li><li>Bahasa (English Club, Arabic Club)</li><li>Teknologi (Robotik, Programming)</li></ul>',
                'excerpt' => 'Daftar kegiatan ekstrakurikuler semester genap telah dibuka. Pilih sesuai minat dan bakat Anda.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'is_featured' => false,
                'author_id' => $admin->id,
            ],
            [
                'title' => 'Prestasi Siswa di Olimpiade Sains Nasional',
                'slug' => 'prestasi-siswa-di-olimpiade-sains-nasional',
                'content' => '<p>Kami bangga mengumumkan bahwa 3 siswa SMA Al Falah Krui berhasil meraih medali di Olimpiade Sains Nasional tingkat provinsi.</p><p>Prestasi yang diraih:</p><ul><li>Medali Emas - Matematika (Ahmad Rizki)</li><li>Medali Perak - Fisika (Siti Nurhaliza)</li><li>Medali Perunggu - Kimia (Muhammad Fajar)</li></ul><p>Selamat kepada para siswa yang telah mengharumkan nama sekolah!</p>',
                'excerpt' => 'Tiga siswa SMA Al Falah Krui berhasil meraih medali di Olimpiade Sains Nasional tingkat provinsi.',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'is_featured' => true,
                'author_id' => $admin->id,
            ],
        ];

        foreach ($newsItems as $newsData) {
            \DB::table('news')->insertOrIgnore(array_merge($newsData, [
                'instansi_id' => $tenant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('PublicPage seeder completed successfully!');
    }
}
