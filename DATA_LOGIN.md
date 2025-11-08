# Data Login Aplikasi CLASS

## Login Admin
**Link**: `http://localhost/class/login` atau `http://class.app/login`
- **Email**: admin@class.app
- **Password**: password
- **Role**: super_admin

## Login Tenant

### SMA Negeri 1 Jakarta
**Link**: `http://localhost/class/12345678/login`
- **NPSN**: 12345678
- **Admin**: admin@sman1jakarta.sch.id / password
- **Guru**: guru@sman1jakarta.sch.id / password

### SMA Al Falah Krui
**Link**: `http://localhost/class/12345678/login` atau `http://alfalahkrui.com/login`
- **NPSN**: 12345678
- **Admin**: admin@alfalahkrui.com / password

### SMA Negeri 2 Jakarta
**Link**: `http://localhost/class/87654321/login`
- **NPSN**: 87654321
- **Admin**: admin.test@sman2jakarta.sch.id / password
- **Guru 1**: guru1.test@sman2jakarta.sch.id / password
- **Guru 2**: guru2.test@sman2jakarta.sch.id / password
- **Siswa 1**: siswa1.test@sman2jakarta.sch.id / password
- **Siswa 2**: siswa2.test@sman2jakarta.sch.id / password
- **Orang Tua**: ortu.test@sman2jakarta.sch.id / password

## Peran Pengguna (Roles)
1. **super_admin** - Administrator sistem utama
2. **school_admin** - Administrator sekolah
3. **teacher** - Guru
4. **student** - Siswa
5. **parent** - Orang tua

## Catatan
- Semua password default: `password`
- Format tanggal: DD-MM-YYYY (Indonesian style)
- Timezone: Asia/Jakarta

## Menjalankan Seeder
```bash
php artisan db:seed
php artisan db:seed --class=TenantSeeder
php artisan db:seed --class=SystemTestSeeder
php artisan db:seed --class=PublicPageSeeder
```
