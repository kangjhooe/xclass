# CLASS - School Management System

**Version: 0.1**

Aplikasi manajemen sekolah berbasis NestJS (backend) dan Next.js (frontend).

## 🚀 Tech Stack

### Backend
- **Framework**: NestJS (Node.js, TypeScript)
- **ORM**: TypeORM
- **Database**: MySQL
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Data Fetching**: React Query (TanStack Query)

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm atau yarn

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd class
```

### 2. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
```

### 3. Setup Environment

Buat file `.env` di root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=class
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

Buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Database Setup

Pastikan database MySQL sudah dibuat dan dikonfigurasi. TypeORM akan auto-sync entities jika `NODE_ENV=development`.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend (NestJS):**
```bash
npm run start:dev
```
Backend akan berjalan di http://localhost:3000

**Terminal 2 - Frontend (Next.js):**
```bash
cd frontend
npm run dev
```
Frontend akan berjalan di http://localhost:3001 (atau port yang ditentukan Next.js)

### Production Mode

**Build Backend:**
```bash
npm run build
npm run start:prod
```

**Build Frontend:**
```bash
cd frontend
npm run build
npm run start
```

## 📁 Project Structure

```
class/
├── src/                    # NestJS backend source
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── admin/          # Super admin
│   │   ├── users/          # User management
│   │   ├── students/       # Student management
│   │   ├── teachers/       # Teacher management
│   │   └── ...            # Other modules
│   ├── common/             # Shared utilities
│   │   ├── decorators/     # Custom decorators
│   │   ├── guards/         # Auth guards
│   │   └── middleware/     # Custom middleware
│   └── main.ts             # Application entry point
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin pages
│   │   ├── [tenant]/       # Tenant pages
│   │   └── login/          # Auth pages
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   │   ├── api/            # API client
│   │   └── store/           # State management
│   └── public/             # Static files
├── database/               # Database files
│   ├── sql/                # SQL migration scripts
│   └── database.sqlite     # SQLite database (optional)
└── storage/                # File storage
    └── app/                # Uploaded files
```

## 🔐 Authentication

Aplikasi menggunakan JWT authentication. Setelah login, token akan disimpan dan digunakan untuk semua API requests.

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "super_admin",
    "instansiId": 1
  }
}
```

### Using Token

```bash
GET /api/users
Authorization: Bearer YOUR_TOKEN
```

## 📚 API Documentation

### Admin Endpoints (Super Admin Only)

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create tenant
- `GET /api/admin/tenants/:id` - Get tenant details
- `PUT /api/admin/tenants/:id` - Update tenant
- `POST /api/admin/tenants/:id/activate` - Activate tenant
- `POST /api/admin/tenants/:id/deactivate` - Deactivate tenant
- `DELETE /api/admin/tenants/:id` - Delete tenant
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users/:id/activate` - Activate user
- `POST /api/admin/users/:id/deactivate` - Deactivate user

### Public Page Endpoints

- `GET /api/public/home` - Home statistics
- `GET /api/public/news` - List news
- `GET /api/public/news/featured` - Featured news
- `GET /api/public/news/latest` - Latest news
- `GET /api/public/news/:slug` - Get news by slug
- `GET /api/public/galleries` - List galleries
- `GET /api/public/galleries/:id` - Get gallery by id
- `GET /api/public/menus` - Get active menus
- `GET /api/public/profile` - Get tenant profile

### Other Modules

Semua modul lain memiliki endpoints standar:
- `GET /api/{module}` - List items
- `GET /api/{module}/:id` - Get item details
- `POST /api/{module}` - Create item
- `PUT /api/{module}/:id` - Update item
- `DELETE /api/{module}/:id` - Delete item

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Available Scripts

### Backend
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debug mode
- `npm run lint` - Lint code
- `npm run format` - Format code

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code

## 🔒 Security

- JWT tokens dengan expiration
- Password hashing dengan bcrypt
- Role-based access control (RBAC)
- Input validation dengan class-validator
- SQL injection protection dengan TypeORM

## 📖 Documentation

- `TEKNOLOGI_STACK.md` - Detail stack teknologi
- `MIGRASI_FRONTEND.md` - Panduan migrasi frontend
- `MIGRASI_SELESAI.md` - Dokumentasi sejarah migrasi

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Untuk bantuan dan pertanyaan, silakan buat issue di repository ini.

---

**Note**: Aplikasi ini menggunakan stack modern NestJS (backend) dan Next.js (frontend). Semua fitur inti sudah tersedia dan siap digunakan.
