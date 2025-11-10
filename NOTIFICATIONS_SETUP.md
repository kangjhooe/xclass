# Setup Notifications Service

Dokumen ini menjelaskan cara setup Notifications Service untuk mengirim email, SMS, dan push notifications.

## 📦 Library yang Sudah Terinstall

Library berikut sudah terinstall:
- `nodemailer` - Untuk email sending
- `twilio` - Untuk SMS sending
- `firebase-admin` - Untuk push notifications

## ⚙️ Konfigurasi Environment Variables

Tambahkan konfigurasi berikut ke file `.env` di root directory:

### Email Configuration (SMTP)

```env
# Contoh untuk Gmail:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Contoh untuk SMTP server lain:
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password
# SMTP_FROM=your-email@example.com
```

**Catatan untuk Gmail:**
- Gunakan App Password, bukan password biasa
- Aktifkan 2-Step Verification terlebih dahulu
- Buat App Password di: https://myaccount.google.com/apppasswords

### Twilio Configuration (SMS)

```env
# Dapatkan credentials dari https://www.twilio.com/console
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Cara mendapatkan Twilio credentials:**
1. Daftar di https://www.twilio.com
2. Login ke Twilio Console
3. Copy Account SID dan Auth Token
4. Dapatkan nomor telepon dari Twilio

### Firebase Configuration (Push Notifications)

**Opsi 1: Menggunakan File Path (Recommended)**
```env
# Simpan service account JSON file di folder config/ atau storage/
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

**Opsi 2: Menggunakan Environment Variable**
```env
# Masukkan JSON service account sebagai string (escape newlines dengan \n)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**Cara mendapatkan Firebase Service Account:**
1. Buka Firebase Console: https://console.firebase.google.com
2. Pilih project Anda
3. Buka Project Settings > Service Accounts
4. Klik "Generate new private key"
5. Simpan file JSON di folder `config/` atau gunakan path relatif/absolut
6. Atau copy isi JSON dan paste ke `FIREBASE_SERVICE_ACCOUNT` (sebagai string)

**Catatan:** Opsi 1 (file path) lebih direkomendasikan karena lebih aman dan mudah dikelola.

## 🚀 Cara Menggunakan

### Email

```typescript
await notificationsService.sendEmail(
  instansiId,
  userId,
  'recipient@example.com',
  'Subject Email',
  '<h1>Content HTML</h1>',
  templateId // optional
);
```

### SMS

```typescript
await notificationsService.sendSMS(
  instansiId,
  userId,
  '+6281234567890', // nomor telepon dengan format internasional
  'Pesan SMS',
  templateId // optional
);
```

### Push Notification

```typescript
await notificationsService.sendPush(
  instansiId,
  userId,
  'device-token-from-mobile-app',
  'Judul Notifikasi',
  'Isi notifikasi',
  templateId // optional
);
```

## 📝 Catatan Penting

1. **Fallback Behavior**: Jika konfigurasi tidak ditemukan, service akan tetap berjalan tetapi hanya menandai notifikasi sebagai "SENT" tanpa benar-benar mengirim. Ini memungkinkan development tanpa setup lengkap.

2. **Logging**: Semua aktivitas (success, warning, error) akan di-log menggunakan NestJS Logger.

3. **Error Handling**: Jika terjadi error saat mengirim, notifikasi akan ditandai sebagai "FAILED" dan error akan di-throw.

4. **Status Tracking**: Semua notifikasi memiliki status:
   - `PENDING` - Baru dibuat, belum dikirim
   - `SENT` - Berhasil dikirim
   - `FAILED` - Gagal dikirim

## ✅ Testing

Setelah setup konfigurasi, restart aplikasi dan cek log untuk memastikan semua service ter-initialize dengan benar:

```
[NotificationsService] Email transporter initialized successfully
[NotificationsService] Twilio client initialized successfully
[NotificationsService] Firebase Admin initialized successfully
```

Jika ada warning, berarti konfigurasi belum lengkap untuk service tersebut.

## 🔧 Troubleshooting

### Email tidak terkirim
- Pastikan SMTP credentials benar
- Untuk Gmail, pastikan menggunakan App Password
- Cek firewall/network yang memblokir SMTP port

### SMS tidak terkirim
- Pastikan Twilio credentials benar
- Pastikan nomor telepon dalam format internasional (+62...)
- Cek balance Twilio account

### Push notification tidak terkirim
- Pastikan Firebase service account JSON valid
- Pastikan device token masih aktif
- Cek Firebase project settings

---

**Dibuat:** 27 Januari 2025  
**Status:** ✅ Implementasi Selesai

