# Production Environment Setup (projek.online)

> This guide captures the exact values used on the `31.97.48.89` VPS for the `projek.online` deployment.  
> Adjust the placeholders if your infrastructure changes later on.

## 1. Server & Database Assumptions

- **Public IP**: `31.97.48.89`
- **Primary domain**: `http://projek.online`
- **Backend (NestJS)**: `http://31.97.48.89:3000`
- **Frontend (Next.js)**: `http://31.97.48.89:3001`
- **Database host**: `127.0.0.1`
- **Database name**: `class`
- **Database user / pass**: `xclass / xclass`
- **Node.js**: v18+ (check with `node -v`)

## 2. Backend `.env.production`

Create `c:\xampp\htdocs\xclass\.env.production` (on the server place it next to `package.json`):

```
NODE_ENV=production
PORT=3000
API_URL=http://projek.online/api
FRONTEND_URL=http://projek.online,http://31.97.48.89:3001

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=xclass
DB_PASSWORD=xclass
DB_DATABASE=class

# JWT
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=24h

# Rate limiting (safe defaults for production)
THROTTLE_LIMIT=200
THROTTLE_LIMIT_MEDIUM=1000
THROTTLE_LIMIT_LONG=10000

# File storage
UPLOAD_PATH=./storage/app/public

# Optional integrations (fill only when available)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
FIREBASE_SERVICE_ACCOUNT_PATH=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
XENDIT_SUCCESS_REDIRECT_URL=http://projek.online/subscription/payment/success
XENDIT_FAILURE_REDIRECT_URL=http://projek.online/subscription/payment/failed
```

**Notes**
- `FRONTEND_URL` now accepts a comma separated list. The first item is used for deep links (password reset etc.), all entries are allowed for CORS & WebSocket connections.
- Always regenerate `JWT_SECRET` with at least 32 random characters before going live.
- Keep this file outside of version control (`.gitignore` already covers `.env*`).

## 3. Frontend `frontend/.env.production`

```
NEXT_PUBLIC_API_URL=http://projek.online/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

If you terminate TLS at a reverse proxy and expose the frontend on HTTPS, simply change the scheme (`https://projek.online`).

## 4. Deployment Steps (Ubuntu/Debian VPS)

```bash
ssh user@31.97.48.89
sudo apt update && sudo apt upgrade -y

# Node.js 18 & build tooling
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# PM2 for process management
sudo npm install -g pm2
```

```bash
# Clone and install
cd /var/www
git clone <your-repo> xclass
cd xclass
npm install
cd frontend && npm install && cd ..

# Copy the production env files created above
cp .env.production .env
cp frontend/.env.production frontend/.env.local
```

```bash
# Build artifacts
npm run build
cd frontend && npm run build && cd ..

# Start with PM2
pm2 start dist/main.js --name xclass-backend
cd frontend
pm2 start npm --name xclass-frontend -- start
cd ..
pm2 save
pm2 startup    # follow the instructions so processes restart on boot
```

## 5. Optional Nginx Reverse Proxy

```
server {
    listen 80;
    server_name projek.online;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.projek.online;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:

```
sudo ln -s /etc/nginx/sites-available/xclass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Add Certbot (`sudo certbot --nginx -d projek.online -d api.projek.online`) when you are ready for HTTPS.

## 6. Smoke Test Checklist

1. `pm2 status` shows both processes online.
2. `curl http://31.97.48.89:3000/api/health` (or `/api/docs`) returns 200.
3. Open `http://projek.online` and login with a known account.
4. Open browser dev tools → Network tab: verify API requests hit `http://projek.online/api/...` and are not blocked by CORS.
5. Check WebSocket events (notifications/messages) – they should connect to `ws://projek.online/notifications` without mixed content warnings.
6. Run `pm2 logs xclass-backend --lines 50` if errors persist.

Keeping this checklist in the repo should make future VPS deployments repeatable and auditable. Update this document whenever the infrastructure (ports, domains, credentials) changes. 

