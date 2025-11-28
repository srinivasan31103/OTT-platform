import mongoose from 'mongoose';

const watchPartySchema = new mongoose.Schema({
  host: {
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
    enum: ['Movie', 'Episode']
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    peerId: String
  }],
  maxParticipants: {
    type: Number,
    default: 10
  },
  currentTime: {
    type: Number,
    default: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'ended'],
    default: 'waiting',
    index: true
  },
  chatEnabled: {
    type: Boolean,
    default: true
  },
  messages: [{
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    },
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

watchPartySchema.index({ roomId: 1 });
watchPartySchema.index({ inviteCode: 1 });
watchPartySchema.index({ host: 1, status: 1 });
watchPartySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

watchPartySchema.methods.addParticipant = async function(profileId, peerId) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Watch party is full');
  }

  const existingParticipant = this.participants.find(
    p => p.profile.toString() === profileId.toString()
  );

  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.peerId = peerId;
  } else {
    this.participants.push({
      profile: profileId,
      peerId,
      joinedAt: new Date(),
      isActive: true
    });
  }

  await this.save();
};

watchPartySchema.methods.removeParticipant = async function(profileId) {
  const participant = this.participants.find(
    p => p.profile.toString() === profileId.toString()
  );

  if (participant) {
    participant.isActive = false;
  }

  const activeCount = this.participants.filter(p => p.isActive).length;
  if (activeCount === 0) {
    this.status = 'ended';
    this.endedAt = new Date();
  }

  await this.save();
};

const WatchParty = mongoose.model('WatchParty', watchPartySchema);

export default WatchParty;
