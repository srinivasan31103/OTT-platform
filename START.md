# 🚀 Start StreamVerse X

## ✅ Prerequisites Check

Before starting, verify you have:

```bash
# 1. Node.js 18+
node --version
# Should show: v18.x.x or higher

# 2. MongoDB installed
mongod --version
# Should show: db version v6.x.x or higher

# 3. Redis installed
redis-server --version
# Should show: Redis server v=7.x.x or higher
```

---

## 🎬 Start Services (4 Terminals)

### Terminal 1️⃣: Start MongoDB

```bash
# Windows (if installed as service)
net start MongoDB

# Or manually:
mongod --dbpath "C:\data\db"

# Linux/Mac:
mongod
```

✅ **Wait for:** `waiting for connections on port 27017`

---

### Terminal 2️⃣: Start Redis

```bash
# Windows (if installed as service)
# Redis should auto-start

# Or manually:
redis-server

# Linux/Mac:
redis-server
```

✅ **Wait for:** `Ready to accept connections`

---

### Terminal 3️⃣: Start Backend

```bash
cd backend

# First time only:
npm install

# Start backend
npm run dev
```

✅ **Wait for:**
```
✅ MongoDB Connected: localhost
✅ Redis Connected
🚀 Server running on port 5000
```

**Backend is ready at:** http://localhost:5000

---

### Terminal 4️⃣: Start Frontend

```bash
cd frontend

# First time only:
npm install

# Start frontend
npm run dev
```

✅ **Wait for:**
```
➜  Local:   http://localhost:5173/
```

**Frontend is ready at:** http://localhost:5173

---

## 🌐 Access the Application

Open your browser:
```
http://localhost:5173
```

---

## 🔧 Troubleshooting

### MongoDB won't start
```bash
# Create data directory
mkdir C:\data\db

# Or specify custom path
mongod --dbpath "C:\your\custom\path"
```

### Redis won't start
```bash
# Check if already running
redis-cli ping
# Should respond: PONG

# Kill existing instance
taskkill /IM redis-server.exe /F
# Then restart
```

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Use different port in backend/.env
PORT=5001
```

### Frontend can't connect
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check VITE_API_URL in frontend/.env.local
# Should be: http://localhost:5000/api
```

---

## 📝 Quick Test

### 1. Health Check
```bash
# Test backend API
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"API is running"}
```

### 2. Register User
```bash
# Via frontend: http://localhost:5173/register
# Fill in: Name, Email, Password
# Click: Register
```

### 3. Create Profile
```bash
# After login, you'll be redirected to profile selection
# Click: "Create Profile"
# Choose: Adult
# Enter name and click "Create"
```

### 4. Browse Content
```bash
# You should now see the homepage
# Sample HLS videos available for testing
```

---

## 🎯 What's Next?

### For Local Development:
1. ✅ You can browse with sample HLS files
2. ⚠️ To upload videos: Configure Cloudinary in `backend/.env`
3. ⚠️ To use AI features: Add ANTHROPIC_API_KEY in `backend/.env`
4. ⚠️ To test payments: Add Stripe keys in `backend/.env`

### For Production:
1. See [INSTALLATION.md](INSTALLATION.md) for full setup
2. Change all secrets in `.env` files
3. Configure production databases
4. Set up CDN
5. Deploy!

---

## 📚 Documentation

- **Features:** [README.md](README.md)
- **Installation:** [INSTALLATION.md](INSTALLATION.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Project Overview:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🛑 Stop Services

### Stop Frontend
```bash
# In Terminal 4
Ctrl + C
```

### Stop Backend
```bash
# In Terminal 3
Ctrl + C
```

### Stop Redis
```bash
# In Terminal 2
Ctrl + C

# Or if service:
net stop Redis
```

### Stop MongoDB
```bash
# In Terminal 1
Ctrl + C

# Or if service:
net stop MongoDB
```

---

## 🎉 Happy Streaming!

You're now running StreamVerse X locally!

**Default URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/health

**Need help?** Check [INSTALLATION.md](INSTALLATION.md) for detailed troubleshooting.
