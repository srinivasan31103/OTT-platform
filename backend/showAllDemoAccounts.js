import mongoose from 'mongoose';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Movie from './models/Movie.js';
import Series from './models/Series.js';
import LiveChannel from './models/LiveChannel.js';
import dotenv from 'dotenv';

dotenv.config();

const showAllDemoAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/streamverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected\n');

    // Find all users
    const allUsers = await User.find({});

    console.log('='.repeat(80));
    console.log(`ALL USERS IN DATABASE (${allUsers.length})`);
    console.log('='.repeat(80));

    for (const user of allUsers) {
      console.log(`\n📧 EMAIL: ${user.email}`);
      console.log(`   User ID:          ${user._id}`);
      console.log(`   Name:             ${user.name}`);
      console.log(`   Role:             ${user.role || 'user'}`);
      console.log(`   Email Verified:   ${user.isEmailVerified}`);
      console.log(`   Phone:            ${user.phoneNumber || 'N/A'}`);
      console.log(`   Region:           ${user.region}`);
      console.log(`   Max Profiles:     ${user.maxProfiles}`);
      console.log(`   Created:          ${user.createdAt}`);

      if (user.subscription) {
        console.log(`   Subscription:`);
        console.log(`     - Plan:         ${user.subscription.plan || 'N/A'}`);
        console.log(`     - Status:       ${user.subscription.status}`);
        console.log(`     - End Date:     ${user.subscription.endDate || 'N/A'}`);
      }

      // Find profiles for this user
      const profiles = await Profile.find({ user: user._id });
      if (profiles.length > 0) {
        console.log(`   Profiles (${profiles.length}):`);
        profiles.forEach((profile, idx) => {
          console.log(`     ${idx + 1}. ${profile.name} (${profile.type}) - ID: ${profile._id}`);
        });
      } else {
        console.log(`   Profiles: None`);
      }
      console.log(`   ${'─'.repeat(76)}`);
    }

    // Get content counts
    const movieCount = await Movie.countDocuments();
    const seriesCount = await Series.countDocuments();
    const liveChannelCount = await LiveChannel.countDocuments();

    console.log('\n' + '='.repeat(80));
    console.log('CONTENT STATISTICS');
    console.log('='.repeat(80));
    console.log(`Movies:        ${movieCount}`);
    console.log(`Series:        ${seriesCount}`);
    console.log(`Live Channels: ${liveChannelCount}`);

    // Create demo accounts reference
    console.log('\n' + '='.repeat(80));
    console.log('QUICK REFERENCE - DEMO ACCOUNTS');
    console.log('='.repeat(80));

    const demoUser = allUsers.find(u => u.email === 'demo@streamverse.com');
    if (demoUser) {
      console.log('\n🎬 REGULAR DEMO USER:');
      console.log(`   Email:    demo@streamverse.com`);
      console.log(`   Password: demo123`);
      console.log(`   User ID:  ${demoUser._id}`);
    }

    const adminUser = allUsers.find(u => u.role === 'admin' || u.email.includes('admin'));
    if (adminUser) {
      console.log('\n👑 ADMIN USER:');
      console.log(`   Email:    ${adminUser.email}`);
      console.log(`   Password: (check your records)`);
      console.log(`   User ID:  ${adminUser._id}`);
      console.log(`   Role:     ${adminUser.role}`);
    } else {
      console.log('\n⚠️  NO ADMIN USER FOUND - Need to create one!');
    }

    // Export IDs for easy copying
    console.log('\n' + '='.repeat(80));
    console.log('EXPORT ALL IDs (for scripts/testing)');
    console.log('='.repeat(80));

    allUsers.forEach((user, idx) => {
      const safeName = user.email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '_');
      console.log(`${safeName}_USER_ID="${user._id}"`);
    });

    console.log('\n' + '='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

showAllDemoAccounts();
