require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: 'admin@campus.edu' });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      await mongoose.disconnect();
      process.exit(0);
    }
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
    });
    console.log('Admin created successfully');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123');
    console.log('Change password after first login!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
