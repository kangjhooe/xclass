<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * API Documentation Controller
 * 
 * Provides API documentation for Data Pokok module
 */
class DocumentationController extends Controller
{
    /**
     * Get API documentation
     */
    public function index()
    {
        $documentation = [
            'title' => 'Data Pokok API Documentation',
            'version' => '1.0.0',
            'description' => 'API untuk modul Data Pokok - Sistem Manajemen Sekolah',
            'base_url' => url('/api'),
            'authentication' => [
                'type' => 'Bearer Token',
                'description' => 'Gunakan token yang didapat dari login untuk mengakses API',
                'header' => 'Authorization: Bearer {token}',
            ],
            'rate_limits' => [
                'import' => '5 requests per hour',
                'export' => '10 requests per hour',
                'api' => '100 requests per hour',
                'search' => '50 requests per 10 minutes',
            ],
            'endpoints' => [
                'autocomplete' => [
                    'base_url' => '/api/autocomplete',
                    'description' => 'Endpoints untuk autocomplete search',
                    'endpoints' => [
                        'institutions' => [
                            'method' => 'GET',
                            'url' => '/api/autocomplete/institutions',
                            'description' => 'Cari institusi berdasarkan nama',
                            'parameters' => [
                                'q' => [
                                    'type' => 'string',
                                    'required' => true,
                                    'description' => 'Query pencarian (minimal 2 karakter)',
                                ],
                                'limit' => [
                                    'type' => 'integer',
                                    'required' => false,
                                    'default' => 10,
                                    'description' => 'Jumlah hasil maksimal (maksimal 50)',
                                ],
                            ],
                            'response' => [
                                'success' => 'boolean',
                                'data' => 'array',
                                'message' => 'string (jika error)',
                            ],
                            'example' => [
                                'request' => 'GET /api/autocomplete/institutions?q=sma&limit=5',
                                'response' => [
                                    'success' => true,
                                    'data' => [
                                        [
                                            'id' => 1,
                                            'name' => 'SMA Negeri 1 Jakarta',
                                            'npsn' => '12345678',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'teachers' => [
                            'method' => 'GET',
                            'url' => '/api/autocomplete/teachers',
                            'description' => 'Cari guru berdasarkan nama atau NIP',
                            'parameters' => [
                                'q' => [
                                    'type' => 'string',
                                    'required' => true,
                                    'description' => 'Query pencarian (minimal 2 karakter)',
                                ],
                                'limit' => [
                                    'type' => 'integer',
                                    'required' => false,
                                    'default' => 10,
                                    'description' => 'Jumlah hasil maksimal (maksimal 50)',
                                ],
                            ],
                            'response' => [
                                'success' => 'boolean',
                                'data' => 'array',
                                'message' => 'string (jika error)',
                            ],
                        ],
                        'students' => [
                            'method' => 'GET',
                            'url' => '/api/autocomplete/students',
                            'description' => 'Cari siswa berdasarkan nama atau NIS',
                            'parameters' => [
                                'q' => [
                                    'type' => 'string',
                                    'required' => true,
                                    'description' => 'Query pencarian (minimal 2 karakter)',
                                ],
                                'limit' => [
                                    'type' => 'integer',
                                    'required' => false,
                                    'default' => 10,
                                    'description' => 'Jumlah hasil maksimal (maksimal 50)',
                                ],
                            ],
                            'response' => [
                                'success' => 'boolean',
                                'data' => 'array',
                                'message' => 'string (jika error)',
                            ],
                        ],
                        'staff' => [
                            'method' => 'GET',
                            'url' => '/api/autocomplete/staff',
                            'description' => 'Cari staf berdasarkan nama atau NIP',
                            'parameters' => [
                                'q' => [
                                    'type' => 'string',
                                    'required' => true,
                                    'description' => 'Query pencarian (minimal 2 karakter)',
                                ],
                                'limit' => [
                                    'type' => 'integer',
                                    'required' => false,
                                    'default' => 10,
                                    'description' => 'Jumlah hasil maksimal (maksimal 50)',
                                ],
                            ],
                            'response' => [
                                'success' => 'boolean',
                                'data' => 'array',
                                'message' => 'string (jika error)',
                            ],
                        ],
                        'classrooms' => [
                            'method' => 'GET',
                            'url' => '/api/autocomplete/classrooms',
                            'description' => 'Cari kelas berdasarkan nama atau level',
                            'parameters' => [
                                'q' => [
                                    'type' => 'string',
                                    'required' => true,
                                    'description' => 'Query pencarian (minimal 2 karakter)',
                                ],
                                'limit' => [
                                    'type' => 'integer',
                                    'required' => false,
                                    'default' => 10,
                                    'description' => 'Jumlah hasil maksimal (maksimal 50)',
                                ],
                            ],
                            'response' => [
                                'success' => 'boolean',
                                'data' => 'array',
                                'message' => 'string (jika error)',
                            ],
                        ],
                        'rate_limit' => [
                            'method' => 'GET',
                            'url' => '/api/autocomplete/rate-limit',
                            'description' => 'Cek informasi rate limit',
                            'response' => [
                                'success' => 'boolean',
                                'data' => [
                                    'remaining' => 'integer',
                                    'retry_after' => 'integer',
                                    'is_limited' => 'boolean',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'error_codes' => [
                400 => 'Bad Request - Parameter tidak valid',
                401 => 'Unauthorized - Token tidak valid atau expired',
                403 => 'Forbidden - Tidak memiliki izin untuk mengakses resource',
                404 => 'Not Found - Resource tidak ditemukan',
                429 => 'Too Many Requests - Rate limit exceeded',
                500 => 'Internal Server Error - Terjadi kesalahan server',
            ],
            'examples' => [
                'curl' => [
                    'autocomplete_institutions' => 'curl -H "Authorization: Bearer {token}" "https://your-domain.com/api/autocomplete/institutions?q=sma&limit=5"',
                    'autocomplete_teachers' => 'curl -H "Authorization: Bearer {token}" "https://your-domain.com/api/autocomplete/teachers?q=john&limit=10"',
                ],
                'javascript' => [
                    'autocomplete_institutions' => '
fetch("/api/autocomplete/institutions?q=sma&limit=5", {
    headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log(data.data);
    } else {
        console.error(data.message);
    }
});',
                ],
                'php' => [
                    'autocomplete_institutions' => '
$response = Http::withHeaders([
    "Authorization" => "Bearer " . $token,
    "Accept" => "application/json"
])->get("/api/autocomplete/institutions", [
    "q" => "sma",
    "limit" => 5
]);

$data = $response->json();
if ($data["success"]) {
    $institutions = $data["data"];
} else {
    throw new Exception($data["message"]);
}',
                ],
            ],
            'security' => [
                'authentication' => 'Semua endpoint memerlukan authentication',
                'rate_limiting' => 'Setiap endpoint memiliki rate limit yang berbeda',
                'tenant_isolation' => 'Data terbatas per tenant',
                'input_validation' => 'Semua input divalidasi dan disanitasi',
                'cors' => 'CORS diatur untuk keamanan',
            ],
            'changelog' => [
                '1.0.0' => [
                    'date' => '2025-10-29',
                    'changes' => [
                        'Initial release',
                        'Autocomplete endpoints untuk semua entitas',
                        'Rate limiting implementation',
                        'Security headers',
                        'Caching system',
                    ],
                ],
            ],
        ];

        return response()->json($documentation);
    }

    /**
     * Get OpenAPI specification
     */
    public function openapi()
    {
        $openapi = [
            'openapi' => '3.0.0',
            'info' => [
                'title' => 'Data Pokok API',
                'version' => '1.0.0',
                'description' => 'API untuk modul Data Pokok - Sistem Manajemen Sekolah',
                'contact' => [
                    'name' => 'API Support',
                    'email' => 'support@example.com',
                ],
            ],
            'servers' => [
                [
                    'url' => url('/api'),
                    'description' => 'Production server',
                ],
            ],
            'security' => [
                [
                    'bearerAuth' => [],
                ],
            ],
            'paths' => [
                '/autocomplete/institutions' => [
                    'get' => [
                        'tags' => ['Autocomplete'],
                        'summary' => 'Search institutions',
                        'description' => 'Cari institusi berdasarkan nama',
                        'parameters' => [
                            [
                                'name' => 'q',
                                'in' => 'query',
                                'required' => true,
                                'schema' => [
                                    'type' => 'string',
                                    'minLength' => 2,
                                ],
                                'description' => 'Query pencarian',
                            ],
                            [
                                'name' => 'limit',
                                'in' => 'query',
                                'required' => false,
                                'schema' => [
                                    'type' => 'integer',
                                    'default' => 10,
                                    'maximum' => 50,
                                ],
                                'description' => 'Jumlah hasil maksimal',
                            ],
                        ],
                        'responses' => [
                            '200' => [
                                'description' => 'Success',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'success' => [
                                                    'type' => 'boolean',
                                                ],
                                                'data' => [
                                                    'type' => 'array',
                                                    'items' => [
                                                        'type' => 'object',
                                                        'properties' => [
                                                            'id' => ['type' => 'integer'],
                                                            'name' => ['type' => 'string'],
                                                            'npsn' => ['type' => 'string'],
                                                        ],
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            '429' => [
                                'description' => 'Rate limit exceeded',
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'success' => ['type' => 'boolean'],
                                                'message' => ['type' => 'string'],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'components' => [
                'securitySchemes' => [
                    'bearerAuth' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'JWT',
                    ],
                ],
            ],
        ];

        return response()->json($openapi);
    }
}