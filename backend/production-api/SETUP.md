# Setup Guide - Production API

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
```

3. **Configure `.env` file:**
   - Set database credentials
   - Set JWT secrets (use strong random strings in production)
   - Set Google OAuth **Web Client ID** (lihat catatan di bawah)
   - Configure other settings as needed

   **Penting untuk Google OAuth:**
   - OAuth verification dilakukan di aplikasi (Android/Web), bukan di backend
   - Backend hanya menerima data yang sudah di-authenticate: `id_token`, `email`, `name`, `picture`
   - Backend akan menyimpan/update user ke database dan generate JWT tokens
   - `GOOGLE_CLIENT_ID` di backend adalah optional (jika ingin verifikasi tambahan)
   - Android apps dan Web apps masing-masing melakukan OAuth di sisi mereka
   - Setelah OAuth berhasil, aplikasi mengirim data ke endpoint `/api/auth/google`

4. **Set up database:**
```bash
# Run migrations
npm run migrate

# (Optional) Run seeders
npm run seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or port specified in `.env`)

## Environment Variables

See `env.example` for all available environment variables.

### Required for Production:
- `JWT_SECRET` - Secret key for JWT access tokens (min 32 characters)
- `JWT_REFRESH_SECRET` - Secret key for JWT refresh tokens (min 32 characters)
- `GOOGLE_CLIENT_ID` - Google OAuth **Web Client ID** (bukan Android Client ID)
  - Backend memverifikasi id_token menggunakan Web Client ID
  - Cocok untuk Android apps dan Web apps
- `DATABASE_URL` - PostgreSQL connection string (or use individual DB_* variables)

### Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins
- `LOG_LEVEL` - Logging level (error/warn/info/debug)
- `LOG_TO_FILE` - Enable file logging (true/false)

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Google Sign-In
```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "your-google-id-token",
    "email": "user@example.com",
    "name": "Test User",
    "picture": "https://example.com/avatar.jpg"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your-refresh-token"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer your-access-token"
```

## Project Structure

```
production-api/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── migrations/       # Database migrations
├── models/           # Sequelize models
├── routes/           # API routes
├── utils/            # Utility functions
├── logs/             # Log files (created automatically)
├── index.js          # Server entry point
└── package.json      # Dependencies and scripts
```

## Security Notes

1. **Never commit `.env` file** - It contains sensitive information
2. **Use strong JWT secrets** - Generate random strings (32+ characters)
3. **Enable HTTPS in production** - Configure SSL certificates
4. **Set proper CORS origins** - Don't use `*` in production
5. **Keep dependencies updated** - Regularly run `npm audit`

## Troubleshooting

### Database connection errors
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists: `CREATE DATABASE securedoor;`

### JWT errors
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Ensure secrets are the same across server instances (if load balanced)

### Google OAuth errors
- Pastikan aplikasi (Android/Web) sudah melakukan OAuth dengan benar
- Backend menerima: `id_token` (required), `email` (required), `name` (optional), `picture` (optional)
- Backend tidak melakukan verifikasi Google token (trust data dari aplikasi)
- Pastikan `id_token` dan `email` dikirim dengan benar dari aplikasi
- `GOOGLE_CLIENT_ID` di backend adalah optional (tidak diperlukan untuk operasi normal)
- Jika ingin verifikasi tambahan di backend, bisa set `GOOGLE_CLIENT_ID` (Web Client ID)

### Port already in use
- Change `PORT` in `.env`
- Or kill the process using the port

## API Documentation

See `API_DOCUMENTATION.md` for detailed API endpoint documentation.

