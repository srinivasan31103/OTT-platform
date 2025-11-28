import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/streamverse/image/upload/v1/avatars/default.png'
  },
  type: {
    type: String,
    enum: ['kid', 'teen', 'adult'],
    default: 'adult'
  },
  pin: {
    type: String,
    default: null
  },
  hasPinProtection: {
    type: Boolean,
    default: false
  },
  maturityLevel: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    default: 'NC-17'
  },
  preferences: {
    genres: [{
      type: String
    }],
    languages: [{
      type: String
    }],
    autoplayNext: {
      type: Boolean,
      default: true
    },
    skipIntro: {
      type: Boolean,
      default: false
    },
    subtitlesEnabled: {
      type: Boolean,
      default: false
    },
    subtitleLanguage: {
      type: String,
      default: 'en'
    },
    audioLanguage: {
      type: String,
      default: 'en'
    }
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchHistory'
  }],
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watchlist'
  }],
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }],
  recommendations: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recommendations.contentType'
    },
    contentType: {
      type: String,
      enum: ['Movie', 'Series', 'Shorts']
    },
    score: Number,
    reason: String,
    generatedAt: Date
  }],
  parentalControls: {
    enabled: {
      type: Boolean,
      default: false
    },
    blockedGenres: [{
      type: String
    }],
    allowedRatings: [{
      type: String
    }],
    blockExplicitContent: {
      type: Boolean,
      default: false
    },
    maxWatchTimePerDay: {
      type: Number,
      default: 0
    }
  },
  aiMoodPreferences: [{
    mood: String,
    timestamp: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

profileSchema.index({ user: 1, isActive: 1 });
profileSchema.index({ type: 1 });

profileSchema.pre('save', async function(next) {
  if (!this.isModified('pin') || !this.pin) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    this.hasPinProtection = true;
    next();
  } catch (error) {
    next(error);
  }
});

profileSchema.methods.comparePin = async function(candidatePin) {
  if (!this.hasPinProtection || !this.pin) return true;
  return await bcrypt.compare(candidatePin, this.pin);
};

profileSchema.methods.canAccessContent = function(maturityRating) {
  const ratings = { 'G': 0, 'PG': 1, 'PG-13': 2, 'R': 3, 'NC-17': 4 };
  const profileLevel = ratings[this.maturityLevel] || 4;
  const contentLevel = ratings[maturityRating] || 0;
  return profileLevel >= contentLevel;
};

profileSchema.methods.setMaturityByType = function() {
  const maturityMap = {
    kid: 'G',
    teen: 'PG-13',
    adult: 'NC-17'
  };
  this.maturityLevel = maturityMap[this.type];
};

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
