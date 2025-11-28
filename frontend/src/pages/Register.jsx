import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const passwordStrength = {
    weak: 0,
    fair: 1,
    good: 2,
    strong: 3,
  };

  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor =
    strength === 0
      ? 'bg-red-500'
      : strength === 1
      ? 'bg-orange-500'
      : strength === 2
      ? 'bg-yellow-500'
      : strength === 3
      ? 'bg-lime-500'
      : 'bg-green-500';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      await register(formData.email, formData.password, formData.name);
      navigate('/profile-select');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center px-4 py-12 particles-bg relative overflow-hidden">
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
          <p className="text-gray-400 mt-2">Create Your Account</p>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass-neon card-spacing animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="heading-card mb-6">Sign Up</h2>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3"
              />
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-streamverse-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColor} transition-all`}
                      style={{ width: `${(strength + 1) * 25}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{strengthLabel}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-4 py-3"
              />
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 flex items-center gap-2">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <FiCheck className="text-neon-green" size={16} />
                    <span className="text-xs text-neon-green">Passwords match</span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-red-400" size={16} />
                    <span className="text-xs text-red-400">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Terms & Conditions */}
          <label className="flex items-start gap-2 mb-6 text-gray-400 text-xs cursor-pointer hover:text-neon-purple transition-colors">
            <input type="checkbox" className="w-4 h-4 mt-0.5 accent-neon-purple" required />
            <span>
              I agree to the{' '}
              <button type="button" className="text-neon-pink hover:text-neon-purple transition-colors">
                Terms and Conditions
              </button>{' '}
              and{' '}
              <button type="button" className="text-neon-pink hover:text-neon-purple transition-colors">
                Privacy Policy
              </button>
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-neon-pink hover:text-neon-purple transition-colors font-bold"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
