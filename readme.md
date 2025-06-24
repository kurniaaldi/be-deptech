# 🏢 Employee Leave Management - Backend API

Express.js backend API untuk aplikasi manajemen cuti pegawai. Menggunakan Sequelize dan MySQL dengan fitur:

- CRUD Pegawai
- CRUD Cuti Pegawai
- Validasi cuti (maks. 12 hari/tahun & 1x/bulan)
- Pagination support
- JWT Auth Middleware
- Eager loading (relasi Employee–Leave)

## 🚀 Tech Stack

- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- CORS, Helmet, dotenv

## 📁 Struktur Proyek

```
├── models/
│   ├── employee.js
│   └── leave.js
├── controllers/
│   ├── authController.js
│   ├── employeeController.js
│   └── leaveController.js
├── routes/
│   ├── auth.js
│   ├── employee.js
│   └── leave.js
├── middleware/
│   └── authMiddleware.js
└── server.js
```

## ⚙️ Instalasi

```bash
git clone https://github.com/yourname/employee-leave-api.git
cd employee-leave-api
npm install
```

Buat file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=employee_leave
JWT_SECRET=your_secret_key
```

## 🧪 Menjalankan Aplikasi

```bash
npx sequelize db:migrate
npm run dev
```

## 🔐 Endpoint Autentikasi

- `POST /api/auth/login` → login
- `GET /api/auth/me` → get current user

## 📘 Endpoint Pegawai

- `GET /api/employee?page=1&limit=10`
- `POST /api/employee`
- `PUT /api/employee/:id`
- `DELETE /api/employee/:id`

## 📘 Endpoint Cuti

- `GET /api/leave?page=1&limit=10`
- `POST /api/leave`
- `PUT /api/leave/:id`
- `DELETE /api/leave/:id`

## ✅ Validasi Cuti

- Maksimal 12 hari dalam setahun
- Hanya 1 cuti per bulan per pegawai
