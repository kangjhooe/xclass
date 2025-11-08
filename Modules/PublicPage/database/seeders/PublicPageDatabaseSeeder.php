<?php

namespace Modules\PublicPage\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PublicPage\Models\News;
use Modules\PublicPage\Models\Menu;

class PublicPageDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first tenant
        $tenant = \App\Models\Core\Tenant::first();
        
        if (!$tenant) {
            $this->command->warn('No tenant found. Please create a tenant first.');
            return;
        }

        // Create sample news
        $newsData = [
            [
                'instansi_id' => $tenant->id,
                'title' => 'Selamat Datang di ' . $tenant->name,
                'slug' => 'selamat-datang',
                'content' => '<p>Kami dengan bangga mengumumkan peluncuran website resmi ' . $tenant->name . '. Website ini hadir untuk memberikan informasi terkini dan layanan terbaik kepada seluruh masyarakat.</p><p>Melalui website ini, Anda dapat mengakses berbagai informasi penting, berita terbaru, dan layanan yang kami sediakan. Kami berkomitmen untuk terus mengembangkan dan memperbarui konten agar tetap relevan dan bermanfaat.</p><p>Terima kasih atas kepercayaan Anda kepada kami. Mari bersama-sama membangun masa depan yang lebih baik.</p>',
                'excerpt' => 'Kami dengan bangga mengumumkan peluncuran website resmi ' . $tenant->name . '. Website ini hadir untuk memberikan informasi terkini dan layanan terbaik kepada seluruh masyarakat.',
                'author' => 'Admin',
                'status' => 'published',
                'published_at' => now(),
                'is_featured' => true,
                'meta_title' => 'Selamat Datang di ' . $tenant->name,
                'meta_description' => 'Website resmi ' . $tenant->name . ' untuk informasi terkini dan layanan terbaik.',
                'meta_keywords' => 'website, informasi, layanan, ' . strtolower($tenant->name),
            ],
            [
                'instansi_id' => $tenant->id,
                'title' => 'Panduan Penggunaan Website',
                'slug' => 'panduan-penggunaan-website',
                'content' => '<p>Website ini dirancang dengan antarmuka yang user-friendly untuk memudahkan navigasi dan pencarian informasi. Berikut adalah panduan singkat untuk menggunakan website:</p><h3>Navigasi Menu</h3><p>Gunakan menu sidebar di sebelah kiri untuk mengakses berbagai halaman dan fitur yang tersedia.</p><h3>Pencarian Berita</h3><p>Gunakan kotak pencarian di sidebar untuk mencari berita atau informasi tertentu.</p><h3>Kontak</h3><p>Jika Anda membutuhkan bantuan atau memiliki pertanyaan, silakan hubungi kami melalui halaman kontak.</p>',
                'excerpt' => 'Panduan singkat untuk menggunakan website dengan antarmuka yang user-friendly dan mudah dinavigasi.',
                'author' => 'Admin',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'is_featured' => false,
                'meta_title' => 'Panduan Penggunaan Website',
                'meta_description' => 'Panduan lengkap untuk menggunakan website dengan mudah dan efisien.',
                'meta_keywords' => 'panduan, website, navigasi, bantuan',
            ],
            [
                'instansi_id' => $tenant->id,
                'title' => 'Informasi Terbaru',
                'slug' => 'informasi-terbaru',
                'content' => '<p>Kami akan terus memperbarui informasi dan berita terbaru di website ini. Pastikan untuk mengunjungi website secara berkala untuk mendapatkan informasi terkini.</p><p>Anda juga dapat mengikuti kami di media sosial untuk mendapatkan update terbaru.</p>',
                'excerpt' => 'Informasi terbaru akan terus diperbarui di website ini. Kunjungi secara berkala untuk update terkini.',
                'author' => 'Admin',
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'is_featured' => false,
                'meta_title' => 'Informasi Terbaru',
                'meta_description' => 'Dapatkan informasi terbaru dan update terkini dari ' . $tenant->name . '.',
                'meta_keywords' => 'informasi, terbaru, update, berita',
            ],
        ];

        foreach ($newsData as $news) {
            if (!News::where('slug', $news['slug'])->exists()) {
                News::create($news);
            }
        }

        // Create sample menus
        $menuData = [
            [
                'instansi_id' => $tenant->id,
                'name' => 'Beranda',
                'url' => '/',
                'icon' => 'fas fa-home',
                'parent_id' => null,
                'order' => 1,
                'is_active' => true,
                'target' => '_self',
            ],
            [
                'instansi_id' => $tenant->id,
                'name' => 'Berita',
                'url' => '/berita',
                'icon' => 'fas fa-newspaper',
                'parent_id' => null,
                'order' => 2,
                'is_active' => true,
                'target' => '_self',
            ],
            [
                'instansi_id' => $tenant->id,
                'name' => 'Galeri',
                'url' => '/galeri',
                'icon' => 'fas fa-images',
                'parent_id' => null,
                'order' => 3,
                'is_active' => true,
                'target' => '_self',
            ],
            [
                'instansi_id' => $tenant->id,
                'name' => 'Tentang Kami',
                'url' => '/tentang',
                'icon' => 'fas fa-info-circle',
                'parent_id' => null,
                'order' => 4,
                'is_active' => true,
                'target' => '_self',
            ],
            [
                'instansi_id' => $tenant->id,
                'name' => 'Kontak',
                'url' => '/kontak',
                'icon' => 'fas fa-envelope',
                'parent_id' => null,
                'order' => 5,
                'is_active' => true,
                'target' => '_self',
            ],
        ];

        foreach ($menuData as $menu) {
            if (!Menu::where('name', $menu['name'])->where('instansi_id', $tenant->id)->exists()) {
                Menu::create($menu);
            }
        }

        $this->command->info('Public page data seeded successfully!');
    }
}
