# Setup Payment Gateway Xendit untuk Subscription

Dokumen ini menjelaskan cara setup dan menggunakan payment gateway Xendit untuk pembayaran subscription.

## 📦 Package yang Sudah Terinstall

- `xendit-node` - Official Xendit SDK untuk Node.js

## ⚙️ Konfigurasi Environment Variables

Tambahkan konfigurasi berikut ke file `.env` di root directory:

```env
# Xendit Configuration
XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-webhook-token-optional

# Xendit Redirect URLs (optional)
XENDIT_SUCCESS_REDIRECT_URL=http://localhost:3001/subscription/payment/success
XENDIT_FAILURE_REDIRECT_URL=http://localhost:3001/subscription/payment/failed
```

### Cara Mendapatkan Xendit Credentials

1. **Daftar di Xendit**: https://www.xendit.co
2. **Login ke Dashboard**: https://dashboard.xendit.co
3. **Settings > API Keys**: Copy Secret Key
4. **Settings > Webhooks**: Setup webhook URL dan dapatkan webhook token

**Catatan:**
- Untuk development, gunakan Xendit Test Mode
- Secret Key untuk test mode berbeda dengan production
- Webhook URL harus publicly accessible (gunakan ngrok untuk local development)

## 🗄️ Database Migration

Entity `PaymentGatewayTransaction` akan otomatis dibuat oleh TypeORM jika `NODE_ENV=development`.

Jika perlu membuat migration manual:

```sql
CREATE TABLE IF NOT EXISTS `payment_gateway_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_subscription_id` bigint(20) unsigned NOT NULL,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `provider` enum('xendit') NOT NULL DEFAULT 'xendit',
  `payment_method` enum('qris','virtual_account','e_wallet') NOT NULL,
  `status` enum('pending','paid','expired','failed','cancelled') NOT NULL DEFAULT 'pending',
  `amount` decimal(12,2) NOT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `payment_url` text DEFAULT NULL,
  `qr_code` text DEFAULT NULL,
  `virtual_account_number` text DEFAULT NULL,
  `e_wallet_id` text DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_gateway_transactions_tenant_subscription_id_index` (`tenant_subscription_id`),
  KEY `payment_gateway_transactions_tenant_id_index` (`tenant_id`),
  KEY `payment_gateway_transactions_external_id_index` (`external_id`),
  CONSTRAINT `payment_gateway_transactions_tenant_subscription_id_foreign` 
    FOREIGN KEY (`tenant_subscription_id`) REFERENCES `tenant_subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔌 API Endpoints

### 1. Create Payment

**POST** `/api/subscriptions/tenants/:tenantId/payment`

**Request Body:**
```json
{
  "paymentMethod": "qris", // "qris" | "virtual_account" | "e_wallet"
  "amount": 5000000,
  "bankCode": "BCA", // Required for virtual_account: BCA, BNI, BRI, MANDIRI, PERMATA
  "channelCode": "OVO" // Required for e_wallet: OVO, DANA, LINKAJA, SHOPEEPAY
}
```

**Response:**
```json
{
  "id": 1,
  "paymentMethod": "qris",
  "amount": 5000000,
  "paymentUrl": "https://checkout.xendit.co/web/...",
  "qrCode": "data:image/png;base64,...",
  "virtualAccountNumber": null,
  "eWalletId": null,
  "expiresAt": "2024-01-02T12:00:00Z",
  "status": "pending"
}
```

### 2. Get Payment Status

**GET** `/api/subscriptions/tenants/:tenantId/payment/:transactionId`

**Response:**
```json
{
  "id": 1,
  "status": "paid",
  "amount": 5000000,
  "paymentUrl": "https://checkout.xendit.co/web/...",
  "qrCode": null,
  "virtualAccountNumber": null,
  "eWalletId": null,
  "expiresAt": null,
  "paidAt": "2024-01-01T10:30:00Z"
}
```

### 3. Webhook Handler

**POST** `/api/subscriptions/webhooks/xendit`

Webhook ini akan otomatis dipanggil oleh Xendit ketika status payment berubah.

## 💳 Metode Pembayaran yang Didukung

### 1. QRIS
- Tidak perlu parameter tambahan
- User scan QR code dengan aplikasi e-wallet atau mobile banking
- Expiry: 24 jam

### 2. Virtual Account
- **Bank Code yang didukung:**
  - `BCA` - Bank Central Asia
  - `BNI` - Bank Negara Indonesia
  - `BRI` - Bank Rakyat Indonesia
  - `MANDIRI` - Bank Mandiri
  - `PERMATA` - Bank Permata
- User transfer ke nomor VA yang diberikan
- Expiry: 24 jam

### 3. E-Wallet
- **Channel Code yang didukung:**
  - `OVO` - OVO
  - `DANA` - DANA
  - `LINKAJA` - LinkAja
  - `SHOPEEPAY` - ShopeePay
- User bayar melalui aplikasi e-wallet
- Expiry: 24 jam

## 🔄 Alur Pembayaran

1. **User memilih metode pembayaran** → Frontend call API create payment
2. **Backend create invoice di Xendit** → Dapat payment URL/QR Code/VA Number
3. **Backend simpan transaction** → Status: PENDING
4. **User melakukan pembayaran** → Di Xendit atau aplikasi bank/e-wallet
5. **Xendit kirim webhook** → Backend update status ke PAID
6. **Backend update subscription** → Mark subscription as paid
7. **Frontend polling/redirect** → Cek status payment

## 🧪 Testing

### Test Mode

1. Gunakan Xendit Test Mode Secret Key
2. Untuk test payment, gunakan:
   - **QRIS**: Scan dengan aplikasi e-wallet test
   - **Virtual Account**: Transfer ke VA number (gunakan test account)
   - **E-Wallet**: Gunakan test account dari masing-masing provider

### Webhook Testing

Untuk test webhook di local development:

1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 3000`
3. Copy ngrok URL ke Xendit webhook settings
4. Webhook URL: `https://your-ngrok-url.ngrok.io/api/subscriptions/webhooks/xendit`

## 📝 Frontend Integration

Contoh penggunaan di frontend:

```typescript
import { subscriptionApi } from '@/lib/api/subscription';

// Create payment
const payment = await subscriptionApi.createPayment(tenantId, {
  paymentMethod: 'qris',
  amount: 5000000,
});

// Get payment status
const status = await subscriptionApi.getPaymentStatus(tenantId, transactionId);
```

## ⚠️ Catatan Penting

1. **Security**: Jangan commit Xendit Secret Key ke repository
2. **Webhook Verification**: Selalu verify webhook signature di production
3. **Idempotency**: External ID harus unique untuk prevent duplicate payment
4. **Error Handling**: Handle semua error case (expired, failed, cancelled)
5. **Testing**: Selalu test di Xendit Test Mode sebelum production

## 🚀 Production Checklist

- [ ] Setup Xendit Production Account
- [ ] Update XENDIT_SECRET_KEY dengan production key
- [ ] Setup webhook URL di Xendit Dashboard
- [ ] Verify webhook signature
- [ ] Test semua payment methods
- [ ] Setup monitoring untuk failed payments
- [ ] Setup alert untuk payment issues

