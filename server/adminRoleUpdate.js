import mongoose from 'mongoose';
import { User } from './models/user.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from proper location
dotenv.config({ path: path.join(__dirname, 'data', 'config.env') });

async function updateAdminRole() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "DigiSnaps"
    });
    
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('Admin user not found!');
      return;
    }
    
    console.log('Found user:', admin.name);
    console.log('Current role:', admin.role);
    
    // Update the role to admin
    admin.role = 'admin';
    await admin.save();
    
    console.log('Admin role updated successfully!');
    console.log('User:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('Error updating admin role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

updateAdminRole(); 