import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          expired: true
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const verifyProfile = async (req, res, next) => {
  try {
    const profileId = req.headers['x-profile-id'];

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID required'
      });
    }

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (profile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Profile does not belong to user'
      });
    }

    if (!profile.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Profile is inactive'
      });
    }

    req.profile = profile;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during profile verification'
    });
  }
};

export const verifyPin = async (req, res, next) => {
  try {
    if (!req.profile.hasPinProtection) {
      return next();
    }

    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN required for this profile',
        requiresPin: true
      });
    }

    const isValidPin = await req.profile.comparePin(pin);

    if (!isValidPin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during PIN verification'
    });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during admin verification'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid but that's okay for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};
