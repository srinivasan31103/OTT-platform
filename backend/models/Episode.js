import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    index: true
  },
  episodeNumber: {
    type: Number,
    required: true
  },
  seasonNumber: {
    type: Number,
    required: true,
    index: true
  },
  description: {
    type: String
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  duration: {
    type: Number,
    required: true
  },
  releaseDate: {
    type: Date
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
  dashUrl: {
    type: String
  },
  qualityVersions: [{
    quality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p', '4K']
    },
    url: String,
    size: Number,
    bitrate: Number
  }],
  subtitleTracks: [{
    language: String,
    languageCode: String,
    url: String,
    default: {
      type: Boolean,
      default: false
    }
  }],
  audioTracks: [{
    language: String,
    languageCode: String,
    url: String,
    codec: String,
    channels: String,
    default: {
      type: Boolean,
      default: false
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  sceneMarkers: [{
    time: Number,
    title: String,
    thumbnail: String,
    type: {
      type: String,
      enum: ['intro', 'recap', 'credits', 'scene', 'action', 'dialogue']
    },
    aiGenerated: {
      type: Boolean,
      default: false
    }
  }],
  aiMetadata: {
    description: String,
    generatedAt: Date,
    summary: String
  },
  drm: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['widevine', 'fairplay', 'playready', 'aes128']
    },
    keyId: String,
    licenseUrl: String
  },
  encryption: {
    enabled: {
      type: Boolean,
      default: true
    },
    method: {
      type: String,
      default: 'AES-128'
    },
    keyUri: String
  },
  cdnUrls: [{
    provider: String,
    url: String,
    priority: Number
  }],
  downloadable: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

episodeSchema.index({ series: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ title: 'text', description: 'text' });
episodeSchema.index({ views: -1, createdAt: -1 });

episodeSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = `s${this.seasonNumber}e${this.episodeNumber}-${this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}`;
  }
  next();
});

episodeSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

episodeSchema.methods.updateRating = async function(newRating) {
  const totalScore = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (totalScore + newRating) / this.totalRatings;
  await this.save();
};

const Episode = mongoose.model('Episode', episodeSchema);

export default Episode;
