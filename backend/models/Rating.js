import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
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
    enum: ['Movie', 'Series', 'Episode', 'Shorts']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 2000
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ratingSchema.index({ profile: 1, contentId: 1, contentType: 1 }, { unique: true });
ratingSchema.index({ contentId: 1, contentType: 1, rating: -1 });
ratingSchema.index({ createdAt: -1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
