import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['banner', 'video', 'popup', 'sidebar'],
    default: 'banner'
  },
  imageUrl: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String
  },
  clickUrl: {
    type: String,
    required: true
  },
  sponsor: {
    name: String,
    logo: String,
    contact: String
  },
  placement: {
    type: String,
    enum: ['home-hero', 'home-top', 'home-middle', 'home-bottom', 'sidebar', 'video-player', 'between-content'],
    default: 'home-top'
  },
  targetAudience: {
    region: [String],
    ageGroup: String,
    interests: [String]
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    activeHours: {
      start: String,
      end: String
    }
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'expired'],
    default: 'draft'
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    model: {
      type: String,
      enum: ['cpm', 'cpc', 'flat'],
      default: 'cpm'
    },
    rate: {
      type: Number,
      required: true
    },
    budget: Number,
    spent: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for active ads lookup
advertisementSchema.index({ status: 1, 'schedule.startDate': 1, 'schedule.endDate': 1 });
advertisementSchema.index({ placement: 1, priority: -1 });

// Method to check if ad is currently active
advertisementSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' &&
         this.schedule.startDate <= now &&
         this.schedule.endDate >= now;
};

// Update CTR on save
advertisementSchema.pre('save', function(next) {
  if (this.analytics.impressions > 0) {
    this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions) * 100;
  }
  next();
});

export default mongoose.model('Advertisement', advertisementSchema);
