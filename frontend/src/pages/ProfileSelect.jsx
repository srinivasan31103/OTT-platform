import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiPlus } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import ProfileCard from '../components/ProfileCard';

const ProfileSelect = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { profiles, currentProfile, fetchProfiles, setCurrentProfile, verifyPin } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Redirect admins directly to admin dashboard
  useEffect(() => {
    console.log('ProfileSelect - User:', user);
    console.log('ProfileSelect - isAdmin:', user?.isAdmin);

    if (user?.isAdmin === true) {
      console.log('Redirecting admin to /admin dashboard');
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadProfiles = async () => {
      // Skip loading profiles for admins
      if (user?.isAdmin === true) {
        return;
      }

      try {
        if (token) {
          await fetchProfiles(token);
        }
      } catch (error) {
        console.error('Failed to load profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [token, fetchProfiles, user]);

  useEffect(() => {
    if (currentProfile) {
      navigate('/');
    }
  }, [currentProfile, navigate]);

  const handleProfileSelect = async (profile) => {
    if (profile.hasPin) {
      setSelectedProfile(profile);
      setShowPinInput(true);
      setPinError('');
    } else {
      setCurrentProfile(profile);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!pin) {
      setPinError('Please enter PIN');
      return;
    }

    try {
      await verifyPin(token, selectedProfile._id, pin);
      navigate('/');
    } catch (error) {
      setPinError('Invalid PIN');
      setPin('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="text-center relative z-10">
          <div className="animate-spin mb-4 inline-block">
            <div className="w-12 h-12 border-4 border-transparent border-t-neon-purple rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
              }}
            />
          </div>
          <p className="text-gray-400">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-neon-purple/30 glass-neon">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
                style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                }}
              >
                <span className="text-white font-black">SV</span>
              </div>
              <span className="text-white font-black hidden sm:inline">Streamverse</span>
            </div>
            <p className="text-gray-400 text-sm">
              Welcome, <span className="text-neon-cyan font-semibold">{user?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-12 px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-12 text-center animate-slide-up">
            <h1 className="heading-section mb-2">
              Select a Profile
            </h1>
            <p className="text-gray-400">
              Choose who's watching to continue with Streamverse
            </p>
          </div>

          {/* PIN Modal */}
          {showPinInput && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
              <div className="glass-neon card-spacing w-full max-w-sm animate-slide-up"
                style={{
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)'
                }}
              >
                <h2 className="heading-card mb-2">
                  Profile Protected
                </h2>
                <p className="text-gray-400 mb-6">
                  Please enter the PIN for <span className="text-neon-cyan font-semibold">
                    {selectedProfile?.name}
                  </span>
                </p>

                <form onSubmit={handlePinSubmit}>
                  <div className="mb-4">
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter PIN"
                      maxLength="4"
                      className="w-full text-center text-2xl tracking-widest py-4"
                      autoFocus
                    />
                  </div>

                  {pinError && (
                    <div className="mb-4 p-3 glass-neon border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2"
                      style={{
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <FiLock size={16} />
                      {pinError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPinInput(false);
                        setPin('');
                        setPinError('');
                      }}
                      className="flex-1 px-4 py-2 btn-hologram font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 btn-neon font-medium"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Profiles Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {profiles.map((profile) => (
              <div
                key={profile._id}
                onClick={() => handleProfileSelect(profile)}
                className="cursor-pointer group"
              >
                <ProfileCard profile={profile} />
              </div>
            ))}

            {/* Add New Profile */}
            <button className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl glass-neon hover:scale-105 transition-all duration-300 group">
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-neon-purple/30 rounded-xl flex items-center justify-center group-hover:border-neon-purple transition-all duration-300"
                style={{
                  boxShadow: '0 0 0 rgba(168, 85, 247, 0)'
                }}
              >
                <FiPlus className="text-3xl text-gray-600 group-hover:text-neon-purple transition-colors" />
              </div>
              <p className="text-white font-semibold text-center">
                Add Profile
              </p>
            </button>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center gap-6 text-gray-400 text-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button className="hover:text-neon-cyan transition-colors">
              Manage Profiles
            </button>
            <span className="text-neon-purple/30">|</span>
            <button className="hover:text-neon-cyan transition-colors">
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelect;
