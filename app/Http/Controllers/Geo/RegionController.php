<?php

namespace App\Http\Controllers\Geo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RegionController extends Controller
{
    /**
     * Base URL untuk API wilayah Indonesia
     * Menggunakan API publik yang menyediakan data resmi dari Kemendagri
     * Bisa diubah melalui config('services.region_api.base_url')
     */
    protected function getApiBaseUrl(): string
    {
        return config('services.region_api.base_url', 'https://wilayah.id/api');
    }

    /**
     * Cache duration dalam menit
     */
    protected function getCacheDuration(): int
    {
        return config('services.region_api.cache_duration', 60 * 24); // 24 jam default
    }

    /**
     * Fetch data dari API dengan caching
     */
    protected function fetchFromApi(string $endpoint, string $cacheKey): array
    {
        return Cache::remember($cacheKey, now()->addMinutes($this->getCacheDuration()), function () use ($endpoint) {
            try {
                $url = $this->getApiBaseUrl() . $endpoint;
                $timeout = config('services.region_api.timeout', 10);
                $response = Http::timeout($timeout)->get($url);
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    // Handle berbagai format response
                    // Format 1: { data: [...] }
                    if (isset($data['data']) && is_array($data['data'])) {
                        return $data['data'];
                    }
                    
                    // Format 2: Array langsung
                    if (is_array($data)) {
                        return $data;
                    }
                    
                    // Format 3: { provinces: [...] } atau { regencies: [...] } dll
                    $keys = ['provinces', 'regencies', 'districts', 'villages'];
                    foreach ($keys as $key) {
                        if (isset($data[$key]) && is_array($data[$key])) {
                            return $data[$key];
                        }
                    }
                    
                    return [];
                }
                
                Log::warning('API wilayah response tidak berhasil', [
                    'endpoint' => $endpoint,
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500) // Limit log size
                ]);
                
                return [];
            } catch (\Exception $e) {
                Log::error('Error fetching data dari API wilayah', [
                    'endpoint' => $endpoint,
                    'url' => $this->getApiBaseUrl() . $endpoint,
                    'error' => $e->getMessage()
                ]);
                
                // Fallback ke file lokal jika ada
                return $this->loadFromLocalFile($endpoint);
            }
        });
    }

    /**
     * Fallback: Load dari file lokal jika API gagal
     */
    protected function loadFromLocalFile(string $endpoint): array
    {
        try {
            $path = 'regions/regions.json';
            if (!\Storage::disk('local')->exists($path)) {
                return [];
            }
            
            $json = \Storage::disk('local')->get($path);
            $data = json_decode($json, true) ?: ['provinces' => []];
            
            // Map endpoint ke data yang sesuai
            if ($endpoint === '/provinces') {
                return $data['provinces'] ?? [];
            }
            
            // Untuk endpoint lainnya, perlu parsing lebih lanjut
            // Tapi untuk sementara return empty array
            return [];
        } catch (\Exception $e) {
            Log::error('Error loading dari file lokal', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get semua provinsi
     */
    public function provinces()
    {
        try {
            $provinces = $this->fetchFromApi('/provinces', 'geo.provinces');
            
            // Transform data jika diperlukan untuk format yang konsisten
            $formatted = array_map(function ($province) {
                return [
                    'code' => $province['kode'] ?? $province['code'] ?? null,
                    'name' => $province['nama'] ?? $province['name'] ?? null,
                ];
            }, $provinces);
            
            // Filter null values
            $formatted = array_filter($formatted, function ($item) {
                return $item['code'] && $item['name'];
            });
            
            return response()->json(array_values($formatted));
        } catch (\Exception $e) {
            Log::error('Error loading provinces', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([], 500);
        }
    }

    /**
     * Get kabupaten/kota berdasarkan kode provinsi
     */
    public function regencies($provinceCode)
    {
        try {
            $regencies = $this->fetchFromApi("/regencies/{$provinceCode}", "geo.regencies.{$provinceCode}");
            
            $formatted = array_map(function ($regency) {
                return [
                    'code' => $regency['kode'] ?? $regency['code'] ?? null,
                    'name' => $regency['nama'] ?? $regency['name'] ?? null,
                ];
            }, $regencies);
            
            $formatted = array_filter($formatted, function ($item) {
                return $item['code'] && $item['name'];
            });
            
            return response()->json(array_values($formatted));
        } catch (\Exception $e) {
            Log::error('Error loading regencies', [
                'province_code' => $provinceCode,
                'error' => $e->getMessage()
            ]);
            return response()->json([]);
        }
    }

    /**
     * Get kecamatan berdasarkan kode provinsi dan kabupaten
     */
    public function districts($provinceCode, $regencyCode)
    {
        try {
            $districts = $this->fetchFromApi(
                "/districts/{$provinceCode}/{$regencyCode}",
                "geo.districts.{$provinceCode}.{$regencyCode}"
            );
            
            $formatted = array_map(function ($district) {
                return [
                    'code' => $district['kode'] ?? $district['code'] ?? null,
                    'name' => $district['nama'] ?? $district['name'] ?? null,
                ];
            }, $districts);
            
            $formatted = array_filter($formatted, function ($item) {
                return $item['code'] && $item['name'];
            });
            
            return response()->json(array_values($formatted));
        } catch (\Exception $e) {
            Log::error('Error loading districts', [
                'province_code' => $provinceCode,
                'regency_code' => $regencyCode,
                'error' => $e->getMessage()
            ]);
            return response()->json([]);
        }
    }

    /**
     * Get kelurahan/desa berdasarkan kode provinsi, kabupaten, dan kecamatan
     */
    public function villages($provinceCode, $regencyCode, $districtCode)
    {
        try {
            $villages = $this->fetchFromApi(
                "/villages/{$provinceCode}/{$regencyCode}/{$districtCode}",
                "geo.villages.{$provinceCode}.{$regencyCode}.{$districtCode}"
            );
            
            $formatted = array_map(function ($village) {
                return [
                    'code' => $village['kode'] ?? $village['code'] ?? null,
                    'name' => $village['nama'] ?? $village['name'] ?? null,
                ];
            }, $villages);
            
            $formatted = array_filter($formatted, function ($item) {
                return $item['code'] && $item['name'];
            });
            
            return response()->json(array_values($formatted));
        } catch (\Exception $e) {
            Log::error('Error loading villages', [
                'province_code' => $provinceCode,
                'regency_code' => $regencyCode,
                'district_code' => $districtCode,
                'error' => $e->getMessage()
            ]);
            return response()->json([]);
        }
    }
}


