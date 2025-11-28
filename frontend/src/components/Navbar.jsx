import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiLogOut, FiSettings, FiHome } from 'react-icons/fi';
import { MdNotificationsNone } from 'react-icons/md';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useUiStore } from '../store/uiStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, token } = useAuthStore();
  const { currentProfile, profiles, setCurrentProfile, fetchProfiles } = useProfileStore();
  const { notifications } = useUiStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (token && profiles.length === 0) {
      fetchProfiles(token);
    }
  }, [token, profiles.length, fetchProfiles]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSwitch = (profile) => {
    setCurrentProfile(profile);
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-neon'
            : 'bg-gradient-to-b from-streamverse-darker via-streamverse-dark/50 to-transparent'
        }`}
        style={isScrolled ? {
          boxShadow: '0 4px 30px rgba(168, 85, 247, 0.3), 0 0 50px rgba(124, 58, 237, 0.2)'
        } : {}}
      >
        <div className="px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Neon Effect */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4)'
                }}
              >
                <span className="text-white font-black text-xl relative z-10">SV</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </div>
              <span className="text-white font-black text-2xl hidden sm:inline bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent">
                Streamverse
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="group relative text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 py-2">
                <FiHome className="text-xl" />
                <span>Home</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-pink group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to="/shorts"
                className="group relative text-gray-300 hover:text-white transition-all duration-300 py-2"
              >
                Shorts
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-pink group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to="/live-tv"
                className="group relative text-gray-300 hover:text-white transition-all duration-300 py-2"
              >
                Live TV
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-pink group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to="/watchlist"
                className="group relative text-gray-300 hover:text-white transition-all duration-300 py-2"
              >
                My List
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-pink group-hover:w-full transition-all duration-300" />
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="relative text-neon-orange hover:text-neon-pink transition-all duration-300 font-bold py-2"
                  style={{
                    textShadow: '0 0 10px rgba(249, 115, 22, 0.6)'
                  }}
                >
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => navigate('/search')}
                className="p-2.5 rounded-full glass-neon hover:bg-neon-purple/20 transition-all duration-300 group"
              >
                <FiSearch className="text-xl text-gray-300 group-hover:text-neon-purple transition-colors" />
              </button>

              {/* Notifications */}
              <button className="p-2.5 rounded-full glass-neon hover:bg-neon-cyan/20 transition-all duration-300 relative group">
                <MdNotificationsNone className="text-xl text-gray-300 group-hover:text-neon-cyan transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-neon-pink rounded-full animate-glow-pulse"
                    style={{
                      boxShadow: '0 0 10px rgba(236, 72, 153, 0.8)'
                    }}
                  />
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full glass-neon hover:bg-neon-purple/20 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                    }}
                  >
                    <span className="text-white text-sm font-bold">
                      {currentProfile?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-white hidden lg:inline text-sm font-semibold">
                    {currentProfile?.name || 'Profile'}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass-neon rounded-2xl shadow-2xl py-2 animate-slide-up border border-neon-purple/30">
                    <div className="px-4 py-3 border-b border-neon-purple/30">
                      <p className="text-xs text-neon-purple font-bold">PROFILES</p>
                    </div>

                    {profiles.map((profile) => (
                      <button
                        key={profile._id}
                        onClick={() => handleProfileSwitch(profile)}
                        className={`w-full text-left px-4 py-3 hover:bg-neon-purple/10 transition-all duration-300 ${
                          currentProfile?._id === profile._id ? 'bg-neon-purple/20 border-l-2 border-neon-purple' : ''
                        }`}
                      >
                        <p className="text-white text-sm font-semibold">{profile.name}</p>
                      </button>
                    ))}

                    <div className="border-t border-neon-purple/30 mt-2 pt-2">
                      {user?.isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-neon-orange hover:text-neon-pink text-sm hover:bg-neon-orange/10 transition-all duration-300 font-bold"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/payments"
                        className="block px-4 py-3 text-gray-300 hover:text-white text-sm hover:bg-neon-purple/10 transition-all duration-300"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Subscription
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 flex items-center gap-2 text-sm font-semibold"
                      >
                        <FiLogOut className="text-lg" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 rounded-full glass-neon hover:bg-neon-pink/20 transition-all duration-300 group"
              >
                {isMenuOpen ? (
                  <FiX className="text-xl text-neon-pink" />
                ) : (
                  <FiMenu className="text-xl text-gray-300 group-hover:text-neon-pink transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-neon-purple/30 pt-4 animate-slide-up">
              <Link
                to="/"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-neon-purple/10 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shorts"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-neon-purple/10 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Shorts
              </Link>
              <Link
                to="/live-tv"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-neon-purple/10 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Live TV
              </Link>
              <Link
                to="/watchlist"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-neon-purple/10 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                My List
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="block px-4 py-3 text-neon-orange hover:text-neon-pink hover:bg-neon-orange/10 rounded-lg transition-all duration-300 font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 flex items-center gap-2 font-semibold"
              >
                <FiLogOut className="text-lg" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;
