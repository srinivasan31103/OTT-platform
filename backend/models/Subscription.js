import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'past_due'],
    default: 'inactive',
    index: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'razorpay'],
    required: true
  },
  providerSubscriptionId: {
    type: String,
    required: true,
    index: true
  },
  providerCustomerId: {
    type: String,
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
    index: true
  },
  cancelAt: {
    type: Date
  },
  canceledAt: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  trialEnd: {
    type: Date
  },
  metadata: {
    type: Map,
    of: String
  },
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending', 'refunded']
    },
    paymentMethod: String,
    invoiceId: String,
    paidAt: Date,
    failureReason: String
  }]
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ providerSubscriptionId: 1 });

subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date(this.currentPeriodEnd) > new Date();
};

subscriptionSchema.methods.cancel = async function(immediately = false) {
  if (immediately) {
    this.status = 'cancelled';
    this.canceledAt = new Date();
  } else {
    this.cancelAtPeriodEnd = true;
    this.cancelAt = this.currentPeriodEnd;
  }
  await this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
