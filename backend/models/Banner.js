import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  mobileImageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  ctaText: {
    type: String,
    default: 'Watch Now'
  },
  ctaLink: {
    type: String
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  position: {
    type: String,
    enum: ['hero', 'top', 'middle', 'bottom'],
    default: 'hero'
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'scheduled'],
    default: 'draft'
  },
  schedule: {
    startDate: Date,
    endDate: Date
  },
  targetPages: {
    type: [String],
    enum: ['home', 'movies', 'series', 'live-tv', 'shorts', 'all'],
    default: ['home']
  },
  showForGuests: {
    type: Boolean,
    default: true
  },
  showForUsers: {
    type: Boolean,
    default: true
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for active banners lookup
bannerSchema.index({ status: 1, position: 1, order: 1 });
bannerSchema.index({ targetPages: 1 });

// Method to check if banner should be displayed
bannerSchema.methods.shouldDisplay = function() {
  const now = new Date();

  if (this.status !== 'active') return false;

  if (this.schedule && this.schedule.startDate && this.schedule.endDate) {
    return this.schedule.startDate <= now && this.schedule.endDate >= now;
  }

  return true;
};

export default mongoose.model('Banner', bannerSchema);
