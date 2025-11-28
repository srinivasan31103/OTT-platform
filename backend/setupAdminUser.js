import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const setupAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/streamverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected\n');

    // Find admin user
    let adminUser = await User.findOne({ email: 'admin@streamverse.com' });

    if (!adminUser) {
      console.log('Creating new admin user...');
      // Create admin user
      adminUser = new User({
        email: 'admin@streamverse.com',
        password: 'admin123',
        name: 'Admin User',
        isAdmin: true, // ADMIN FLAG
        isEmailVerified: true,
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          autoRenew: true
        },
        region: 'US'
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('Admin user found, updating admin flag...');
      // Update existing admin user
      adminUser.isAdmin = true;
      adminUser.isEmailVerified = true;
      await adminUser.save();
      console.log('✅ Admin flag updated');
    }

    console.log('\n' + '='.repeat(60));
    console.log('ADMIN USER SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`Email:    admin@streamverse.com`);
    console.log(`Password: admin123`);
    console.log(`User ID:  ${adminUser._id}`);
    console.log(`Is Admin: ${adminUser.isAdmin}`);
    console.log('='.repeat(60));

    console.log('\n✅ Admin user is ready!');
    console.log('   You can now login at the frontend with:');
    console.log('   - Email: admin@streamverse.com');
    console.log('   - Password: admin123');
    console.log('   - Access admin panel at: /admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setupAdminUser();
