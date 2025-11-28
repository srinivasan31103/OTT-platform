# 🔐 StreamVerse X - Login Guide

## ⚠️ IMPORTANT: Make sure you're running the CORRECT backend!

**Problem:** You may have another project (cargo rapido) running on port 5000.

**Solution:** Close that server and start StreamVerse backend instead.

---

## 🚀 **Step-by-Step Startup**

### **Step 1: Check Prerequisites**

**MongoDB running?**
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
# Should show: { ok: 1 }
```

**Redis running?**
```bash
redis-cli ping
# Should show: PONG
```

---

### **Step 2: Start Backend**

**Option A - Use Batch File (Easy):**
```bash
# Double-click this file:
START-BACKEND.bat
```

**Option B - Manual:**
```bash
cd "e:\Sri\streamverse ott\backend"
npm run dev
```

**✅ You should see:**
```
✅ MongoDB Connected: localhost
✅ Redis Connected
🚀 Server running on port 5000
```

---

### **Step 3: Start Frontend**

**Option A - Use Batch File (Easy):**
```bash
# Double-click this file:
START-FRONTEND.bat
```

**Option B - Manual:**
```bash
cd "e:\Sri\streamverse ott\frontend"
npm run dev
```

**✅ You should see:**
```
➜  Local:   http://localhost:5173/
```

---

### **Step 4: Verify Backend is Running**

Open browser and test:
```
http://localhost:5000/api/auth/login
```

**Should show:** Method not allowed (GET) - this is correct!

The endpoint expects POST requests.

---

## 🔐 **Demo Account Credentials**

### **Admin Account** (Full Access)
```
Email:    admin@streamverse.com
Password: admin123
```

### **Demo Account** (Standard User)
```
Email:    demo@streamverse.com
Password: demo123
```

### **Test Account** (Basic User)
```
Email:    test@streamverse.com
Password: test123
```

---

## 📝 **How to Login**

1. **Open browser:** http://localhost:5173

2. **Click "Login"** button

3. **Enter credentials:**
   - Email: `demo@streamverse.com`
   - Password: `demo123`

4. **Click "Sign In"**

5. **Select a profile:**
   - Choose "John" (Adult) or "Little Sarah" (Kid)

6. **Start browsing!**

---

## ❌ **Troubleshooting**

### **"Cannot connect to backend"**

**Check:**
```bash
# Is StreamVerse backend running?
curl http://localhost:5000/api/auth/login

# NOT this (wrong project):
# cargo rapido backend
```

**Fix:**
1. Stop any other server on port 5000
2. Run: `cd "e:\Sri\streamverse ott\backend" && npm run dev`

---

### **"Invalid credentials"**

**Check:**
```bash
# Verify accounts exist in database:
cd "e:\Sri\streamverse ott\backend"
node seed-demo-data.js
```

This will reset all demo accounts.

---

### **"MongoDB connection failed"**

**Start MongoDB:**
```bash
mongod
```

Or if installed as service:
```bash
net start MongoDB
```

---

### **"Redis connection failed"**

**Start Redis:**
```bash
redis-server
```

---

### **Frontend can't find backend**

**Check frontend .env.local:**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Check backend is on port 5000:**
```bash
# Should show StreamVerse server, not cargo rapido!
curl http://localhost:5000
```

---

## 🧪 **Test Login via API (Optional)**

**Test with curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@streamverse.com",
    "password": "demo123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "email": "demo@streamverse.com",
    "name": "Demo User"
  }
}
```

If you get this, your backend is working! ✅

---

## 📊 **Current Database State**

After running seed script, you have:

- ✅ **3 Users** (admin, demo, test)
- ✅ **4 Profiles**
- ✅ **5 Movies**
- ✅ **2 Series** (18 episodes)
- ✅ **3 Shorts**
- ✅ **3 Live Channels**

---

## 🔄 **Reset Everything**

If login still doesn't work:

```bash
cd "e:\Sri\streamverse ott\backend"

# Stop backend (Ctrl+C)

# Re-seed database
node seed-demo-data.js

# Restart backend
npm run dev
```

---

## ✅ **Quick Checklist**

Before trying to login:

- [ ] MongoDB is running (`mongosh` works)
- [ ] Redis is running (`redis-cli ping` returns PONG)
- [ ] StreamVerse backend is running on port 5000 (NOT cargo rapido!)
- [ ] Frontend is running on port 5173
- [ ] Demo data is seeded (`node seed-demo-data.js` was run)
- [ ] Browser can access http://localhost:5173
- [ ] Backend responds at http://localhost:5000

---

## 🎉 **Success!**

If you can login and see profiles, you're all set! 🚀

**Next:** Browse movies, watch videos, test features!

---

**Need more help?** Check the full guides:
- [START.md](START.md) - Detailed startup guide
- [INSTALLATION.md](INSTALLATION.md) - Full installation
- [README.md](README.md) - Feature overview
