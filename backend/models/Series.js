import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled', 'draft'],
    default: 'ongoing',
    index: true
  },
  totalSeasons: {
    type: Number,
    default: 1
  },
  totalEpisodes: {
    type: Number,
    default: 0
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
  creators: [{
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
  aiMetadata: {
    description: String,
    generatedAt: Date,
    mood: [String],
    themes: [String],
    aiSummary: String
  },
  geoRestrictions: {
    enabled: {
      type: Boolean,
      default: false
    },
    allowedCountries: [String],
    blockedCountries: [String]
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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

seriesSchema.index({ title: 'text', description: 'text', tags: 'text' });
seriesSchema.index({ genres: 1, year: -1 });
seriesSchema.index({ views: -1, createdAt: -1 });
seriesSchema.index({ featured: 1, trending: 1, newRelease: 1 });

seriesSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + this._id.toString().slice(-6);
  }
  next();
});

seriesSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

seriesSchema.methods.updateRating = async function(newRating) {
  const totalScore = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (totalScore + newRating) / this.totalRatings;
  await this.save();
};

const Series = mongoose.model('Series', seriesSchema);

export default Series;
