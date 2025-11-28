import Profile from '../models/Profile.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Create new profile
export const createProfile = async (req, res) => {
  try {
    const { name, avatar, type, pin } = req.body;
    const userId = req.user._id;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Profile name is required'
      });
    }

    if (!type || !['kid', 'teen', 'adult'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid profile type is required (kid, teen, adult)'
      });
    }

    // Check profile limit
    const user = await User.findById(userId);
    const profileCount = await Profile.countDocuments({ user: userId, isActive: true });

    if (profileCount >= user.maxProfiles) {
      return res.status(400).json({
        success: false,
        message: `Maximum profiles limit (${user.maxProfiles}) reached`
      });
    }

    // Create profile
    const profile = new Profile({
      user: userId,
      name,
      avatar: avatar || 'https://res.cloudinary.com/streamverse/image/upload/v1/avatars/default.png',
      type,
      pin: pin || null,
      hasPinProtection: !!pin
    });

    // Set maturity level based on type
    profile.setMaturityByType();

    await profile.save();

    return res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
};

// Get all profiles for user
export const getUserProfiles = async (req, res) => {
  try {
    const userId = req.user._id;

    const profiles = await Profile.find({
      user: userId,
      isActive: true
    }).select('-pin');

    return res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
};

// Get single profile
export const getProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user._id;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user._id;
    const { name, avatar, type, preferences, parentalControls } = req.body;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Update fields
    if (name) profile.name = name;
    if (avatar) profile.avatar = avatar;
    if (type && ['kid', 'teen', 'adult'].includes(type)) {
      profile.type = type;
      profile.setMaturityByType();
    }

    if (preferences) {
      profile.preferences = { ...profile.preferences, ...preferences };
    }

    if (parentalControls) {
      profile.parentalControls = { ...profile.parentalControls, ...parentalControls };
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete profile (soft delete)
export const deleteProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user._id;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Soft delete
    profile.isActive = false;
    await profile.save();

    // Remove from user's profiles
    const user = await User.findById(userId);
    user.profiles = user.profiles.filter(p => p.toString() !== profileId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
};

// Select/Switch profile with PIN verification
export const selectProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { pin } = req.body;
    const userId = req.user._id;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify PIN if required
    if (profile.hasPinProtection) {
      if (!pin) {
        return res.status(401).json({
          success: false,
          message: 'PIN required for this profile',
          requiresPin: true
        });
      }

      const isPinValid = await profile.comparePin(pin);
      if (!isPinValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid PIN'
        });
      }
    }

    // Return profile with minimal sensitive data
    const profileData = {
      _id: profile._id,
      name: profile.name,
      avatar: profile.avatar,
      type: profile.type,
      maturityLevel: profile.maturityLevel,
      preferences: profile.preferences,
      parentalControls: profile.parentalControls
    };

    return res.status(200).json({
      success: true,
      message: 'Profile selected successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Select profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error selecting profile',
      error: error.message
    });
  }
};

// Set/Change PIN
export const setPin = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { pin, oldPin } = req.body;
    const userId = req.user._id;

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 digits'
      });
    }

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify old PIN if already set
    if (profile.hasPinProtection && oldPin) {
      const isOldPinValid = await profile.comparePin(oldPin);
      if (!isOldPinValid) {
        return res.status(401).json({
          success: false,
          message: 'Current PIN is incorrect'
        });
      }
    }

    // Set new PIN
    profile.pin = pin;
    profile.hasPinProtection = true;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'PIN set successfully'
    });
  } catch (error) {
    console.error('Set PIN error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error setting PIN',
      error: error.message
    });
  }
};

// Remove PIN
export const removePin = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { pin } = req.body;
    const userId = req.user._id;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify PIN
    if (profile.hasPinProtection) {
      if (!pin) {
        return res.status(400).json({
          success: false,
          message: 'PIN is required to remove protection'
        });
      }

      const isPinValid = await profile.comparePin(pin);
      if (!isPinValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid PIN'
        });
      }
    }

    // Remove PIN
    profile.pin = null;
    profile.hasPinProtection = false;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'PIN protection removed successfully'
    });
  } catch (error) {
    console.error('Remove PIN error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing PIN',
      error: error.message
    });
  }
};

// Get profile recommendations
export const getRecommendations = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user._id;

    const profile = await Profile.findById(profileId)
      .populate({
        path: 'recommendations.contentId',
        select: 'title thumbnail slug maturityRating'
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const recommendations = profile.recommendations
      .slice(0, parseInt(limit))
      .map(rec => ({
        _id: rec._id,
        contentId: rec.contentId?._id,
        title: rec.contentId?.title,
        thumbnail: rec.contentId?.thumbnail,
        slug: rec.contentId?.slug,
        score: rec.score,
        reason: rec.reason,
        generatedAt: rec.generatedAt,
        contentType: rec.contentType
      }));

    return res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

// Update profile preferences
export const updatePreferences = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user._id;
    const preferences = req.body;

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify ownership
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    profile.preferences = { ...profile.preferences, ...preferences };
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: profile.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

// Additional aliases and missing exports
export const getProfiles = getUserProfiles; // Alias
export const setActiveProfile = selectProfile; // Alias
export const updateProfilePin = setPin; // Alias
export const verifyProfilePin = async (req, res) => {
  try {
    const { pin } = req.body;
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile || !profile.pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN not set for this profile'
      });
    }

    const isValid = await bcrypt.compare(pin, profile.pin);

    res.json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PIN',
      error: error.message
    });
  }
};

export const getProfilePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id).select('preferences');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile.preferences || {}
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

export const updateProfilePreferences = updatePreferences; // Alias
