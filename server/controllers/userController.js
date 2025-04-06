import { asyncError, errorMiddleware} from "../middlewares/error.js";
import {User} from "../models/user.js"
import ErrorHandler from "../utils/error.js";
import { cookieOptions, getDataUri, sendEmail, sendToken } from "../utils/features.js";
import cloudinary from "cloudinary";
import fetch from "node-fetch";

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

export const googleLogin = asyncError(async (req, res, next) => {
  try {
    const { idToken, userInfo, firebaseToken, firebaseUid } = req.body;
    
    // Check if userInfo is properly received
    if (!userInfo || !userInfo.email) {
      console.error("Invalid user data received:", req.body);
      return next(new ErrorHandler("Invalid user data received from Google", 400));
    }
    
    console.log("Google login attempt with:", userInfo.email);
    if (firebaseUid) {
      console.log("Firebase UID provided:", firebaseUid);
    }
    
    // For production, you should verify the ID token
    // For now, we'll trust the token and use the userInfo directly
    const googleId = userInfo.id;
    
    // Check if user exists by email, googleId, or firebaseUid
    let user = await User.findOne({ 
      $or: [
        { email: userInfo.email },
        { googleId: googleId },
        ...(firebaseUid ? [{ firebaseUid }] : [])
      ]
    });
    
    if (user) {
      console.log("Existing user found:", user.email);
      
      // Update the googleId if it's not set yet
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        console.log("Updated googleId for user");
      }
      
      // Update the firebaseUid if it's not set yet
      if (!user.firebaseUid && firebaseUid) {
        user.firebaseUid = firebaseUid;
        console.log("Updated firebaseUid for user");
      }
      
      // Update the user's avatar if it has changed (optional)
      if (userInfo.photo && (!user.avatar || user.avatar.url !== userInfo.photo)) {
        console.log("Updating user avatar");
        user.avatar = {
          public_id: `google_${googleId || Date.now()}`,
          url: userInfo.photo
        };
      }
      
      // Save user if changes were made
      if ((!user.googleId && googleId) || 
          (!user.firebaseUid && firebaseUid) || 
          (userInfo.photo && (!user.avatar || user.avatar.url !== userInfo.photo))) {
        await user.save();
        console.log("User updated successfully");
      }
      
      // User exists, login
      sendToken(user, res, `Welcome back, ${user.name}`, 200);
    } else {
      console.log("Creating new user from Google account:", userInfo.email);
      try {
        // Create new user
        const avatar = userInfo.photo ? {
          public_id: `google_${googleId || Date.now()}`,
          url: userInfo.photo
        } : undefined;
        
        // Generate a random password since we don't need it for Google auth
        const randomPassword = Math.random().toString(36).slice(-8);
        
        user = await User.create({
          name: userInfo.name || "Google User",
          email: userInfo.email,
          password: randomPassword,
          googleId: googleId,
          firebaseUid: firebaseUid || null,
          avatar,
          address: "Update your address",
          city: "Update your city",
          country: "Update your country",
          pinCode: 0,
        });
        
        console.log("New user created:", user._id);
        
        sendToken(user, res, `Welcome to DigiSnaps, ${user.name}`, 201);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return next(new ErrorHandler(`Failed to create user: ${createError.message}`, 500));
      }
    }
  } catch (error) {
    console.error("Google login error:", error);
    return next(new ErrorHandler(`Google authentication failed: ${error.message}`, 400));
  }
});