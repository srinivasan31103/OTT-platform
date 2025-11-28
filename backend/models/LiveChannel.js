import mongoose from 'mongoose';

const liveChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String
  },
  logo: {
    type: String,
    required: true
  },
  banner: {
    type: String
  },
  streamUrl: {
    type: String,
    required: true
  },
  hlsUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['sports', 'news', 'entertainment', 'movies', 'music', 'kids', 'documentaries', 'other'],
    default: 'entertainment'
  },
  isLive: {
    type: Boolean,
    default: true,
    index: true
  },
  viewers: {
    type: Number,
    default: 0
  },
  chatEnabled: {
    type: Boolean,
    default: true
  },
  schedule: [{
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    thumbnail: String
  }],
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium'],
    default: 'free'
  },
  region: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

liveChannelSchema.index({ category: 1, isLive: 1 });
liveChannelSchema.index({ featured: 1, status: 1 });

liveChannelSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const LiveChannel = mongoose.model('LiveChannel', liveChannelSchema);

export default LiveChannel;
