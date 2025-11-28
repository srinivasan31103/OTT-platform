import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
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
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  releaseDate: {
    type: Date
  },
  duration: {
    type: Number,
    required: true
  },
  genres: [{
    type: String,
    index: true
  }],
  tags: [{
    type: String
  }],
  cast: [{
    name: String,
    character: String,
    image: String,
    order: Number
  }],
  director: [{
    name: String,
    image: String
  }],
  writers: [{
    name: String
  }],
  producers: [{
    name: String
  }],
  studio: {
    type: String
  },
  thumbnail: {
    type: String,
    required: true
  },
  banner: {
    type: String
  },
  logo: {
    type: String
  },
  trailerUrl: {
    type: String
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
  maturityRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    default: 'PG-13',
    index: true
  },
  contentAdvisory: [{
    type: String,
    enum: ['violence', 'language', 'sexual-content', 'drug-use', 'gore', 'nudity']
  }],
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
    description: {
      type: String
    },
    generatedAt: Date,
    mood: [{
      type: String
    }],
    themes: [{
      type: String
    }],
    aiSummary: String
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
  geoRestrictions: {
    enabled: {
      type: Boolean,
      default: false
    },
    allowedCountries: [{
      type: String
    }],
    blockedCountries: [{
      type: String
    }]
  },
  availability: {
    startDate: Date,
    endDate: Date,
    regions: [{
      type: String
    }]
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium'],
    default: 'free',
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  newRelease: {
    type: Boolean,
    default: false,
    index: true
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

movieSchema.index({ title: 'text', description: 'text', tags: 'text' });
movieSchema.index({ genres: 1, year: -1 });
movieSchema.index({ views: -1, createdAt: -1 });
movieSchema.index({ featured: 1, trending: 1, newRelease: 1 });
movieSchema.index({ status: 1, subscriptionTier: 1 });

movieSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + this._id.toString().slice(-6);
  }
  next();
});

movieSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

movieSchema.methods.updateRating = async function(newRating) {
  const totalScore = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (totalScore + newRating) / this.totalRatings;
  await this.save();
};

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
