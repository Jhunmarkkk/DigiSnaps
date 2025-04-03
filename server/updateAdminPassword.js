import mongoose from 'mongoose';
import { User } from './models/user.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from proper location
dotenv.config({ path: path.join(__dirname, 'data', 'config.env') });

async function updateAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const admin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found. Creating...');
      
      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        address: 'Admin Office',
        city: 'Admin City',
        country: 'Admin Country',
        pinCode: 123456,
        role: 'admin'
      });
      
      console.log('Admin user created successfully with email: admin@gmail.com and password: 123456');
    } else {
      console.log('Admin user found. Updating password...');
      
      // Update password directly
      const hashedPassword = await bcrypt.hash('123456', 10);
      admin.password = hashedPassword;
      admin.role = 'admin'; // Ensure role is admin
      
      await admin.save();
      
      console.log('Admin password updated successfully to: 123456');
    }
    
    // Verify the admin can be authenticated
    const verifyAdmin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    const plainPassword = '123456';
    
    if (verifyAdmin) {
      const isPasswordValid = await bcrypt.compare(plainPassword, verifyAdmin.password);
      console.log('Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('\nAdmin account ready:');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    process.exit(0);
  }
}

updateAdminPassword(); 