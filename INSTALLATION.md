# StreamVerse X - Complete Installation Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   npm --version
   ```

2. **MongoDB** (v6 or higher)
   ```bash
   mongod --version  # Should be v6+
   ```

3. **Redis** (v7 or higher)
   ```bash
   redis-server --version  # Should be v7+
   ```

4. **FFmpeg** (for video processing)
   ```bash
   ffmpeg -version
   ffprobe -version
   ```

### Required Accounts

1. **Cloudinary** (for media storage)
   - Sign up at https://cloudinary.com
   - Get: Cloud Name, API Key, API Secret

2. **Anthropic** (for AI features)
   - Sign up at https://console.anthropic.com
   - Get: API Key

3. **Stripe** (for payments - optional)
   - Sign up at https://stripe.com
   - Get: Secret Key, Publishable Key, Webhook Secret

4. **Razorpay** (alternative payment - optional)
   - Sign up at https://razorpay.com
   - Get: Key ID, Key Secret

---

## 🚀 Installation Steps

### Step 1: Clone or Navigate to Project

```bash
cd "e:\Sri\streamverse ott"
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# This will install:
# - express, mongoose, redis
# - socket.io, jsonwebtoken, bcryptjs
# - cloudinary, multer, ffmpeg utilities
# - @anthropic-ai/sdk (Claude API)
# - stripe, razorpay
# - And 30+ other packages
```

### Step 3: Configure Backend Environment

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor and configure:
```

**Edit `backend/.env`:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Database (use your MongoDB connection string)
MONGODB_URI=mongodb://localhost:27017/streamverse

# Redis (use your Redis URL)
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate strong random strings)
JWT_SECRET=super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=super-secret-refresh-key-min-32-chars

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here

# Anthropic AI (from console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Email (for verification emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=StreamVerse <noreply@streamverse.com>

# Stripe (optional - for subscriptions)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay (optional - alternative to Stripe)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# DRM & HLS Signing (generate strong secrets)
DRM_SECRET_KEY=drm-secret-min-32-characters-long
DRM_ENCRYPTION_KEY=encryption-key-exactly-32-chars
HLS_SIGNING_SECRET=hls-signing-secret-32-chars-min

# CDN URLs (optional - use after deployment)
CDN_URL=http://localhost:5000
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# This will install:
# - react, react-router-dom, react-dom
# - zustand (state management)
# - axios (HTTP client)
# - hls.js (video player)
# - socket.io-client (real-time)
# - tailwindcss (styling)
# - swiper (carousels)
# - And 20+ other packages
```

### Step 5: Configure Frontend Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Open .env.local in your editor
```

**Edit `frontend/.env.local`:**

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=StreamVerse X
VITE_APP_URL=http://localhost:5173

# Feature Flags (enable/disable features)
VITE_ENABLE_WATCH_PARTY=true
VITE_ENABLE_LIVE_TV=true
VITE_ENABLE_SHORTS=true
VITE_ENABLE_AI=true

# CDN (optional)
VITE_CDN_URL=http://localhost:5000
```

---

## 🗄️ Database Setup

### Step 6: Start MongoDB

```bash
# Option 1: Start as service (Windows)
net start MongoDB

# Option 2: Start manually
mongod --dbpath "C:\data\db"

# Option 3: Use MongoDB Atlas (cloud)
# Use connection string in .env:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/streamverse
```

### Step 7: Start Redis

```bash
# Option 1: Start as service (Windows)
# Redis service should auto-start

# Option 2: Start manually
redis-server

# Option 3: Use Redis Cloud
# Use connection string in .env:
# REDIS_URL=redis://user:pass@host:port
```

### Step 8: Initialize Database (Optional)

Create an admin user:

```bash
# In backend directory
cd backend

# Run MongoDB shell
mongosh streamverse

# Create admin user
db.users.insertOne({
  email: "admin@streamverse.com",
  password: "$2a$10$hashed-password-here",
  name: "Admin User",
  isAdmin: true,
  subscription: {
    type: "premium",
    status: "active"
  },
  createdAt: new Date()
})

# Or use the API after server starts:
# POST http://localhost:5000/api/auth/register
```

---

## ▶️ Running the Application

### Step 9: Start Backend Server

```bash
# In backend directory
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# You should see:
# ✅ MongoDB Connected: localhost
# ✅ Redis Connected
# 🚀 Server running on port 5000
```

### Step 10: Start Frontend Server

```bash
# In frontend directory (new terminal)
cd frontend

# Development mode
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Step 11: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

**Default Admin Login:**
- Email: `admin@streamverse.com`
- Password: `Admin@123` (if created via script)

⚠️ **Important:** Change admin password immediately!

---

## 🧪 Testing the Setup

### Test 1: API Health Check

```bash
# In browser or Postman
GET http://localhost:5000/api/health

# Expected response:
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 2: Register New User

```bash
# Via frontend: http://localhost:5173/register
# Or via API:

POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123"
}
```

### Test 3: Create Profile

1. Login to the app
2. You'll be redirected to profile selection
3. Click "Create Profile"
4. Choose type (Adult/Teen/Kid)
5. Set name and avatar

### Test 4: Browse Content

1. Go to Home page
2. You should see content sliders
3. Click on any movie/series
4. Test video playback

### Test 5: Upload Content (Admin)

1. Login as admin
2. Navigate to `/admin/upload`
3. Fill in movie details:
   - Title
   - Description
   - Year, Duration, Genres
   - Upload thumbnail
   - Upload video file
4. Submit and wait for processing

---

## 📁 Project Structure

```
streamverse-x/
├── backend/
│   ├── config/          # DB, Redis, Cloudinary, DRM
│   ├── controllers/     # Business logic (10 files)
│   ├── middleware/      # Auth, subscription, rate limiting
│   ├── models/          # MongoDB schemas (15 models)
│   ├── routes/          # API routes (13 files)
│   ├── utils/           # Helpers (AI, FFmpeg, HLS, etc.)
│   ├── server.js        # Main server
│   ├── socket.js        # Socket.IO server
│   ├── webrtc.js        # WebRTC signaling
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components (9 files)
│   │   ├── pages/       # Pages (16 files)
│   │   ├── store/       # Zustand stores (5 files)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── .env.local
│
├── public/
│   └── hls/             # Sample HLS files
│
└── README.md
```

---

## 🔧 Troubleshooting

### Problem: Backend won't start

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# Check if Redis is running
redis-cli ping
# Should respond: PONG

# Check for port conflicts
netstat -ano | findstr :5000

# Check environment variables
cat backend/.env
```

### Problem: Frontend can't connect to backend

**Solution:**
```bash
# Verify VITE_API_URL in frontend/.env.local
# Should be: http://localhost:5000/api

# Check CORS in backend/server.js
# Should include: http://localhost:5173

# Clear browser cache and restart frontend
npm run dev
```

### Problem: Video not playing

**Solution:**
```bash
# 1. Check if HLS files exist
ls public/hls/sample/

# 2. Verify FFmpeg is installed
ffmpeg -version

# 3. Check Cloudinary upload
# View backend console logs during upload

# 4. Test with sample HLS
# http://localhost:5000/hls/sample/master.m3u8
```

### Problem: AI features not working

**Solution:**
```bash
# 1. Verify ANTHROPIC_API_KEY in .env
echo $ANTHROPIC_API_KEY

# 2. Check API quota at console.anthropic.com

# 3. View detailed errors
# Check backend console logs

# 4. Test AI endpoint manually
curl -X POST http://localhost:5000/api/ai/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profileId": "xxx"}'
```

### Problem: Socket.IO not connecting

**Solution:**
```bash
# 1. Check VITE_SOCKET_URL in frontend/.env.local
# Should be: http://localhost:5000

# 2. Verify Socket.IO server running
# Check backend console: "Socket.IO server initialized"

# 3. Check browser console for errors
# Open DevTools > Console

# 4. Test Socket.IO directly
# Use socket.io-client in browser console
```

---

## 📊 Performance Tips

### 1. Enable Redis Caching

Ensure Redis is running for optimal performance:
- API responses cached for 5 minutes
- User sessions cached
- Rate limiting via Redis

### 2. Configure CDN (Production)

Update .env after deployment:
```env
CDN_URL=https://cdn.yourdomain.com
CLOUDFLARE_CDN_URL=https://cloudflare.yourdomain.com
```

### 3. Optimize Database

Create indexes (already in models):
```bash
mongosh streamverse
db.movies.createIndex({ title: "text", description: "text" })
db.users.createIndex({ email: 1 })
```

### 4. Enable Compression

Already enabled in server.js:
- Gzip compression for responses
- Image optimization via Cloudinary
- Code splitting in frontend

---

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 chars)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Helmet.js (already in server.js)
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Use Redis password protection

---

## 📦 Production Deployment

### Option 1: Manual Deployment

```bash
# Build frontend
cd frontend
npm run build
# Serves from dist/

# Start backend with PM2
cd backend
npm install -g pm2
pm2 start server.js --name streamverse
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

```bash
# Coming soon: docker-compose.yml
docker-compose up -d
```

### Option 3: Cloud Platforms

- **Backend:** Heroku, Railway, DigitalOcean, AWS
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** MongoDB Atlas
- **Redis:** Redis Cloud, Upstash

---

## 🎉 You're All Set!

Your StreamVerse X OTT platform is now running!

**Next Steps:**
1. Create your first user account
2. Set up profiles
3. Upload sample content via admin panel
4. Test video playback
5. Try watch party feature
6. Explore AI recommendations

**Support:**
- Check README.md for detailed features
- Review API documentation in INSTALLATION.md
- Check troubleshooting section above

---

**Happy Streaming! 🎬**
