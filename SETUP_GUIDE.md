# ⚡ CampusConnect – Quick Setup Guide

---

## 🚀 Quick Start (Copy-Paste Commands)

### Prerequisites check
```bash
node --version    # Must be >= 18
npm --version     # Must be >= 9
mongod --version  # Must be >= 6 (or use MongoDB Atlas)
```

### 1 – Clone & enter the project
```bash
git clone https://github.com/your-username/campusconnect.git
cd campusconnect
```

### 2 – Backend
```bash
cd backend
npm install
copy .env.example .env
# Open .env and fill in MONGO_URI and JWT_SECRET at minimum
npm run dev
```
> Backend starts on **http://localhost:5000**

### 3 – Frontend (new terminal)
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
> Frontend starts on **http://localhost:5173**

### 4 – Open the app
Navigate to **http://localhost:5173** in your browser and register an account.

---

## 🌐 Default Ports

| Service   | Port | URL                            |
|-----------|------|--------------------------------|
| Backend   | 5000 | http://localhost:5000          |
| Frontend  | 5173 | http://localhost:5173          |
| MongoDB   | 27017 | mongodb://localhost:27017     |

---

## 👤 Test Accounts

After registering normally through the app, promote a user to **admin** using one of the methods below.

### Option A – MongoDB Compass (GUI)
1. Open **MongoDB Compass** and connect to `mongodb://localhost:27017`
2. Navigate to database **campusconnect** → collection **users**
3. Find your user document and click **Edit**
4. Change `role` from `"student"` to `"admin"`
5. Save – the user now has admin access on next login

### Option B – MongoDB Shell (CLI)
```bash
mongosh campusconnect
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Option C – Atlas Data API (if using Atlas)
Use the Atlas UI **Browse Collections** tab and edit the document directly, same as Option A.

> After changing the role, **log out and log back in** so a fresh JWT with the admin role is issued.

---

## 🔧 Troubleshooting

### ❌ MongoDB not running / connection refused

**Symptom:** Backend crashes with `MongoNetworkError` or `ECONNREFUSED 127.0.0.1:27017`

**Fix:**
```bash
# Windows – start MongoDB service
net start MongoDB

# Or run mongod directly
mongod --dbpath "C:\data\db"
```
If you don't have a local MongoDB, use **MongoDB Atlas** (free tier):
1. Create a cluster at https://www.mongodb.com/atlas
2. Add your IP to the whitelist
3. Copy the connection string and paste it as `MONGO_URI` in `backend/.env`

---

### ❌ Port already in use (EADDRINUSE)

**Symptom:** `Error: listen EADDRINUSE :::5000` or `:::5173`

**Fix – find and kill the process on the port:**
```bash
# Windows – find process using port 5000
netstat -ano | findstr :5000
# Note the PID from the last column, then:
taskkill /PID <PID> /F

# Or simply change the port:
# backend/.env → PORT=5001
# frontend/.env → VITE_API_URL=http://localhost:5001/api
```

---

### ❌ Cloudinary not configured (images not uploading)

**Symptom:** Image uploads fail or return an error; console shows `Missing Cloudinary credentials`

**Fix A – Configure Cloudinary (recommended for production):**
1. Sign up at https://cloudinary.com/
2. From your dashboard copy: **Cloud Name**, **API Key**, **API Secret**
3. Add to `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the backend

**Fix B – Use local fallback (development only):**
Leave the `CLOUDINARY_*` variables empty. The app automatically saves uploaded images to `backend/uploads/` and serves them at `/uploads/<filename>`. No extra config needed.

---

### ❌ JWT errors (401 Unauthorized on every request)

**Symptom:** Every authenticated API call returns `401 – Invalid token` immediately after login

**Fix:**
- Make sure `JWT_SECRET` in `backend/.env` is set and hasn't changed between restarts
- Clear your browser's localStorage (`localStorage.clear()` in DevTools console) and log in again
- Ensure the frontend's `VITE_API_URL` matches the actual backend URL/port

---

### ❌ CORS errors in browser console

**Symptom:** `Access-Control-Allow-Origin` error when frontend calls backend

**Fix:**
Set `FRONTEND_URL` in `backend/.env` to exactly match the origin your frontend runs on:
```
FRONTEND_URL=http://localhost:5173
```
Restart the backend after saving.

---

### ❌ npm install fails (ERESOLVE / peer dependency conflicts)

**Fix:**
```bash
npm install --legacy-peer-deps
```

---

### ❌ Vite build fails (import errors)

```bash
cd frontend
npm run build 2>&1
```
Read the error – it usually points to a missing import or mistyped path. Run `npm install` again to ensure all packages are present.

---

## 📋 Minimum `.env` for Local Dev

**`backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusconnect
JWT_SECRET=replace_this_with_a_long_random_secret_at_least_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏗 Verifying the Setup

After both servers are running, test the backend health:
```bash
curl http://localhost:5000/api/auth/me
# Expected: 401 Unauthorized (backend is running, endpoint requires auth)
```

Open the browser DevTools Network tab and confirm API calls go to `http://localhost:5000/api/...` with 200/401 responses (not 404 or connection refused).

---

*For full documentation, see [README.md](./README.md).*
