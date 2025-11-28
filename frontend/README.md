# Streamverse OTT - Frontend Application

A modern, production-ready React frontend for the Streamverse streaming platform with support for movies, TV series, shorts, live TV, and more.

## Features

- **Authentication & Profiles**: Multi-profile support with PIN protection
- **Content Browsing**: Movies, TV Series, Shorts, and Live TV
- **Video Playback**: HLS streaming with quality selection and adaptive bitrate
- **Search & Filtering**: Advanced search with genre, year, and rating filters
- **Watchlist**: Save content for later viewing
- **Watch Party**: Real-time synchronized viewing with friends
- **Live Chat**: Interactive chat during Live TV
- **Admin Dashboard**: Content management and user administration
- **Responsive Design**: Mobile, tablet, and desktop support
- **Real-time Updates**: Socket.io integration for live features

## Tech Stack

- **React 18**: Frontend framework
- **Vite**: Build tool and dev server
- **React Router v6**: Client-side routing
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **HLS.js**: Video streaming
- **Socket.io Client**: Real-time communication
- **Swiper**: Content carousels
- **Axios**: HTTP client
- **React Icons**: Icon library

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env.local
```

3. **Update API endpoints** in `.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── apiClient.js          # Axios instance with interceptors
│   ├── components/
│   │   ├── Navbar.jsx             # Navigation bar
│   │   ├── Slider.jsx             # Content carousel
│   │   ├── MovieCard.jsx          # Movie/series card component
│   │   ├── HLSPlayer.jsx          # HLS video player
│   │   ├── ShortsPlayer.jsx       # Vertical video player
│   │   ├── ChatBox.jsx            # Live chat component
│   │   ├── ProfileCard.jsx        # Profile selector
│   │   ├── SceneChapters.jsx      # Video chapters
│   │   └── AIRecommender.jsx      # Recommendation widget
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Registration page
│   │   ├── ProfileSelect.jsx      # Profile selection
│   │   ├── Home.jsx               # Homepage
│   │   ├── MoviePage.jsx          # Movie details
│   │   ├── SeriesPage.jsx         # Series details
│   │   ├── EpisodePage.jsx        # Episode player
│   │   ├── Shorts.jsx             # Shorts feed
│   │   ├── LiveTV.jsx             # Live TV channels
│   │   ├── WatchParty.jsx         # Watch party page
│   │   ├── WatchPlayer.jsx        # Universal player
│   │   ├── Search.jsx             # Search page
│   │   ├── Watchlist.jsx          # My list page
│   │   ├── AdminDashboard.jsx     # Admin panel
│   │   ├── UploadMovie.jsx        # Upload form
│   │   └── Payments.jsx           # Subscription page
│   ├── store/
│   │   ├── authStore.js           # Authentication state
│   │   ├── profileStore.js        # Profile management
│   │   ├── playbackStore.js       # Video playback state
│   │   ├── uiStore.js             # UI state
│   │   └── watchlistStore.js      # Watchlist state
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
└── postcss.config.js              # PostCSS configuration
```

## API Integration

The application communicates with a backend API at `http://localhost:5000/api`. All API calls are made through the centralized `apiClient` in `src/api/apiClient.js`.

### Authentication Flow

1. User logs in/registers on Login/Register page
2. Tokens are stored in localStorage via Zustand persistence
3. Token is automatically included in all API requests
4. 401 responses trigger automatic logout and redirect to login

### State Management

- **authStore**: User authentication and token
- **profileStore**: Profile selection and management
- **playbackStore**: Video progress, quality, subtitles
- **uiStore**: Modal states, notifications, toasts
- **watchlistStore**: User's saved content

## Styling

The project uses Tailwind CSS with a custom dark theme. Key colors:

- Primary: `#ff0066` (Pink)
- Secondary: `#1a1a1a` (Dark)
- Accent: `#00d4ff` (Cyan)
- Dark backgrounds: `#0a0a0a` to `#374151`

Custom utility classes are defined in `src/index.css`:
- `.glass-effect`: Frosted glass backdrop
- `.gradient-primary`: Pink gradient
- `.gradient-accent`: Cyan gradient
- `.hover-scale`: Scale animation on hover

## Key Features Implementation

### Video Streaming (HLS)

The `HLSPlayer` component uses HLS.js for adaptive streaming:
- Automatic quality selection
- Manual quality switching
- Playback rate control
- Subtitle support
- Progress tracking

### Real-time Chat

Socket.io integration for:
- Live chat during streams
- Message history
- User presence indicators

### Watch Party

Create synchronized viewing sessions:
- Shared playback position
- Participant tracking
- Real-time chat

### Admin Features

- Upload movies and series
- View user statistics
- Manage content and users
- Monitor subscriptions

## Error Handling

- Automatic token refresh on 401
- User-friendly error messages
- Loading states for all async operations
- Fallback UI for missing content

## Performance Optimizations

- Code splitting with React Router
- Lazy loading for images
- Memoized components with React.memo
- Debounced search
- Responsive images with lazy loading
- Efficient state management with Zustand

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Tips

### Hot Module Replacement (HMR)

Vite provides fast HMR during development - changes are reflected instantly without full page reload.

### Debugging

- React DevTools extension for component inspection
- Redux DevTools for Zustand (via middleware)
- Network tab for API debugging

### Console Helpers

API errors and state changes are logged to console in development mode.

## Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deployment Options

- **Vercel**: Zero-config deployment
- **Netlify**: Drag & drop or CI/CD
- **Docker**: Use as base image with Node.js
- **Static hosting**: S3, CloudFront, etc.

### Environment Variables for Production

Update `.env.local` with production API endpoints before building:

```
VITE_API_BASE_URL=https://api.streamverse.com
VITE_SOCKET_URL=https://streamverse.com
```

## Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### API connection errors
- Check backend is running on correct port
- Verify `VITE_API_BASE_URL` in `.env.local`
- Check CORS configuration in backend

### Video playback issues
- Verify HLS stream URL is valid
- Check if stream is accessible and CORS-enabled
- Browser console for HLS.js errors

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues and questions, please contact the development team or open an issue in the project repository.
