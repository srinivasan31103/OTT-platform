import mongoose from 'mongoose';
import User from './models/User.js';
import Profile from './models/Profile.js';
import dotenv from 'dotenv';

dotenv.config();

const showDemoIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/streamverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected\n');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@streamverse.com' });

    if (!demoUser) {
      console.log('❌ Demo user not found');
      process.exit(1);
    }

    console.log('='.repeat(60));
    console.log('DEMO USER INFORMATION');
    console.log('='.repeat(60));
    console.log(`User ID:          ${demoUser._id}`);
    console.log(`Email:            ${demoUser.email}`);
    console.log(`Name:             ${demoUser.name}`);
    console.log(`Phone:            ${demoUser.phoneNumber}`);
    console.log(`Email Verified:   ${demoUser.isEmailVerified}`);
    console.log(`Created:          ${demoUser.createdAt}`);
    console.log(`Region:           ${demoUser.region}`);
    console.log(`Max Profiles:     ${demoUser.maxProfiles}`);
    console.log('');
    console.log('SUBSCRIPTION:');
    console.log(`  Plan:           ${demoUser.subscription?.plan}`);
    console.log(`  Status:         ${demoUser.subscription?.status}`);
    console.log(`  Start Date:     ${demoUser.subscription?.startDate}`);
    console.log(`  End Date:       ${demoUser.subscription?.endDate}`);
    console.log(`  Auto Renew:     ${demoUser.subscription?.autoRenew}`);
    console.log('');

    // Find all profiles for demo user
    const profiles = await Profile.find({ user: demoUser._id });

    console.log('='.repeat(60));
    console.log(`PROFILES (${profiles.length})`);
    console.log('='.repeat(60));

    if (profiles.length === 0) {
      console.log('No profiles found for demo user');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`\nProfile ${index + 1}:`);
        console.log(`  ID:             ${profile._id}`);
        console.log(`  Name:           ${profile.name}`);
        console.log(`  Type:           ${profile.type}`);
        console.log(`  Avatar:         ${profile.avatar}`);
        console.log(`  Maturity:       ${profile.maturityLevel}`);
        console.log(`  PIN Protected:  ${profile.hasPinProtection}`);
        console.log(`  Active:         ${profile.isActive}`);
        console.log(`  Created:        ${profile.createdAt}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('QUICK COPY IDs:');
    console.log('='.repeat(60));
    console.log(`USER_ID="${demoUser._id}"`);
    if (profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`PROFILE_${index + 1}_ID="${profile._id}"`);
      });
    }
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

showDemoIds();
