import mongoose from 'mongoose';

const shortsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  duration: {
    type: Number,
    required: true,
    max: 180
  },
  thumbnail: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  hlsUrl: {
    type: String
  },
  qualityVersions: [{
    quality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p']
    },
    url: String,
    size: Number,
    bitrate: Number
  }],
  orientation: {
    type: String,
    enum: ['portrait', 'landscape'],
    default: 'portrait'
  },
  aspectRatio: {
    type: String,
    default: '9:16'
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['comedy', 'action', 'drama', 'thriller', 'romance', 'horror', 'other'],
    default: 'other'
  },
  views: {
    type: Number,
    default: 0,
    index: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  maturityRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    default: 'PG'
  },
  aiModerated: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationFlags: [{
    type: String,
    enum: ['violence', 'sexual-content', 'hate-speech', 'spam', 'copyright']
  }],
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium'],
    default: 'free'
  },
  relatedMovie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },
  relatedSeries: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series'
  }
}, {
  timestamps: true
});

shortsSchema.index({ title: 'text', description: 'text', tags: 'text' });
shortsSchema.index({ views: -1, createdAt: -1 });
shortsSchema.index({ trending: 1, featured: 1 });
shortsSchema.index({ creator: 1, createdAt: -1 });

shortsSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + this._id.toString().slice(-6);
  }
  next();
});

shortsSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

const Shorts = mongoose.model('Shorts', shortsSchema);

export default Shorts;
