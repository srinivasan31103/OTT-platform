import mongoose from 'mongoose';

const deviceSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'smart-tv', 'browser', 'other'],
    default: 'browser'
  },
  platform: {
    type: String
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  ipAddress: {
    type: String
  },
  location: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  lastPlayedContent: {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'lastPlayedContent.contentType'
    },
    contentType: {
      type: String,
      enum: ['Movie', 'Episode', 'Shorts']
    },
    position: Number,
    timestamp: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionToken: {
    type: String,
    unique: true,
    sparse: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

deviceSessionSchema.index({ user: 1, deviceId: 1 });
deviceSessionSchema.index({ sessionToken: 1 });
deviceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

deviceSessionSchema.methods.updateActivity = async function(contentInfo = null) {
  this.lastActive = new Date();
  if (contentInfo) {
    this.lastPlayedContent = contentInfo;
  }
  await this.save();
};

const DeviceSession = mongoose.model('DeviceSession', deviceSessionSchema);

export default DeviceSession;
