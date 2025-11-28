import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isAdmin === true) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile-select', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Login and wait for it to complete
      const response = await login(email, password);

      // Get the fresh user from store after login
      const currentUser = useAuthStore.getState().user;
      console.log('Login - Response:', response);
      console.log('Login - Current User:', currentUser);
      console.log('Login - isAdmin:', currentUser?.isAdmin);

      // Check if user is admin and redirect accordingly
      if (currentUser?.isAdmin === true) {
        console.log('Login - Admin detected, redirecting to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('Login - Regular user, redirecting to /profile-select');
        navigate('/profile-select', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-4 particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl flex items-center justify-center mx-auto mb-4 group hover:scale-110 hover:rotate-3 transition-all duration-500"
            style={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4)'
            }}
          >
            <span className="text-white font-black text-2xl">SV</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent">Streamverse</h1>
          <p className="text-gray-400 mt-2">Premium Streaming Platform</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 glass-neon rounded-2xl border border-red-500/50 flex items-start gap-3 animate-slide-up"
            style={{
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
            }}
          >
            <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-neon card-spacing animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="heading-card mb-6">Sign In</h2>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3"
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-neon-purple transition-colors">
              <input type="checkbox" className="w-4 h-4 accent-neon-purple" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-neon-pink hover:text-neon-purple transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-neon-pink hover:text-neon-purple transition-colors font-bold"
            >
              Sign Up
            </Link>
          </p>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 glass-neon rounded-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-400 text-xs font-bold mb-3">
            Demo Credentials:
          </p>
          <div className="space-y-2">
            <div>
              <p className="text-gray-500 text-xs mb-1">Regular User:</p>
              <p className="text-gray-300 text-xs">
                Email: <span className="font-mono text-neon-cyan">demo@streamverse.com</span>
              </p>
              <p className="text-gray-300 text-xs">
                Password: <span className="font-mono text-neon-cyan">demo123</span>
              </p>
            </div>
            <div className="pt-2 border-t border-neon-purple/20">
              <p className="text-neon-orange text-xs mb-1 font-bold">Admin:</p>
              <p className="text-gray-300 text-xs">
                Email: <span className="font-mono text-neon-orange">admin@streamverse.com</span>
              </p>
              <p className="text-gray-300 text-xs">
                Password: <span className="font-mono text-neon-orange">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
