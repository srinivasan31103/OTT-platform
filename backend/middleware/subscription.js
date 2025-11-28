export const checkSubscription = (requiredTier = 'free') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const tierLevels = {
        free: 0,
        basic: 1,
        standard: 2,
        premium: 3
      };

      const hasAccess = req.user.canAccessContent(requiredTier);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Subscription upgrade required',
          requiredTier,
          currentTier: req.user.subscription.type,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during subscription check'
      });
    }
  };
};

export const checkContentAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const content = req.content;

    if (!content) {
      return next();
    }

    const hasSubscriptionAccess = req.user.canAccessContent(content.subscriptionTier);

    if (!hasSubscriptionAccess) {
      return res.status(403).json({
        success: false,
        message: 'Subscription upgrade required to access this content',
        requiredTier: content.subscriptionTier,
        currentTier: req.user.subscription.type,
        upgradeRequired: true
      });
    }

    if (content.geoRestrictions && content.geoRestrictions.enabled) {
      const userRegion = req.user.region || 'US';

      if (content.geoRestrictions.blockedCountries &&
          content.geoRestrictions.blockedCountries.includes(userRegion)) {
        return res.status(403).json({
          success: false,
          message: 'This content is not available in your region',
          geoBlocked: true
        });
      }

      if (content.geoRestrictions.allowedCountries &&
          content.geoRestrictions.allowedCountries.length > 0 &&
          !content.geoRestrictions.allowedCountries.includes(userRegion)) {
        return res.status(403).json({
          success: false,
          message: 'This content is not available in your region',
          geoBlocked: true
        });
      }
    }

    if (req.profile) {
      const hasMaturityAccess = req.profile.canAccessContent(content.maturityRating);

      if (!hasMaturityAccess) {
        return res.status(403).json({
          success: false,
          message: 'This content is restricted by parental controls',
          maturityRestricted: true
        });
      }
    }

    if (content.availability) {
      const now = new Date();

      if (content.availability.startDate && new Date(content.availability.startDate) > now) {
        return res.status(403).json({
          success: false,
          message: 'This content is not yet available',
          availableAt: content.availability.startDate
        });
      }

      if (content.availability.endDate && new Date(content.availability.endDate) < now) {
        return res.status(403).json({
          success: false,
          message: 'This content is no longer available',
          expiredAt: content.availability.endDate
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during content access check'
    });
  }
};

export const checkActiveSubscription = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.hasActiveSubscription()) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        subscriptionInactive: true
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during subscription check'
    });
  }
};

export const checkDeviceLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const deviceLimits = {
      free: 1,
      basic: 2,
      standard: 3,
      premium: 5
    };

    const maxDevices = deviceLimits[req.user.subscription.type] || 1;
    const activeDevices = req.user.devices.filter(d =>
      new Date(d.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    if (activeDevices >= maxDevices) {
      const deviceId = req.headers['x-device-id'];
      const existingDevice = req.user.devices.find(d => d.deviceId === deviceId);

      if (!existingDevice) {
        return res.status(403).json({
          success: false,
          message: 'Device limit reached. Please upgrade your subscription.',
          deviceLimitReached: true,
          maxDevices,
          activeDevices
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during device limit check'
    });
  }
};
