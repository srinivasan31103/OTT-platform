import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/streamverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected');

    // Check if demo user exists
    const existingUser = await User.findOne({ email: 'demo@streamverse.com' });

    if (existingUser) {
      console.log('✅ Demo user already exists');
      process.exit(0);
    }

    // Create demo user
    const demoUser = new User({
      email: 'demo@streamverse.com',
      password: 'demo123', // Will be hashed by the User model
      name: 'Demo User',
      phoneNumber: '+1234567890',
      isEmailVerified: true,
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        autoRenew: true
      },
      region: 'US'
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully');
    console.log('Email: demo@streamverse.com');
    console.log('Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo user:', error);
    process.exit(1);
  }
};

seedDemoUser();
