# 📋 Deployment Checklist - XCLASS

Dokumen ini berisi checklist lengkap untuk deployment aplikasi XCLASS ke hosting production.

## ✅ Pre-Deployment Checklist

### 1. **Backend (NestJS)**

#### Build & Test
- [x] ✅ Build backend berhasil (`npm run build`)
- [ ] Test semua API endpoints
- [ ] Verifikasi koneksi database
- [ ] Test authentication & authorization
- [ ] Test file upload functionality

#### Environment Variables
Pastikan file `.env` di root memiliki konfigurasi berikut:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_DATABASE=xclass

# JWT Configuration
JWT_SECRET=your-strong-secret-key-change-this
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=production
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase Configuration (Optional)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# WhatsApp Configuration (Optional)
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# Xendit Payment Gateway (Optional)
XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-webhook-token
XENDIT_SUCCESS_REDIRECT_URL=https://yourdomain.com/subscription/payment/success
XENDIT_FAILURE_REDIRECT_URL=https://yourdomain.com/subscription/payment/failed

# Storage Configuration
UPLOAD_PATH=./storage/app/public
```

#### Konfigurasi Penting
- [ ] ✅ CORS sudah dikonfigurasi untuk production (hanya allow frontend URL)
- [ ] ✅ TypeORM `synchronize: false` (untuk production, gunakan migration)
- [ ] ✅ Logging disabled untuk production
- [ ] ✅ Port menggunakan environment variable
- [ ] ✅ JWT_SECRET menggunakan strong random key

### 2. **Frontend (Next.js)**

#### Build & Test
- [ ] Build frontend berhasil (`cd frontend && npm run build`)
- [ ] Test semua halaman
- [ ] Test responsive design
- [ ] Test authentication flow
- [ ] Test API integration

#### Environment Variables
Pastikan file `frontend/.env.local` memiliki:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

#### Konfigurasi Penting
- [ ] ✅ Image optimization enabled
- [ ] ✅ Security headers configured
- [ ] ✅ CSP (Content Security Policy) configured
- [ ] ✅ API URL menggunakan environment variable

### 3. **Database**

#### Setup Database
- [ ] Database MySQL/MariaDB sudah dibuat
- [ ] Database menggunakan charset `utf8mb4` dan collation `utf8mb4_unicode_ci`
- [ ] User database memiliki permission yang cukup
- [ ] Backup database development (jika ada data penting)

#### Migration
- [ ] ✅ TypeORM synchronize: false (untuk production)
- [ ] Jalankan migration jika ada
- [ ] Verifikasi semua tabel sudah dibuat
- [ ] Test koneksi database dari server production

### 4. **File Storage**

- [ ] Folder `storage/app/public` ada dan writable
- [ ] Folder `storage/app/private` ada dan writable
- [ ] Permission folder storage: 755 atau 775
- [ ] Test file upload functionality
- [ ] Setup backup untuk file storage (jika perlu)

### 5. **Security**

- [ ] ✅ JWT_SECRET menggunakan strong random key (minimal 32 karakter)
- [ ] ✅ CORS hanya allow frontend domain production
- [ ] ✅ HTTPS enabled untuk production
- [ ] ✅ Environment variables tidak commit ke git
- [ ] ✅ `.env` file ada di `.gitignore`
- [ ] ✅ Database password kuat
- [ ] ✅ Firewall configured (jika perlu)
- [ ] ✅ Rate limiting enabled (jika perlu)

### 6. **Server Configuration**

#### Node.js
- [ ] Node.js version 18+ terinstall
- [ ] PM2 atau process manager terinstall (untuk production)
- [ ] Nginx atau reverse proxy configured (jika perlu)

#### Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start backend dengan PM2
pm2 start dist/main.js --name xclass-backend

# Start frontend dengan PM2 (jika standalone)
cd frontend
pm2 start npm --name xclass-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Nginx Configuration (Contoh)
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. **SSL/HTTPS**

- [ ] SSL certificate terinstall (Let's Encrypt atau lainnya)
- [ ] HTTPS redirect configured
- [ ] Mixed content issues resolved

### 8. **Monitoring & Logging**

- [ ] Error logging configured
- [ ] Application monitoring setup (jika perlu)
- [ ] Database monitoring (jika perlu)
- [ ] Uptime monitoring (jika perlu)

### 9. **Backup Strategy**

- [ ] Database backup strategy
- [ ] File storage backup strategy
- [ ] Backup automation setup
- [ ] Test restore procedure

### 10. **Testing**

- [ ] ✅ Backend build test passed
- [ ] Frontend build test (sedang diperbaiki)
- [ ] Integration test
- [ ] Load test (jika perlu)
- [ ] Security test

## 🚀 Deployment Steps

### Step 1: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MySQL/MariaDB (jika belum ada)
sudo apt install mysql-server -y
```

### Step 2: Clone & Setup
```bash
# Clone repository
git clone <your-repo-url> xclass
cd xclass

# Install dependencies
npm install
cd frontend && npm install && cd ..
```

### Step 3: Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env dengan konfigurasi production
nano .env

# Copy frontend .env
cd frontend
cp .env.example .env.local
nano .env.local
cd ..
```

### Step 4: Build Applications
```bash
# Build backend
npm run build

# Build frontend
cd frontend
npm run build
cd ..
```

### Step 5: Setup Database
```bash
# Create database
mysql -u root -p
CREATE DATABASE xclass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations (jika ada)
# npm run migration:run
```

### Step 6: Start Applications
```bash
# Start backend dengan PM2
pm2 start dist/main.js --name xclass-backend

# Start frontend dengan PM2
cd frontend
pm2 start npm --name xclass-frontend -- start
cd ..

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 7: Configure Nginx (Optional)
```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/xclass

# Enable site
sudo ln -s /etc/nginx/sites-available/xclass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Setup SSL (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## ⚠️ Known Issues & Fixes

### Frontend Build Errors
- ✅ Fixed: Duplicate `useMutation` import di `biometric/page.tsx`
- ✅ Fixed: Missing closing tag di `correspondence/page.tsx`
- ✅ Fixed: Missing React import di `subscription/page.tsx`
- ⚠️ Warning: Turbopack parsing warnings (tidak critical, bisa diabaikan)

### Backend Configuration
- ✅ CORS sudah dikonfigurasi untuk production
- ✅ Port menggunakan environment variable
- ✅ TypeORM synchronize: false untuk production

## 📝 Post-Deployment Checklist

- [ ] Test semua fitur utama
- [ ] Test login/logout
- [ ] Test file upload
- [ ] Test API endpoints
- [ ] Monitor error logs
- [ ] Check server resources (CPU, Memory, Disk)
- [ ] Setup automated backups
- [ ] Document deployment process

## 🔧 Troubleshooting

### Backend tidak start
```bash
# Check logs
pm2 logs xclass-backend

# Check database connection
node test-db-connection.js

# Check environment variables
cat .env
```

### Frontend tidak load
```bash
# Check logs
pm2 logs xclass-frontend

# Check build
cd frontend && npm run build

# Check environment
cat .env.local
```

### Database connection error
- Pastikan database sudah dibuat
- Pastikan user database memiliki permission
- Pastikan firewall allow koneksi database
- Test koneksi: `node test-db-connection.js`

## 📞 Support

Jika ada masalah saat deployment, cek:
1. Error logs (PM2 logs)
2. Database connection
3. Environment variables
4. File permissions
5. Network/firewall settings

---

**Last Updated:** $(date)
**Version:** 0.1.1

