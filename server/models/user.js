import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Schema for push notification tokens
const pushTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  deviceInfo: {
    type: String,
    default: 'Unknown device'
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },

  email: {
    type: String,
    required: [true, "Please Enter Email"],
    unique: [true, "Email Already Exist"],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please Enter Password"],
    minLength: [6, "Password must be at least 6 characters long"],
    select: false,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  avatar: {
    public_id: String,
    url: String,
  },
  otp: Number,
  otp_expire: Date,
  
  // Array of push notification tokens
  pushTokens: [pushTokenSchema],
  
  // Track last login time
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Add createdAt and updatedAt timestamps
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

schema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

// Methods for push notification token management
schema.methods.addPushToken = function(token, deviceInfo) {
  // Check if token already exists
  const tokenExists = this.pushTokens.find(t => t.token === token);
  
  if (tokenExists) {
    // Update existing token's last used time and device info
    tokenExists.lastUsed = Date.now();
    tokenExists.deviceInfo = deviceInfo || tokenExists.deviceInfo;
  } else {
    // Add new token
    this.pushTokens.push({
      token,
      deviceInfo: deviceInfo || 'Unknown device',
      lastUsed: Date.now()
    });
  }
  
  return this.save();
};

schema.methods.removePushToken = function(token) {
  this.pushTokens = this.pushTokens.filter(t => t.token !== token);
  return this.save();
};

schema.methods.removeStaleTokens = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  this.pushTokens = this.pushTokens.filter(token => 
    token.lastUsed >= cutoffDate
  );
  
  return this.save();
};

export const User = mongoose.model("User", schema);
