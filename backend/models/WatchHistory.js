import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Movie', 'Episode', 'Shorts']
  },
  lastPosition: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    required: true
  },
  finished: {
    type: Boolean,
    default: false
  },
  watchedPercentage: {
    type: Number,
    default: 0
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  device: {
    deviceId: String,
    deviceType: String,
    deviceName: String
  },
  quality: {
    type: String
  },
  subtitleLanguage: {
    type: String
  },
  audioLanguage: {
    type: String
  }
}, {
  timestamps: true
});

watchHistorySchema.index({ profile: 1, contentId: 1, contentType: 1 }, { unique: true });
watchHistorySchema.index({ profile: 1, lastWatchedAt: -1 });
watchHistorySchema.index({ contentId: 1, contentType: 1 });

watchHistorySchema.pre('save', function(next) {
  if (this.duration > 0) {
    this.watchedPercentage = Math.min(100, (this.lastPosition / this.duration) * 100);
    this.finished = this.watchedPercentage >= 90;
  }
  next();
});

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

export default WatchHistory;
