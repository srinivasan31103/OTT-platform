import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const resetDemoPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/streamverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@streamverse.com' });

    if (!demoUser) {
      console.log('❌ Demo user not found');
      process.exit(1);
    }

    // Update password - the pre-save hook will hash it
    demoUser.password = 'demo123';
    demoUser.isEmailVerified = true;
    await demoUser.save();

    console.log('✅ Demo user password reset to: demo123');
    console.log('Email: demo@streamverse.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting demo password:', error);
    process.exit(1);
  }
};

resetDemoPassword();
