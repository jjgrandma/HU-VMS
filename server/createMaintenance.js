/**
 * Creates the Maintenance Officer user if it doesn't already exist.
 * Run once:  node createMaintenance.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ username: 'maintenance' });
  if (existing) {
    // Make sure the account is active and fix the password
    existing.isActive = true;
    existing.password = await bcrypt.hash('password123', 12);
    existing.mustChangePassword = false;
    await existing.save();
    console.log('✅ Maintenance Officer already existed — password reset to "password123" and account activated.');
  } else {
    const hashed = await bcrypt.hash('password123', 12);
    await User.create({
      name:       'Maintenance Officer',
      username:   'maintenance',
      email:      'maintenance@haramaya.edu.et',
      password:   hashed,
      role:       'MAINTENANCE_OFFICER',
      department: 'Maintenance',
      employeeId: 'HU-MO-001',
      isActive:   true,
    });
    console.log('✅ Maintenance Officer created successfully.');
  }

  console.log('\nLogin credentials:');
  console.log('  Username : maintenance');
  console.log('  Password : password123');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
