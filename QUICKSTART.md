# StreamVerse X - Quick Start Guide

Get your OTT platform running in **15 minutes**!

## ⚡ Prerequisites (5 minutes)

Install these if you haven't already:

```bash
# 1. Node.js 18+
node --version  # Must be v18+

# 2. MongoDB
mongod --version

# 3. Redis
redis-server --version
```

## 🚀 Setup (10 minutes)

### Backend Setup (5 minutes)

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env

# 3. Edit .env - MINIMUM required:
# - MONGODB_URI=mongodb://localhost:27017/streamverse
# - REDIS_URL=redis://localhost:6379
# - JWT_SECRET=your-secret-key-min-32-chars
# - ANTHROPIC_API_KEY=sk-ant-your-key (optional)
# - CLOUDINARY credentials (optional for now)

# 4. Start services
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Backend
npm run dev

# ✅ You should see: "Server running on port 5000"
```

### Frontend Setup (5 minutes)

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Edit .env.local:
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# 4. Start frontend
npm run dev

# ✅ You should see: "Local: http://localhost:5173"
```

## 🎬 First Run

### 1. Open Browser
```
http://localhost:5173
```

### 2. Create Account
- Click "Register"
- Enter: name, email, password
- Submit

### 3. Create Profile
- Choose type: Adult
- Enter name
- Click "Create Profile"

### 4. Browse Content
- You'll see the homepage
- Sample HLS videos available at `/hls/sample/master.m3u8`

## 🎯 Test Features

### Test Video Playback
```bash
# Sample HLS URL (copy to player):
http://localhost:5000/hls/sample/master.m3u8
```

### Test Admin Panel
```bash
# 1. Create admin user in MongoDB:
mongosh streamverse

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
)

# 2. Login and visit:
http://localhost:5173/admin
```

### Test AI Features
```bash
# Add ANTHROPIC_API_KEY to backend/.env
# Then test recommendations, descriptions, etc.
```

## 📝 Sample Data (Optional)

Create sample movie:

```javascript
// In MongoDB shell
db.movies.insertOne({
  title: "Sample Movie",
  description: "This is a sample movie for testing",
  year: 2024,
  duration: 120,
  genres: ["Action", "Thriller"],
  thumbnail: "https://via.placeholder.com/300x450",
  banner: "https://via.placeholder.com/1920x1080",
  videoUrl: "http://localhost:5000/hls/sample/master.m3u8",
  hlsUrl: "http://localhost:5000/hls/sample/master.m3u8",
  maturityRating: "PG-13",
  subscriptionTier: "free",
  status: "published",
  createdAt: new Date()
})
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running:
mongosh

# Or use MongoDB Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/streamverse
```

### Redis Connection Failed
```bash
# Check if Redis is running:
redis-cli ping
# Should respond: PONG
```

### Frontend Can't Connect
```bash
# Check VITE_API_URL in frontend/.env.local
# Should be: http://localhost:5000/api
```

## ✅ Verify Installation

### Backend Health Check
```bash
curl http://localhost:5000/api/health

# Expected:
# { "success": true, "message": "API is running" }
```

### Frontend Check
```bash
# Open: http://localhost:5173
# Should see: StreamVerse X homepage
```

## 🎉 You're Done!

Your StreamVerse X platform is now running!

### Next Steps:
1. ✅ Upload content via admin panel
2. ✅ Configure Cloudinary for video uploads
3. ✅ Add Anthropic API key for AI features
4. ✅ Configure Stripe/Razorpay for payments
5. ✅ Customize branding in frontend
6. ✅ Deploy to production

## 📚 Full Documentation

- **Features:** See [README.md](README.md)
- **Installation:** See [INSTALLATION.md](INSTALLATION.md)
- **Project Overview:** See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 💬 Need Help?

Check the troubleshooting sections in:
- INSTALLATION.md
- README.md

---

**Happy Streaming! 🎬**
