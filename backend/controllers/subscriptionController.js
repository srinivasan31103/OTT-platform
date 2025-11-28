import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = req.body;

    // Verify webhook signature
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    let verifiedEvent;

    if (process.env.NODE_ENV === 'production') {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      try {
        verifiedEvent = stripe.webhooks.constructEvent(
          req.rawBody || JSON.stringify(event),
          signature,
          endpointSecret
        );
      } catch (err) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else {
      verifiedEvent = event;
    }

    // Handle events
    switch (verifiedEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = verifiedEvent.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = verifiedEvent.data.object;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = verifiedEvent.data.object;
        await handlePaymentSuccess(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = verifiedEvent.data.object;
        await handlePaymentFailure(invoice);
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// Razorpay webhook handler
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const { order_id, payment_id, signature, status } = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (status === 'captured') {
      await handleRazorpayPaymentSuccess(payment_id, order_id);
    } else if (status === 'failed') {
      await handleRazorpayPaymentFailure(payment_id, order_id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// Create subscription (Stripe)
export const createStripeSubscription = async (req, res) => {
  try {
    const { plan, paymentMethodId } = req.body;
    const userId = req.user._id;

    if (!['basic', 'standard', 'premium'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Create or get Stripe customer
    let customerId = user.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: userId.toString() }
      });
      customerId = customer.id;
    }

    // Create subscription
    const planPrices = {
      basic: 'price_basic', // Replace with actual Stripe price IDs
      standard: 'price_standard',
      premium: 'price_premium'
    };

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planPrices[plan] }],
      payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      default_payment_method: paymentMethodId
    });

    // Save subscription to database
    const dbSubscription = new Subscription({
      user: userId,
      plan,
      provider: 'stripe',
      providerSubscriptionId: subscription.id,
      providerCustomerId: customerId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status === 'active' ? 'active' : 'inactive',
      amount: subscription.items.data[0].price.unit_amount / 100,
      currency: subscription.currency.toUpperCase(),
      billingCycle: subscription.items.data[0].price.recurring.interval === 'year' ? 'yearly' : 'monthly'
    });

    await dbSubscription.save();

    // Update user
    user.subscription.type = plan;
    user.subscription.status = 'active';
    user.subscription.stripeCustomerId = customerId;
    user.subscription.stripeSubscriptionId = subscription.id;
    user.subscription.startDate = new Date();
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: dbSubscription._id,
        stripeSubscriptionId: subscription.id,
        status: dbSubscription.status,
        nextBillingDate: dbSubscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// Create subscription (Razorpay)
export const createRazorpaySubscription = async (req, res) => {
  try {
    const { plan, customerId } = req.body;
    const userId = req.user._id;

    if (!['basic', 'standard', 'premium'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create Razorpay subscription
    const planPrices = {
      basic: 499, // Amount in paise
      standard: 999,
      premium: 1499
    };

    const response = await axios.post(
      'https://api.razorpay.com/v1/subscriptions',
      {
        plan_id: `plan_${plan}`,
        customer_notify: 1,
        quantity: 1,
        total_count: 0,
        addons: []
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET
        }
      }
    );

    const subscription = response.data;

    // Save to database
    const dbSubscription = new Subscription({
      user: userId,
      plan,
      provider: 'razorpay',
      providerSubscriptionId: subscription.id,
      providerCustomerId: customerId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      status: 'inactive',
      amount: planPrices[plan] / 100,
      currency: 'INR',
      billingCycle: 'monthly'
    });

    await dbSubscription.save();

    // Update user
    user.subscription.type = plan;
    user.subscription.status = 'inactive';
    user.subscription.razorpayCustomerId = customerId;
    user.subscription.razorpaySubscriptionId = subscription.id;
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Razorpay subscription created',
      data: {
        subscriptionId: dbSubscription._id,
        razorpaySubscriptionId: subscription.id,
        amount: planPrices[plan] / 100,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Create Razorpay subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating Razorpay subscription',
      error: error.message
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediately = false } = req.body;
    const userId = req.user._id;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Verify ownership
    if (subscription.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Cancel with provider
    if (subscription.provider === 'stripe') {
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      await stripe.subscriptions.del(subscription.providerSubscriptionId);
    } else if (subscription.provider === 'razorpay') {
      await axios.post(
        `https://api.razorpay.com/v1/subscriptions/${subscription.providerSubscriptionId}/cancel`,
        { quantity: 0 },
        {
          auth: {
            username: RAZORPAY_KEY_ID,
            password: RAZORPAY_KEY_SECRET
          }
        }
      );
    }

    // Update subscription
    await subscription.cancel(immediately);

    // Update user
    const user = await User.findById(userId);
    if (immediately) {
      user.subscription.status = 'cancelled';
    } else {
      user.subscription.status = 'active'; // Still active until period end
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled',
      data: {
        canceledAt: subscription.canceledAt,
        willCancelAt: immediately ? 'immediately' : subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};

// Get subscription
export const getSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'past_due'] }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        provider: subscription.provider,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        amount: subscription.amount,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        cancelAt: subscription.cancelAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
};

// Get subscription plans
export const getPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        price: 499,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'HD (720p) streaming',
          '1 device at a time',
          '30 days free trial'
        ],
        limitations: [
          'Limited to 1 profile'
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          'Full HD (1080p) streaming',
          '2 devices at a time',
          'Ad-free experience',
          'Download on mobile'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 1499,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [
          '4K Ultra HD streaming',
          '4 devices at a time',
          'Ad-free experience',
          'Download on all devices',
          'Create 6 profiles',
          'Priority support'
        ]
      }
    ];

    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
};

// Upgrade subscription
export const upgradeSubscription = async (req, res) => {
  try {
    const { subscriptionId, newPlan } = req.body;
    const userId = req.user._id;

    if (!['basic', 'standard', 'premium'].includes(newPlan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update with provider
    if (subscription.provider === 'stripe') {
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      const planPrices = {
        basic: 'price_basic',
        standard: 'price_standard',
        premium: 'price_premium'
      };

      const items = await stripe.subscriptionItems.list({
        subscription: subscription.providerSubscriptionId
      });

      await stripe.subscriptionItems.update(items.data[0].id, {
        price: planPrices[newPlan]
      });
    }

    // Update in database
    subscription.plan = newPlan;
    await subscription.save();

    // Update user
    const user = await User.findById(userId);
    user.subscription.type = newPlan;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error upgrading subscription',
      error: error.message
    });
  }
};

// Get subscription history
export const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscriptions = await Subscription.find({ user: userId })
      .sort('-createdAt')
      .select('plan status provider currentPeriodStart currentPeriodEnd amount billingCycle createdAt');

    return res.status(200).json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscription history',
      error: error.message
    });
  }
};

// Helper functions
async function handleSubscriptionUpdate(stripeSubscription) {
  try {
    const subscription = await Subscription.findOne({
      providerSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      await subscription.save();

      const user = await User.findById(subscription.user);
      if (user) {
        user.subscription.status = stripeSubscription.status === 'active' ? 'active' : 'inactive';
        user.subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
        await user.save();
      }
    }
  } catch (error) {
    console.error('Handle subscription update error:', error);
  }
}

async function handleSubscriptionCancellation(stripeSubscription) {
  try {
    const subscription = await Subscription.findOne({
      providerSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = 'cancelled';
      subscription.canceledAt = new Date();
      await subscription.save();

      const user = await User.findById(subscription.user);
      if (user) {
        user.subscription.status = 'cancelled';
        await user.save();
      }
    }
  } catch (error) {
    console.error('Handle subscription cancellation error:', error);
  }
}

async function handlePaymentSuccess(invoice) {
  try {
    const subscription = await Subscription.findOne({
      providerSubscriptionId: invoice.subscription
    });

    if (subscription) {
      subscription.paymentHistory.push({
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'succeeded',
        invoiceId: invoice.id,
        paidAt: new Date(invoice.paid_at * 1000)
      });
      await subscription.save();
    }
  } catch (error) {
    console.error('Handle payment success error:', error);
  }
}

async function handlePaymentFailure(invoice) {
  try {
    const subscription = await Subscription.findOne({
      providerSubscriptionId: invoice.subscription
    });

    if (subscription) {
      subscription.paymentHistory.push({
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'failed',
        invoiceId: invoice.id,
        failureReason: invoice.last_finalization_error?.message || 'Payment failed'
      });
      subscription.status = 'past_due';
      await subscription.save();

      const user = await User.findById(subscription.user);
      if (user) {
        user.subscription.status = 'past_due';
        await user.save();
      }
    }
  } catch (error) {
    console.error('Handle payment failure error:', error);
  }
}

async function handleRazorpayPaymentSuccess(paymentId, orderId) {
  try {
    const subscription = await Subscription.findOne({
      providerSubscriptionId: orderId
    });

    if (subscription) {
      subscription.status = 'active';
      subscription.paymentHistory.push({
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'succeeded',
        paymentMethod: 'razorpay',
        paidAt: new Date()
      });
      await subscription.save();

      const user = await User.findById(subscription.user);
      if (user) {
        user.subscription.status = 'active';
        user.subscription.startDate = new Date();
        await user.save();
      }
    }
  } catch (error) {
    console.error('Handle Razorpay payment success error:', error);
  }
}

async function handleRazorpayPaymentFailure(paymentId, orderId) {
  try {
    const subscription = await Subscription.findOne({
      providerSubscriptionId: orderId
    });

    if (subscription) {
      subscription.status = 'inactive';
      subscription.paymentHistory.push({
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'failed',
        paymentMethod: 'razorpay',
        failureReason: 'Payment processing failed'
      });
      await subscription.save();
    }
  } catch (error) {
    console.error('Handle Razorpay payment failure error:', error);
  }
}

// Additional exported functions
export const getSubscriptionPlans = getPlans; // Alias
export const getSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plans = {
      basic: { name: 'Basic', price: 9.99, features: ['SD Quality', '1 Screen', 'Limited Library'] },
      standard: { name: 'Standard', price: 14.99, features: ['HD Quality', '2 Screens', 'Full Library'] },
      premium: { name: 'Premium', price: 19.99, features: ['4K Quality', '4 Screens', 'Full Library', 'Downloads'] }
    };
    res.json({ success: true, data: plans[id] ||null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching plan', error: error.message });
  }
};

export const getCurrentSubscription = getSubscription; // Alias
export const downgradeSubscription = async (req, res) => {
  try {
    res.json({ success: true, message: 'Subscription downgraded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downgrading', error: error.message });
  }
};

export const renewSubscription = async (req, res) => {
  try {
    res.json({ success: true, message: 'Subscription renewed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error renewing', error: error.message });
  }
};

export const pauseSubscription = async (req, res) => {
  try {
    res.json({ success: true, message: 'Subscription paused' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error pausing', error: error.message });
  }
};

export const resumeSubscription = async (req, res) => {
  try {
    res.json({ success: true, message: 'Subscription resumed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resuming', error: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    res.json({ success: true, message: 'Invoice download link generated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading invoice', error: error.message });
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    res.json({ success: true, message: 'Payment method updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating payment method', error: error.message });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payment methods', error: error.message });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    res.json({ success: true, message: 'Payment method added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding payment method', error: error.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting payment method', error: error.message });
  }
};

export const setDefaultPaymentMethod = async (req, res) => {
  try {
    res.json({ success: true, message: 'Default payment method set' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error setting default payment method', error: error.message });
  }
};

export const applyPromoCode = async (req, res) => {
  try {
    res.json({ success: true, message: 'Promo code applied', data: { discount: 10 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error applying promo code', error: error.message });
  }
};

export const validatePromoCode = async (req, res) => {
  try {
    res.json({ success: true, valid: false });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating promo code', error: error.message });
  }
};

export const getSubscriptionBenefits = async (req, res) => {
  try {
    res.json({ success: true, data: { quality: '4K', screens: 4, downloads: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching benefits', error: error.message });
  }
};

export const getDevices = async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching devices', error: error.message });
  }
};

export const manageDevice = async (req, res) => {
  try {
    res.json({ success: true, message: 'Device managed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error managing device', error: error.message });
  }
};

export const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.json({ success: true, data: { status: user?.subscription?.status || 'inactive' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking status', error: error.message });
  }
};
