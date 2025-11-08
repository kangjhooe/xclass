-- Fix Tenant Access untuk NPSN 87654321
-- Script ini akan mengaktifkan modul students dan modul core lainnya

-- Cari tenant_id untuk NPSN 87654321
SET @tenant_id = (SELECT id FROM tenants WHERE npsn = '87654321' LIMIT 1);

-- Jika tenant ditemukan, aktifkan modul-modul yang diperlukan
INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'students',
    'Manajemen Siswa',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'students'
);

INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'teachers',
    'Manajemen Guru',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'teachers'
);

INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'classes',
    'Manajemen Kelas',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'classes'
);

INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'subjects',
    'Manajemen Mata Pelajaran',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'subjects'
);

INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'schedules',
    'Manajemen Jadwal',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'schedules'
);

INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'attendance',
    'Manajemen Kehadiran',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'attendance'
);

INSERT INTO tenant_modules (tenant_id, module_key, module_name, is_enabled, permissions, settings, created_at, updated_at)
SELECT 
    @tenant_id,
    'grades',
    'Manajemen Nilai',
    1,
    '["*"]',
    '{}',
    NOW(),
    NOW()
WHERE @tenant_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tenant_modules 
    WHERE tenant_id = @tenant_id AND module_key = 'grades'
);

-- Update modul yang sudah ada tapi tidak aktif
UPDATE tenant_modules 
SET is_enabled = 1, updated_at = NOW()
WHERE tenant_id = @tenant_id 
AND module_key IN ('students', 'teachers', 'classes', 'subjects', 'schedules', 'attendance', 'grades')
AND is_enabled = 0;

-- Tampilkan hasil
SELECT 
    t.name as tenant_name,
    t.npsn,
    tm.module_key,
    tm.module_name,
    tm.is_enabled,
    tm.permissions
FROM tenants t
LEFT JOIN tenant_modules tm ON t.id = tm.tenant_id
WHERE t.npsn = '87654321'
ORDER BY tm.module_key;
