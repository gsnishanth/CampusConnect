# 🎓 CampusConnect – Lost & Found Portal

> A full-stack MERN application that helps college students and administrators manage lost and found items on campus with intelligent matching, claim verification, and real-time notifications.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- **User Authentication** – Secure JWT-based register/login with role-based access (Student / Admin)
- **Report Lost & Found Items** – Submit detailed reports with images, category, location, and date
- **Smart Matching Engine** – Automatically scores and suggests matches between lost and found items (category, location, date, keyword similarity)
- **Claim Submission & Verification** – Students can claim items; admins verify ownership via hidden detail questions
- **Admin Dashboard** – Full control over items, claims, users, and site statistics
- **Real-time Notifications** – In-app notifications for matches, claim updates, and decisions
- **Image Upload** – Cloudinary-powered image storage with local fallback
- **Search & Filter** – Filter items by type, category, location, and date range
- **Responsive UI** – Mobile-first design with Tailwind CSS
- **Security** – Helmet, CORS, rate limiting, bcrypt password hashing, httpOnly cookies

---

## 🛠 Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| **Frontend**  | React 18, Vite, Tailwind CSS, Axios, React Router v6, Lucide React, React Hot Toast |
| **Backend**   | Node.js 18+, Express 4, JWT, Bcrypt, Multer, Express Validator, Express Rate Limit |
| **Database**  | MongoDB 7.x, Mongoose ODM                       |
| **Storage**   | Cloudinary (images), Local filesystem fallback  |

---

## 📁 Folder Structure

```
CampusConnect/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── claimController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT protect middleware
│   │   ├── roleCheck.js           # isAdmin / isStudent
│   │   ├── errorHandler.js        # Global error handler
│   │   └── uploadMiddleware.js    # Multer + Cloudinary
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Claim.js
│   │   ├── Notification.js
│   │   └── VerificationDetail.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── claimRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── matchingService.js     # Scoring algorithm
│   │   └── notificationService.js
│   ├── utils/
│   │   └── apiResponse.js         # Standardized responses
│   ├── uploads/                   # Local image fallback
│   │   └── .gitkeep
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── placeholder.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, Spinner, etc.
│   │   │   ├── items/             # ItemCard, ItemForm, etc.
│   │   │   └── admin/             # AdminSidebar, StatCard, etc.
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── student/           # Dashboard, ReportItem, ItemDetail, MyClaims, etc.
│   │   │   └── admin/             # AdminDashboard, ManageItems, ManageClaims, etc.
│   │   ├── utils/
│   │   │   └── helpers.js         # formatDate, truncate, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── README.md
└── SETUP_GUIDE.md
```

---

## ✅ Prerequisites

- **Node.js** v18 or higher – [Download](https://nodejs.org/)
- **MongoDB** v6+ (local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) account
- **npm** v9+ (bundled with Node.js)
- **Cloudinary** account (optional – falls back to local storage) – [Sign up](https://cloudinary.com/)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/campusconnect.git
cd campusconnect
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables section)
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env if your backend runs on a different URL
```

### 4. Start the Development Servers

**Backend** (runs on port 5000):
```bash
cd backend
npm run dev
```

**Frontend** (in a new terminal, runs on port 5173):
```bash
cd frontend
npm run dev
```

### 5. Open the App

Navigate to **http://localhost:5173** in your browser.

> Register an account to get started. To create an admin, see [Test Accounts](#-test-accounts) in SETUP_GUIDE.md.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable                  | Required | Description                                                |
|---------------------------|----------|------------------------------------------------------------|
| `PORT`                    | No       | Server port (default: `5000`)                              |
| `MONGO_URI`               | **Yes**  | MongoDB connection string (e.g. `mongodb://localhost:27017/campusconnect`) |
| `JWT_SECRET`              | **Yes**  | Long random secret for signing JWTs (min 32 chars)         |
| `JWT_EXPIRES_IN`          | No       | Token expiry (default: `7d`)                               |
| `NODE_ENV`                | No       | `development` or `production`                              |
| `CLOUDINARY_CLOUD_NAME`   | No       | Cloudinary cloud name (from dashboard)                     |
| `CLOUDINARY_API_KEY`      | No       | Cloudinary API key                                         |
| `CLOUDINARY_API_SECRET`   | No       | Cloudinary API secret                                      |
| `FRONTEND_URL`            | No       | Allowed CORS origin (default: `http://localhost:5173`)     |

### Frontend (`frontend/.env`)

| Variable        | Required | Description                                     |
|-----------------|----------|-------------------------------------------------|
| `VITE_API_URL`  | **Yes**  | Backend API base URL (e.g. `http://localhost:5000/api`) |

---

## 📡 API Documentation

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication (`/api/auth`)

| Method | Path                  | Auth     | Description                        |
|--------|-----------------------|----------|------------------------------------|
| POST   | `/auth/register`      | Public   | Register a new student account     |
| POST   | `/auth/login`         | Public   | Login and receive JWT token        |
| GET    | `/auth/me`            | 🔒 User  | Get current authenticated user     |
| POST   | `/auth/logout`        | 🔒 User  | Logout (clears cookie)             |

### Items (`/api/items`)

| Method | Path                        | Auth      | Description                               |
|--------|-----------------------------|-----------|-------------------------------------------|
| GET    | `/items`                    | Public    | List items with filters (type, category, location, date, search) |
| POST   | `/items`                    | 🔒 User   | Create a new lost/found report (multipart/form-data) |
| GET    | `/items/:id`                | Public    | Get item details                          |
| PUT    | `/items/:id`                | 🔒 Owner  | Update an item (multipart/form-data)      |
| DELETE | `/items/:id`                | 🔒 Owner/Admin | Delete an item                       |
| GET    | `/items/:id/matches`        | 🔒 User   | Get AI-matched items for a report         |
| GET    | `/items/my`                 | 🔒 User   | Get current user's posted items           |

### Claims (`/api/claims`)

| Method | Path                        | Auth        | Description                             |
|--------|-----------------------------|-------------|-----------------------------------------|
| POST   | `/claims`                   | 🔒 User     | Submit a claim with verification answers |
| GET    | `/claims/my`                | 🔒 User     | Get current user's submitted claims      |
| GET    | `/claims/item/:itemId`      | 🔒 Owner/Admin | Get all claims for an item            |
| PUT    | `/claims/:id/decide`        | 🔒 Admin    | Approve / reject a claim               |

### Notifications (`/api/notifications`)

| Method | Path                        | Auth      | Description                              |
|--------|-----------------------------|-----------|------------------------------------------|
| GET    | `/notifications`            | 🔒 User   | Get current user's notifications         |
| PUT    | `/notifications/:id/read`   | 🔒 User   | Mark a notification as read              |
| PUT    | `/notifications/read-all`   | 🔒 User   | Mark all notifications as read           |
| DELETE | `/notifications/:id`        | 🔒 User   | Delete a notification                    |

### Admin (`/api/admin`)

| Method | Path                        | Auth        | Description                             |
|--------|-----------------------------|-------------|-----------------------------------------|
| GET    | `/admin/stats`              | 🔒 Admin    | Site-wide statistics                    |
| GET    | `/admin/users`              | 🔒 Admin    | List all users                          |
| PUT    | `/admin/users/:id/status`   | 🔒 Admin    | Activate / deactivate a user            |
| PUT    | `/admin/users/:id/role`     | 🔒 Admin    | Change a user's role                    |
| GET    | `/admin/items`              | 🔒 Admin    | List all items (any status)             |
| PUT    | `/admin/items/:id/status`   | 🔒 Admin    | Update item status                      |
| DELETE | `/admin/items/:id`          | 🔒 Admin    | Force-delete any item                   |
| GET    | `/admin/claims`             | 🔒 Admin    | List all claims                         |
| PUT    | `/admin/claims/:id/decide`  | 🔒 Admin    | Approve / reject any claim              |

---

## 🗄 Database Schema

### `users`
Stores registered accounts. Fields: `name`, `email` (unique), `password` (hashed), `role` (student/admin), `collegeId`, `isActive`, `timestamps`.

### `items`
Core lost/found reports. Fields: `userId` (ref User), `type` (lost/found), `title`, `category`, `description`, `location`, `date`, `approximateTime`, `image` (URL), `status` (active/matched/returned/closed), `timestamps`. Full-text index on `location`.

### `verificationdetails`
Hidden ownership details per item used for claim verification. Fields: `itemId` (ref Item, unique), `brand`, `identifyingMarks`, `hiddenDetails`, `additionalQuestions` (array of Q&A pairs), `timestamps`.

### `claims`
Claim submissions by students. Fields: `itemId` (ref Item), `claimantId` (ref User), `answers` (array), `verificationScore`, `status` (pending/approved/rejected/disputed), `decisionNote`, `reviewedBy`, `timestamps`. Compound unique index on `{itemId, claimantId}`.

### `notifications`
In-app notifications. Fields: `userId` (ref User), `title`, `message`, `type` (match/claim/decision/return/system), `relatedItemId`, `isRead`, `timestamps`. Index on `{userId, isRead}`.

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build        # generates dist/
```
1. Push to GitHub and import the repo in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Add environment variable `VITE_API_URL` pointing to your deployed backend URL.
4. Vercel auto-detects Vite and deploys `dist/`.

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repo; set **Root Directory** to `backend`.
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. Add all backend environment variables in the Render dashboard.

### Database → MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Whitelist your Render service's outbound IPs (or use `0.0.0.0/0` for simplicity).
3. Copy the connection string and set it as `MONGO_URI` in Render.

### Image Storage → Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier is generous).
2. Copy `Cloud Name`, `API Key`, and `API Secret` from the dashboard.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Render.

---

## 🔒 Security Features

| Feature              | Implementation                                        |
|----------------------|-------------------------------------------------------|
| Password Hashing     | bcryptjs with salt rounds = 10                        |
| Authentication       | JWT (7-day expiry), stored as `Authorization` header  |
| Authorization        | Role-based middleware (student / admin)               |
| Rate Limiting        | express-rate-limit (100 req / 15 min per IP)          |
| Security Headers     | Helmet.js (CSP, XSS, HSTS, etc.)                     |
| CORS                 | Restricted to configured `FRONTEND_URL`               |
| Input Validation     | express-validator on all mutation endpoints           |
| File Upload Safety   | Multer image-only filter, 5 MB size limit             |
| Error Handling       | Global handler; stack traces hidden in production     |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow the existing code style and add tests for new features.

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ for campus communities</p>
