# Streamverse Frontend - Setup Guide

## Complete Project Structure Created

The frontend application has been successfully created with all required files and features.

## Quick Start

### 1. Install Dependencies

```bash
cd "e:\Sri\streamverse ott\frontend"
npm install
```

### 2. Configure Environment

Create `.env.local` in the frontend root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_WATCH_PARTY=true
```

### 3. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## Files Created

### Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite build configuration with API proxy
- `tailwind.config.js` - Tailwind CSS theme configuration
- `postcss.config.js` - PostCSS plugins
- `index.html` - HTML entry point
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

### Source Code Structure

#### Entry Point
- `src/main.jsx` - React DOM render
- `src/App.jsx` - Main app component with routing
- `src/index.css` - Global styles and Tailwind imports

#### API Client (`src/api/`)
- `apiClient.js` - Axios instance with auth interceptors and all API endpoints

#### State Management (`src/store/`)
- `authStore.js` - Login/register/logout, token management
- `profileStore.js` - Profile CRUD and selection
- `playbackStore.js` - Video progress, quality, subtitles
- `uiStore.js` - Modal states, notifications, toasts
- `watchlistStore.js` - Watchlist operations

#### Components (`src/components/`)
- `Navbar.jsx` - Navigation with profile switcher
- `Slider.jsx` - Content carousel with Swiper
- `MovieCard.jsx` - Movie/series card with watchlist toggle
- `HLSPlayer.jsx` - Full-featured HLS video player
- `ShortsPlayer.jsx` - Vertical video player for shorts
- `ChatBox.jsx` - Live chat with Socket.io
- `ProfileCard.jsx` - Profile selection card
- `SceneChapters.jsx` - Video chapter markers
- `AIRecommender.jsx` - AI recommendation widget

#### Pages (`src/pages/`)

**Auth Pages:**
- `Login.jsx` - Login form with validation
- `Register.jsx` - Registration with password strength meter
- `ProfileSelect.jsx` - Profile selection with PIN verification

**Main Content Pages:**
- `Home.jsx` - Homepage with featured content and sliders
- `MoviePage.jsx` - Movie details with cast, chapters, recommendations
- `SeriesPage.jsx` - Series details with season/episode selector
- `EpisodePage.jsx` - Episode player with next episode suggestion
- `Shorts.jsx` - Vertical video feed with keyboard/swipe navigation
- `LiveTV.jsx` - Live TV channels with search and chat
- `WatchParty.jsx` - Synchronized viewing with participants

**Utility Pages:**
- `WatchPlayer.jsx` - Universal video player for any content
- `Search.jsx` - Advanced search with filters (genre, year, rating)
- `Watchlist.jsx` - My List with grid/list view modes
- `Payments.jsx` - Subscription management and billing history
- `AdminDashboard.jsx` - Admin statistics and management
- `UploadMovie.jsx` - Content upload form with validation

## Core Features Implemented

### Authentication
- Login/Register with email validation
- Token persistence with Zustand
- Automatic token refresh on 401
- Multi-profile support
- PIN protection for profiles

### Video Playback
- HLS.js integration for adaptive streaming
- Quality selection (auto, 720p, 1080p, etc.)
- Playback controls (play, pause, seek, volume)
- Subtitle support with language selection
- Playback rate control
- Full-screen mode
- Progress persistence

### Content Management
- Movies, Series, Shorts, Live TV
- Advanced search with filters
- Genre, year, rating filtering
- Watchlist functionality
- Trending content
- AI recommendations
- Watch history tracking

### Social Features
- Real-time chat during live streams
- Watch parties with synchronization
- Participant tracking
- Share functionality

### Admin Features
- User management
- Content upload (movies, series, shorts)
- Statistics dashboard
- Content moderation

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark theme with primary/accent colors
- Smooth animations and transitions
- Loading states
- Error handling
- Toast notifications
- Modal dialogs

## API Integration Points

The application expects the following API endpoints:

**Authentication:**
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/verify`
- POST `/api/auth/logout`

**Profiles:**
- GET `/api/profiles`
- POST `/api/profiles`
- PUT `/api/profiles/:id`
- DELETE `/api/profiles/:id`
- POST `/api/profiles/:id/verify-pin`

**Content:**
- GET `/api/movies`
- GET `/api/movies/:id`
- GET `/api/series`
- GET `/api/series/:id`
- GET `/api/episodes/:id`
- GET `/api/shorts`
- GET `/api/live-tv`
- GET `/api/search?q=query`
- GET `/api/trending`
- GET `/api/recommendations`

**Playback:**
- POST `/api/playback/progress`
- GET `/api/playback/progress/:id`
- POST `/api/playback/history`
- GET `/api/playback/history`
- DELETE `/api/playback/history`

**Watchlist:**
- GET `/api/watchlist`
- POST `/api/watchlist`
- DELETE `/api/watchlist/:id`

**Chat:**
- GET `/api/chat/:channelId`
- POST `/api/chat/:channelId`
- DELETE `/api/chat/message/:id`

**Watch Party:**
- POST `/api/watch-party`
- GET `/api/watch-party/:id`
- POST `/api/watch-party/:id/join`
- POST `/api/watch-party/:id/leave`
- POST `/api/watch-party/:id/sync`

**Payments:**
- GET `/api/payments/plans`
- POST `/api/payments/initiate`
- POST `/api/payments/verify`
- GET `/api/payments/subscription`
- POST `/api/payments/cancel`

**Admin:**
- POST `/api/admin/upload-movie`
- GET `/api/admin/stats`
- GET `/api/admin/users`
- DELETE `/api/admin/users/:id`
- GET `/api/admin/content`
- DELETE `/api/admin/content/:id`

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Important Notes

### Default Routes
After login, users are redirected to `/profile-select`. Once a profile is selected, they can access all main features.

### Protected Routes
- `/` - Requires authenticated user AND selected profile
- `/watch/*` - Requires authenticated user AND selected profile
- `/shorts` - Requires authenticated user AND selected profile
- `/live-tv` - Requires authenticated user AND selected profile
- `/admin/*` - Requires authenticated user AND selected profile (+ admin role check in backend)

### State Persistence
- Authentication state persists in localStorage
- Only essential data is persisted (token, user info)
- All other state is session-based

### Performance Optimizations
- Code splitting with React Router
- Lazy component loading
- Image lazy loading
- Memoized components
- Debounced search
- Request cancellation on unmount

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Common Issues & Solutions

### 1. API Connection Error
**Problem:** "Failed to connect to API"
**Solution:**
- Verify backend is running: `http://localhost:5000`
- Check `VITE_API_BASE_URL` in `.env.local`
- Ensure CORS is enabled in backend

### 2. Video Playback Error
**Problem:** Video won't play
**Solution:**
- Verify HLS stream URL is valid
- Check CORS headers on video endpoint
- Inspect browser console for HLS.js errors

### 3. Port Already in Use
**Problem:** "Error: Port 5173 already in use"
**Solution:**
```bash
npm run dev -- --port 3000
```

### 4. Module Not Found
**Problem:** "Cannot find module..."
**Solution:**
```bash
npm install
npm run dev
```

### 5. Chat/Real-time Features Not Working
**Problem:** Socket.io connection fails
**Solution:**
- Verify Socket.io server running on backend
- Check `VITE_SOCKET_URL` in `.env.local`
- Ensure WebSocket is allowed

## Production Deployment

### Build Optimization
```bash
npm run build
```

Creates optimized production build in `dist/` folder.

### Deployment Checklist
- [ ] Update API endpoints in `.env.local`
- [ ] Enable analytics in `.env.local`
- [ ] Verify payment gateway keys
- [ ] Test all features
- [ ] Check performance metrics
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Enable caching headers

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
Drag and drop `dist/` folder to Netlify, or use GitHub integration.

### Deploy to Custom Server
```bash
# Build
npm run build

# Copy dist folder to server
scp -r dist/* user@server:/var/www/streamverse/

# Or use Docker
docker build -t streamverse-frontend .
docker run -p 80:80 streamverse-frontend
```

## Next Steps

1. Install dependencies: `npm install`
2. Configure `.env.local`
3. Start backend API server
4. Run `npm run dev`
5. Visit `http://localhost:5173`
6. Login with demo credentials (or register new account)
7. Select/create profile
8. Explore application

## Support

For detailed documentation, see:
- `README.md` - Project overview and features
- `package.json` - Dependencies
- `vite.config.js` - Build configuration
- Individual component files - Component documentation

Good luck building with Streamverse!
