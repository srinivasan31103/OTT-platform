import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    sparse: true
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'basic', 'standard', 'premium'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'inactive'
    },
    startDate: Date,
    endDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    razorpayCustomerId: String,
    razorpaySubscriptionId: String
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  maxProfiles: {
    type: Number,
    default: 4
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    dataUsage: {
      type: String,
      enum: ['low', 'medium', 'high', 'auto'],
      default: 'auto'
    }
  },
  devices: [{
    deviceId: String,
    deviceName: String,
    deviceType: String,
    lastActive: Date,
    location: String
  }],
  gamification: {
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      name: String,
      icon: String,
      earnedAt: Date
    }],
    streakDays: {
      type: Number,
      default: 0
    },
    lastWatchDate: Date
  },
  refreshToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  region: {
    type: String,
    default: 'US'
  },
  allowedCountries: [{
    type: String
  }],
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasActiveSubscription = function() {
  return this.subscription.status === 'active' &&
         this.subscription.endDate &&
         new Date(this.subscription.endDate) > new Date();
};

userSchema.methods.canAccessContent = function(requiredTier) {
  const tiers = { free: 0, basic: 1, standard: 2, premium: 3 };
  const userTier = this.hasActiveSubscription() ? tiers[this.subscription.type] : tiers.free;
  return userTier >= tiers[requiredTier];
};

userSchema.methods.addXP = async function(points) {
  this.gamification.xp += points;
  const newLevel = Math.floor(this.gamification.xp / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
  }
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
