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

async function createAdminAccount() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Admin details
    const adminData = {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: '123456',
      address: 'Admin Office',
      city: 'Admin City',
      country: 'Admin Country',
      pinCode: 123456,
      role: 'admin'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating role to admin...');
      
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      
      console.log('Admin user role updated successfully');
      console.log('Admin details:');
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password} (not showing actual hash)`);
    } else {
      console.log('Creating new admin user...');
      
      // Hash password manually
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Create user with hashed password
      const newAdmin = await User.create({
        ...adminData,
        password: hashedPassword
      });
      
      console.log('Admin user created successfully');
      console.log('Admin details:');
      console.log(`Name: ${newAdmin.name}`);
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password} (not showing actual hash)`);
    }
    
    console.log('\nLogin with:');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    process.exit(0);
  }
}

createAdminAccount(); 