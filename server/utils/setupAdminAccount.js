import mongoose from 'mongoose';
import { User } from '../models/user.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Function to ensure the admin account exists
export const setupAdminAccount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin account exists
    const adminEmail = 'admin@gmail.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // Check if user already has admin role
      if (adminUser.role === 'admin') {
        console.log('Admin account already exists with admin role');
      } else {
        // Update role to admin
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('Existing account updated with admin role');
      }
    } else {
      // Create admin account
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        address: 'Admin Office',
        city: 'Admin City',
        country: 'Admin Country',
        pinCode: 123456,
        role: 'admin'
      });
      
      console.log('Admin account created successfully');
    }
    
    console.log('Admin account details:');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error setting up admin account:', error);
    process.exit(1);
  }
};

// Run this function if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupAdminAccount().then(() => {
    process.exit(0);
  });
} 