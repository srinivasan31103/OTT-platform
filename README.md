# StreamVerse X - Production-Grade OTT Platform

![StreamVerse X](https://img.shields.io/badge/StreamVerse-X-pink?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-cyan?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-18+-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge)

**StreamVerse X** is a complete, production-ready, Netflix-scale OTT streaming platform with advanced features including AI-powered recommendations, live streaming, watch parties, multi-CDN support, DRM, and more.

## 🚀 Features

### Content Management
- ✅ Movies, Series (multi-season), Episodes
- ✅ Shorts/Reels (vertical video)
- ✅ Live TV streaming with chat
- ✅ Multi-audio tracks & subtitles
- ✅ Scene markers & chapters (AI-generated)
- ✅ Trailer auto-generation

### User Experience
- ✅ Multi-profile system (Kid/Teen/Adult)
- ✅ PIN-protected profiles
- ✅ Continue Watching
- ✅ My List / Watchlist
- ✅ Ratings & Reviews
- ✅ Comment system with AI moderation
- ✅ Personalized homepage

### Advanced Features
- ✅ **AI Recommendation Engine 2.0** (Claude API)
- ✅ **Watch Party Mode** (WebRTC + Socket.IO sync)
- ✅ **Live Chat** for sports & live events
- ✅ **Adaptive Streaming** (HLS with quality selection)
- ✅ **Offline Download Mode** (PWA)
- ✅ **Device Handoff** (continue mobile → TV)
- ✅ **Casting Support** (Chromecast/AirPlay compatible)
- ✅ **Gamification** (XP, badges, streaks)

### Content Protection
- ✅ HLS AES-128 encryption
- ✅ DRM support (Widevine/FairPlay/PlayReady mock)
- ✅ Signed URLs with expiration
- ✅ Geo-blocking & region licensing
- ✅ Device limit enforcement
- ✅ Multi-CDN with failover

### AI Capabilities
- ✅ AI movie descriptions
- ✅ Mood-based playlists
- ✅ AI trailer summaries
- ✅ Comment moderation
- ✅ Character chat mode
- ✅ Scene detection
- ✅ Content recommendations

### Monetization
- ✅ Subscription tiers (Basic/Standard/Premium)
- ✅ Stripe integration
- ✅ Razorpay integration
- ✅ Payment history & invoices
- ✅ Free trial support

### Admin Panel
- ✅ Upload movies/series/episodes
- ✅ User management
- ✅ Analytics dashboard
- ✅ Content moderation
- ✅ AI description generator
- ✅ Revenue tracking

## 📋 Tech Stack

### Backend
```
- Node.js 18+ + Express
- MongoDB + Mongoose
- Redis (caching & rate limiting)
- Socket.IO (real-time)
- WebRTC (watch parties)
- JWT authentication
- Cloudinary (media storage)
- FFmpeg (video processing)
- Stripe/Razorpay (payments)
- Claude API (AI features)
```

### Frontend
```
- React 18.2 + Vite
- React Router v6
- Zustand (state management)
- Tailwind CSS
- HLS.js (video player)
- Socket.IO client
- Swiper (carousels)
- Axios (HTTP)
```

### Infrastructure
```
- HLS streaming (.m3u8)
- AES-128 encryption
- Multi-CDN support
- PWA capabilities
- WebRTC signaling
```

## 🛠️ Installation

### Prerequisites

```bash
- Node.js 18+ and npm
- MongoDB 6+
- Redis 7+
- FFmpeg installed
- Cloudinary account
- Anthropic API key (Claude)
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure .env file with your credentials:
# - MongoDB URI
# - Redis URL
# - Cloudinary credentials
# - Anthropic API key
# - Stripe/Razorpay keys
# - JWT secrets

# Start development server
npm run dev

# Or production
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update API endpoint in .env.local
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Logout
```

### Profiles
```
GET    /api/profiles               - Get all profiles
POST   /api/profiles               - Create profile
GET    /api/profiles/:id           - Get profile
PUT    /api/profiles/:id           - Update profile
DELETE /api/profiles/:id           - Delete profile
POST   /api/profiles/:id/select    - Select profile (with PIN)
```

### Content
```
GET    /api/movies                 - Get movies (paginated)
GET    /api/movies/:id             - Get single movie
GET    /api/series                 - Get series
GET    /api/series/:id/episodes    - Get episodes
GET    /api/shorts                 - Get shorts feed
GET    /api/live/channels          - Get live TV channels
```

### Watch
```
POST   /api/watch/history          - Update watch progress
GET    /api/watch/continue         - Get continue watching
GET    /api/watch/history          - Get watch history
```

### Watchlist
```
POST   /api/watchlist              - Add to watchlist
GET    /api/watchlist              - Get watchlist
DELETE /api/watchlist/:id          - Remove from watchlist
```

### AI
```
POST   /api/ai/recommend           - AI recommendations
POST   /api/ai/description         - Generate description
POST   /api/ai/playlist            - Mood-based playlist
POST   /api/ai/moderate            - Moderate comment
POST   /api/ai/character-chat      - Chat with character
```

### Watch Party
```
POST   /api/party/create           - Create watch party
POST   /api/party/:id/join         - Join party
GET    /api/party/:id              - Get party details
PUT    /api/party/:id/sync         - Sync playback
```

### Subscriptions
```
GET    /api/subscriptions/plans    - Get plans
POST   /api/subscriptions/create   - Create subscription
PUT    /api/subscriptions/cancel   - Cancel subscription
POST   /api/subscriptions/webhook  - Payment webhooks
```

### Admin
```
POST   /api/admin/movies           - Upload movie
POST   /api/admin/series           - Create series
GET    /api/admin/analytics        - Get analytics
GET    /api/admin/users            - Manage users
```

### DRM
```
POST   /api/drm/get-license        - Get DRM license
GET    /api/drm/key/:id            - Get decryption key
POST   /api/drm/validate           - Validate playback token
```

## 🎬 HLS Streaming

### Sample HLS URLs

```
Standard HLS:
http://localhost:5000/hls/sample/master.m3u8

Encrypted HLS (AES-128):
http://localhost:5000/hls/sample-encrypted/master.m3u8

Signed URL (expires in 5 mins):
http://localhost:5000/api/movies/:id/stream?token=<signed-token>
```

### HLS Structure

```
/public/hls/
  /sample/
    master.m3u8          (Multi-bitrate playlist)
    /1080p/
      playlist.m3u8      (Quality-specific playlist)
      segment_000.ts     (Video segments)
      segment_001.ts
    /720p/
    /480p/
    /360p/
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/streamverse
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI
ANTHROPIC_API_KEY=your-anthropic-key

# Payments
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=StreamVerse X
```

## 🚦 Running the Platform

### Development

```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Redis
redis-server

# Terminal 3 - Backend
cd backend
npm run dev

# Terminal 4 - Frontend
cd frontend
npm run dev
```

Access: http://localhost:5173

### Production

```bash
# Backend
cd backend
npm start

# Frontend (build first)
cd frontend
npm run build
# Serve dist/ with nginx or hosting service
```

## 📱 Default Admin Credentials

```
Email: admin@streamverse.com
Password: Admin@123
```

**⚠️ Change immediately in production!**

## 🎯 Key Features Explained

### 1. AI Recommendations

Powered by Claude API, analyzes:
- Watch history
- Genre preferences
- Viewing patterns
- Time of day
- Mood indicators

### 2. Watch Party

- WebRTC peer-to-peer connections
- Synchronized playback
- Real-time chat
- Up to 10 participants
- Invite code sharing

### 3. Live TV

- HLS live streaming
- Real-time chat via Socket.IO
- Viewer count tracking
- Program schedule
- Channel switching

### 4. DRM & Security

- AES-128 HLS encryption
- Widevine/FairPlay/PlayReady mock
- Signed URLs (5-min expiration)
- Device fingerprinting
- Geo-blocking

### 5. Multi-CDN

- Primary CDN (Cloudflare)
- Fallback CDN (Fastly)
- Origin server
- Automatic failover
- Load balancing

## 📊 Database Models

```
- User (auth, subscription, devices)
- Profile (multi-profile, PIN, maturity)
- Movie (metadata, streaming URLs)
- Series (seasons, episodes)
- Episode (playback, subtitles)
- Shorts (vertical videos)
- WatchHistory (resume, progress)
- Watchlist (my list)
- Rating (reviews, ratings)
- Comment (with AI moderation)
- WatchParty (sync, participants)
- Subscription (billing, status)
- LiveChannel (live TV)
- DeviceSession (handoff)
- SceneMarker (AI chapters)
```

## 🧪 Testing

### Sample Content Upload

```bash
# Upload via admin panel
1. Login as admin
2. Go to /admin/upload
3. Fill movie details
4. Upload video file
5. System auto-generates:
   - HLS streams (4 qualities)
   - Thumbnails
   - AI description
   - Scene markers
```

### Testing Watch Party

```bash
1. User A: Create party on any content
2. Get invite code
3. User B: Join with code
4. Both see synced playback
5. Test play/pause sync
6. Test chat messaging
```

## 🐛 Troubleshooting

### Video Not Playing

```bash
# Check HLS file exists
ls public/hls/sample/

# Verify FFmpeg installed
ffmpeg -version

# Check Cloudinary upload
# View logs in backend console
```

### Socket.IO Not Connecting

```bash
# Verify CORS settings in server.js
# Check VITE_SOCKET_URL in frontend .env.local
# Ensure ports 5000 (backend) and 5173 (frontend) open
```

### AI Features Not Working

```bash
# Verify ANTHROPIC_API_KEY set in .env
# Check API quota/billing
# View detailed errors in backend logs
```

## 📈 Performance Optimization

- Redis caching (movies, series, user sessions)
- CDN for static assets
- HLS adaptive streaming
- Code splitting (React lazy load)
- Image optimization (Cloudinary)
- Database indexing
- Rate limiting

## 🔒 Security Features

- JWT with refresh tokens
- bcrypt password hashing
- Helmet.js security headers
- CORS configuration
- Rate limiting (per endpoint)
- Input validation
- XSS protection
- SQL injection prevention (NoSQL)
- File upload validation

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

This is a complete production template. Fork and customize for your needs.

## 📞 Support

For issues, check:
1. MongoDB connection
2. Redis connection
3. Environment variables
4. FFmpeg installation
5. API keys validity

## 🎉 Credits

Built with modern technologies for a Netflix-scale OTT experience.

---

**StreamVerse X** - Next-Generation OTT Platform
