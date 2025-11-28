import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType',
    index: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Movie', 'Series', 'Episode', 'Shorts']
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  aiModerated: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  moderationScore: {
    toxicity: { type: Number, default: 0 },
    spam: { type: Number, default: 0 },
    profanity: { type: Number, default: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] }
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReasons: [{
    type: String,
    enum: ['spam', 'harassment', 'hate-speech', 'violence', 'sexual-content', 'other']
  }],
  flaggedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  pinned: {
    type: Boolean,
    default: false
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

commentSchema.index({ contentId: 1, contentType: 1, createdAt: -1 });
commentSchema.index({ profile: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ moderationStatus: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
