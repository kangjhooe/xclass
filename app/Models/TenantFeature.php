<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'icon',
        'category',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Get tenants that have this feature
     */
    public function tenants()
    {
        return $this->belongsToMany(Tenant::class, 'tenant_feature_pivot');
    }

    /**
     * Scope for active features
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for features by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get feature configuration
     */
    public static function getFeatureConfig($featureName)
    {
        $configs = [
            'academic' => [
                'name' => 'Academic Management',
                'description' => 'Student enrollment, classes, subjects, and academic records',
                'icon' => 'fas fa-graduation-cap',
                'category' => 'Core'
            ],
            'exam' => [
                'name' => 'Exam Management',
                'description' => 'Create and manage exams, assessments, and evaluations',
                'icon' => 'fas fa-clipboard-list',
                'category' => 'Core'
            ],
            'grade' => [
                'name' => 'Grade Management',
                'description' => 'Grade calculation, report cards, and academic progress',
                'icon' => 'fas fa-chart-line',
                'category' => 'Core'
            ],
            'attendance' => [
                'name' => 'Attendance System',
                'description' => 'Student and teacher attendance tracking',
                'icon' => 'fas fa-calendar-check',
                'category' => 'Core'
            ],
            'library' => [
                'name' => 'Library Management',
                'description' => 'Book catalog, borrowing, and library operations',
                'icon' => 'fas fa-book',
                'category' => 'Additional'
            ],
            'cafeteria' => [
                'name' => 'Cafeteria Management',
                'description' => 'Menu planning, orders, and cafeteria operations',
                'icon' => 'fas fa-utensils',
                'category' => 'Additional'
            ],
            'transport' => [
                'name' => 'Transport Management',
                'description' => 'Bus routes, student transportation, and vehicle tracking',
                'icon' => 'fas fa-bus',
                'category' => 'Additional'
            ],
            'hostel' => [
                'name' => 'Hostel Management',
                'description' => 'Dormitory management, room allocation, and resident tracking',
                'icon' => 'fas fa-bed',
                'category' => 'Additional'
            ],
            'finance' => [
                'name' => 'Finance Management',
                'description' => 'Fee collection, financial reports, and accounting',
                'icon' => 'fas fa-calculator',
                'category' => 'Finance'
            ],
            'communication' => [
                'name' => 'Communication Hub',
                'description' => 'Parent-teacher communication, announcements, and messaging',
                'icon' => 'fas fa-comments',
                'category' => 'Communication'
            ],
            'inventory' => [
                'name' => 'Inventory Management',
                'description' => 'Asset tracking, equipment management, and stock control',
                'icon' => 'fas fa-boxes',
                'category' => 'Additional'
            ],
            'hr' => [
                'name' => 'HR Management',
                'description' => 'Staff management, payroll, and human resources',
                'icon' => 'fas fa-users-cog',
                'category' => 'HR'
            ],
            'ppdb' => [
                'name' => 'PPDB (Student Admission)',
                'description' => 'New student registration and admission process',
                'icon' => 'fas fa-user-plus',
                'category' => 'Core'
            ],
            'news' => [
                'name' => 'News & Announcements',
                'description' => 'School news, announcements, and information sharing',
                'icon' => 'fas fa-newspaper',
                'category' => 'Communication'
            ],
            'reports' => [
                'name' => 'Advanced Reports',
                'description' => 'Detailed analytics, custom reports, and data visualization',
                'icon' => 'fas fa-chart-bar',
                'category' => 'Analytics'
            ]
        ];

        return $configs[$featureName] ?? null;
    }
}
