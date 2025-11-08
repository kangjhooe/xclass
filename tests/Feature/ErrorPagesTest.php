<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ErrorPagesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test 404 error page.
     */
    public function test_404_error_page()
    {
        $response = $this->get('/non-existent-page');
        
        $response->assertStatus(404);
        $response->assertViewIs('errors.404');
        $response->assertSee('Halaman Tidak Ditemukan');
    }

    /**
     * Test 403 error page.
     */
    public function test_403_error_page()
    {
        $response = $this->get('/test-errors/403');
        
        $response->assertStatus(403);
        $response->assertViewIs('errors.403');
        $response->assertSee('Akses Ditolak');
    }

    /**
     * Test 401 error page.
     */
    public function test_401_error_page()
    {
        $response = $this->get('/test-errors/401');
        
        $response->assertStatus(401);
        $response->assertViewIs('errors.401');
        $response->assertSee('Tidak Terotorisasi');
    }

    /**
     * Test 500 error page.
     */
    public function test_500_error_page()
    {
        $response = $this->get('/test-errors/500');
        
        $response->assertStatus(500);
        $response->assertViewIs('errors.500');
        $response->assertSee('Kesalahan Server Internal');
    }

    /**
     * Test 503 error page.
     */
    public function test_503_error_page()
    {
        $response = $this->get('/test-errors/503');
        
        $response->assertStatus(503);
        $response->assertViewIs('errors.503');
        $response->assertSee('Layanan Tidak Tersedia');
    }

    /**
     * Test 404 search error page.
     */
    public function test_404_search_error_page()
    {
        $response = $this->get('/test-errors/search-404');
        
        $response->assertStatus(302); // Redirect to 404 with search param
    }

    /**
     * Test error page layout.
     */
    public function test_error_page_layout()
    {
        $response = $this->get('/test-errors/404');
        
        $response->assertSee('CLASS');
        $response->assertSee('Bootstrap');
        $response->assertSee('Font Awesome');
    }

    /**
     * Test error page navigation buttons.
     */
    public function test_error_page_navigation()
    {
        $response = $this->get('/test-errors/404');
        
        $response->assertSee('Kembali ke Beranda');
        $response->assertSee('Kembali Sebelumnya');
    }
}
