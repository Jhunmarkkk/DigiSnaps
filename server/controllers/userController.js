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

export const googleLogin = asyncError(async (req, res, next) => {
  try {
    // Log the complete request body for debugging
    console.log("Google login request received with body:", JSON.stringify(req.body));
    
    // Extract fields from request with fallbacks for everything
    const email = req.body.email;
    const name = req.body.name || (email ? email.split('@')[0] : 'Google User');
    const googleId = req.body.googleId || req.body.id || `google_${Date.now()}`;
    const avatarUrl = req.body.avatar || req.body.photo || '';
    
    console.log(`Processing Google login for: ${email}, name: ${name}, ID: ${googleId}`);
    
    // Validate email at minimum
    if (!email) {
      console.log("Google login failed: No email provided");
      return next(new ErrorHandler("Email is required for Google login", 400));
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    console.log("User exists in database:", !!user);
    
    if (user) {
      // User exists, update Google ID if not already set
      if (googleId && !user.googleId) {
        console.log(`Updating existing user with Google ID: ${googleId}`);
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // For new users, we need to create with default values for required fields
      console.log(`Creating new user for: ${email}`);
      const newUser = {
        name: name,
        email: email,
        googleId: googleId,
        password: Math.random().toString(36).slice(-8) + Date.now().toString(36),
        // Default values for required fields
        address: "Default Address",
        city: "Default City",
        country: "Default Country",
        pinCode: 123456
      };
      
      // Add avatar if provided
      if (avatarUrl) {
        newUser.avatar = { url: avatarUrl };
      }
      
      console.log("Creating user with data:", JSON.stringify(newUser));
      user = await User.create(newUser);
      console.log(`New user created with ID: ${user._id}`);
    }
    
    // Send token response
    console.log(`Sending token for user: ${user.email}`);
    sendToken(user, res, `Welcome, ${user.name}`, 200);
  } catch (error) {
    console.error("Google login error:", error);
    return next(new ErrorHandler("Google login failed: " + (error.message || "Unknown error"), 500));
  }
});