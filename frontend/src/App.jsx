import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useProfileStore } from './store/profileStore';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSelect from './pages/ProfileSelect';
import Home from './pages/Home';
import MoviePage from './pages/MoviePage';
import SeriesPage from './pages/SeriesPage';
import EpisodePage from './pages/EpisodePage';
import Shorts from './pages/Shorts';
import LiveTV from './pages/LiveTV';
import WatchParty from './pages/WatchParty';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import AdminDashboard from './pages/AdminDashboard';
import UploadMovie from './pages/UploadMovie';
import Payments from './pages/Payments';
import WatchPlayer from './pages/WatchPlayer';

// Components
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  return isAuthenticated && token ? children : <Navigate to="/login" />;
};

// Profile Protected Route
const ProfileProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { currentProfile } = useProfileStore();

  // Admins can access all routes without profile selection
  if (isAuthenticated && user?.isAdmin === true) {
    return children;
  }

  return isAuthenticated && currentProfile ? children : <Navigate to="/profile-select" />;
};

// Admin Protected Route (no profile required)
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, token } = useAuthStore();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { verifyToken, token, isAuthenticated, user } = useAuthStore();
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token, verifyToken]);

  // Debug logging
  useEffect(() => {
    console.log('App.jsx - Auth State:', {
      isAuthenticated,
      hasToken: !!token,
      user: user,
      isAdmin: user?.isAdmin,
      currentProfile: currentProfile
    });
  }, [isAuthenticated, token, user, currentProfile]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Selection */}
          <Route
            path="/profile-select"
            element={
              <ProtectedRoute>
                <ProfileSelect />
              </ProtectedRoute>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/"
            element={
              isAuthenticated && token ? (
                user?.isAdmin === true ? (
                  <>
                    <Navbar />
                    <Home />
                  </>
                ) : currentProfile ? (
                  <>
                    <Navbar />
                    <Home />
                  </>
                ) : (
                  <Navigate to="/profile-select" />
                )
              ) : (
                <LandingPage />
              )
            }
          />

          <Route
            path="/movie/:id"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <MoviePage />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/series/:id"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <SeriesPage />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/episode/:id"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <EpisodePage />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/shorts"
            element={
              <ProfileProtectedRoute>
                <Shorts />
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/live-tv"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <LiveTV />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/live-tv/:id"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <LiveTV />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/watch-party/:id"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <WatchParty />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <Search />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/watchlist"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <Watchlist />
                </>
              </ProfileProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProfileProtectedRoute>
                <>
                  <Navbar />
                  <Payments />
                </>
              </ProfileProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <>
                  <Navbar />
                  <AdminDashboard />
                </>
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/upload"
            element={
              <AdminProtectedRoute>
                <>
                  <Navbar />
                  <UploadMovie />
                </>
              </AdminProtectedRoute>
            }
          />

          {/* Watch Player - Universal */}
          <Route
            path="/watch/:type/:id"
            element={
              <ProfileProtectedRoute>
                <WatchPlayer />
              </ProfileProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
