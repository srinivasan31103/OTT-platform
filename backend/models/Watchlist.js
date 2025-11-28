import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
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
    enum: ['Movie', 'Series', 'Shorts']
  },
  addedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  notifyOnRelease: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

watchlistSchema.index({ profile: 1, contentId: 1, contentType: 1 }, { unique: true });
watchlistSchema.index({ profile: 1, addedAt: -1 });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;
