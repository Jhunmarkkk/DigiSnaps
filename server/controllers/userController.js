import { asyncError, errorMiddleware} from "../middlewares/error.js";
import {User} from "../models/user.js"
import ErrorHandler from "../utils/error.js";
import { cookieOptions, getDataUri, sendEmail, sendToken } from "../utils/features.js";
import cloudinary from "cloudinary";

export const login = asyncError(async  (req,res,next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");


    if (!user) {
      return next(new ErrorHandler("Incorrect Email or Password", 400));
   }

    if (!password) return next(new ErrorHandler("Please Enter The Password", 400));

    //Handle error
    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return next(new ErrorHandler("Incorrect Email or Password", 400));
    }

    sendToken(user,res,`Welcome back, ${user.name}`, 200 );
});

export const register = asyncError(async (req,res,next) => {
    const { name, email, password, address, city, country, pinCode } = req.body;

   let user = await User.findOne({ email });
   
   if (user) return next(new ErrorHandler("User Already Exist", 400));

    let avatar=undefined;
    
    if(req.file){
         const file= getDataUri(req.file);  
         const myCloud = await cloudinary.v2.uploader.upload(file.content);
        avatar = {
          public_id:myCloud.public_id,
          url:myCloud.secure_url
        }
    }
        user = await User.create({
        avatar,
        name,
        email,
        password,
        address,
        city,
        country,
        pinCode,
      });

      sendToken(user,res,`Registered successfully`, 201 );


});

export const logOut = asyncError(async (req,res,next)=>{ 


  res.status(200).cookie("token", "",{
    ...cookieOptions,
    expires: new Date(Date.now()),
  }).json({
    
    success: true, 
    message:"Logout Successfully",
  });

});

export const getMyProfile = asyncError(async (req,res,next)=>{ 
  const user = await User.findById(req.user._id);


  res.status(200).json({
    success: true, user, 
  });

});

export const updateProfile = asyncError(async (req,res,next)=>{ 
  const user = await User.findById(req.user._id);

  const {name, email, address, city, country, pinCode} = req.body

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;

  await user.save();

  res.status(200).json({
    success: true, user, 
    message:"Profile Update Succesfully",
  });

});

export const changePassword = asyncError(async (req,res,next)=>{ 
  const user = await User.findById(req.user._id).select("+password");

  const {oldPassword, newPassword} = req.body;

  if (!oldPassword || !newPassword) return next(new ErrorHandler("Please Enter The Old Password & New Password", 400));

  const isMatched = await user.comparePassword(oldPassword);

  if(!isMatched) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password= newPassword;
  await user.save();

  res.status(200).json({
    success: true, user, 
    message:"Password Changed Successfully"
  });

});


export const updatePicture = asyncError(async (req,res,next)=>{ 
  const user = await User.findById(req.user._id);

    const file= getDataUri(req.file);  

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    user.avatar = {
     public_id: myCloud.public_id,
     url: myCloud.secure_url
   };

   await user.save();

  res.status(200).json({
    success: true, 
    message:"Avatar Updated Succesfully", 
  });

});

export const forgetPassword = asyncError(async (req,res,next)=>{ 
  const {email} = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("Incorrect Email", 404));
//max,min 2000,10000
  const randomNumber= Math.random()* (999999-100000)+100000;
  const otp = Math.floor(randomNumber);
  const otp_expire = 15 * 60 * 1000;

  user.otp=otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();


  const message = `Your OTP for Resetting Password is ${otp}.\n Please ignore if you haven't requested this.` ;
  try{
    await sendEmail("OTP For Resetting Password",user.email,message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }
  //sendEmail()

  res.status(200).json({
    success: true, 
    message:`Email Sent To ${user.email}`,
  });
});

export const resetPassword = asyncError(async (req,res,next)=>{
  
  const {otp,password} = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt:Date.now(),
    },
  });
   

  if (!user)
    return next(new ErrorHandler("Incorret OTP or has been expired", 400));

  if (!password) 
    return next(new ErrorHandler("Please Enter New Password", 400));

    user.password = password;
    user.otp = undefined;
    user.otp_expire = undefined;

    await user.save();

  res.status(200).json({
    success: true,
    message:"Password Change Successfully, You can login now", 
  });
});

// Register push notification token
export const registerPushToken = asyncError(async (req, res, next) => {
  const { token, deviceInfo } = req.body;
  
  if (!token) {
    return next(new ErrorHandler("Push notification token is required", 400));
  }
  
  // Add or update push token
  await req.user.addPushToken(token, deviceInfo);
  
  // Also update last login time
  req.user.lastLogin = Date.now();
  await req.user.save();
  
  // Remove stale tokens (not used for 30 days)
  await req.user.removeStaleTokens(30);
  
  res.status(200).json({
    success: true,
    message: "Push notification token registered successfully"
  });
});

// Unregister push notification token
export const unregisterPushToken = asyncError(async (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    return next(new ErrorHandler("Push notification token is required", 400));
  }
  
  await req.user.removePushToken(token);
  
  res.status(200).json({
    success: true,
    message: "Push notification token unregistered successfully"
  });
});

// Admin: Remove stale push tokens for all users
export const cleanupStaleTokens = asyncError(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only admins can perform this action", 403));
  }
  
  // Get days parameter, default to 30 days
  const days = parseInt(req.query.days) || 30;
  
  // Find all users
  const users = await User.find({});
  
  // Count of removed tokens
  let removedTokens = 0;
  let affectedUsers = 0;
  
  // For each user, remove stale tokens
  for (const user of users) {
    const tokensBefore = user.pushTokens.length;
    await user.removeStaleTokens(days);
    const tokensAfter = user.pushTokens.length;
    
    // If tokens were removed, increment counters
    if (tokensBefore > tokensAfter) {
      removedTokens += (tokensBefore - tokensAfter);
      affectedUsers++;
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Removed ${removedTokens} stale tokens from ${affectedUsers} users`,
    data: {
      removedTokens,
      affectedUsers
    }
  });
});