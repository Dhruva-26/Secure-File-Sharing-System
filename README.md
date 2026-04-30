# Secure File Sharing System

Production-ready full-stack application for secure file upload, AES-256 encryption at rest, controlled sharing, OTP-based verification, and expiry-aware downloads.

## 1) Full Project Folder Structure

```text
Secure-File-Sharing-System/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── fileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── validate.js
│   ├── models/
│   │   ├── File.js
│   │   ├── Otp.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── fileRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── uploads/
│   │   ├── encrypted/
│   │   └── tmp/
│   ├── utils/
│   │   ├── crypto.js
│   │   └── jwt.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── OtpModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── utils/
│   │   │   └── format.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 2) Backend Code (all files)
All backend source files are fully implemented in `backend/` with modular architecture for models, middleware, routes, controllers, services, and utilities.

## 3) Frontend Code (all files)
All frontend source files are fully implemented in `frontend/` using React functional components, hooks, Tailwind CSS, Axios, and route protection.

## 4) .env example
Copy and configure these files:
- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

## 5) Instructions to run project

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## 6) Notes
- Passwords are hashed with bcrypt.
- JWT auth is enforced on file APIs.
- Uploaded files are encrypted with AES-256-CBC and decrypted only for authorized downloads.
- OTP is email-based using Nodemailer and stored with expiry (TTL).
- File expiry is enforced before download.

## Troubleshooting
- If backend crashes with `ECONNREFUSED 127.0.0.1:587`, your SMTP settings are pointing to localhost mail server that is not running. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in `backend/.env` correctly.
- If MongoDB fails with `ECONNREFUSED 127.0.0.1:27017`, either start local MongoDB or switch `MONGO_URI` to MongoDB Atlas URI.
