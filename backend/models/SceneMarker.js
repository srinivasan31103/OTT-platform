import mongoose from 'mongoose';

const sceneMarkerSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType',
    index: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Movie', 'Episode']
  },
  time: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  },
  type: {
    type: String,
    enum: ['intro', 'recap', 'credits', 'scene', 'action', 'dialogue', 'climax', 'chapter'],
    default: 'scene'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  verified: {
    type: Boolean,
    default: false
  },
  skipEnabled: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number
  }
}, {
  timestamps: true
});

sceneMarkerSchema.index({ contentId: 1, contentType: 1, time: 1 });
sceneMarkerSchema.index({ type: 1 });

const SceneMarker = mongoose.model('SceneMarker', sceneMarkerSchema);

export default SceneMarker;
