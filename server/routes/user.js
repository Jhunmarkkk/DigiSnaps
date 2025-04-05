import express from "express";
import {
  register,
  login,
  getMyProfile,
  logOut,
  updateProfile,
  changePassword,
  updatePicture,
  forgetPassword,
  resetPassword,
  registerPushToken,
  unregisterPushToken,
  cleanupStaleTokens,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);

router.route("/login").post(login);

router.route("/me").get(isAuthenticated, getMyProfile);

router.route("/logout").get(logOut);

// Push notification token management
router.route("/push-token")
  .post(isAuthenticated, registerPushToken)
  .delete(isAuthenticated, unregisterPushToken);

// Admin route to clean up stale tokens
router.route("/cleanup-tokens").get(isAuthenticated, cleanupStaleTokens);

// Update Routes
router
  .route("/updateprofile")
  .put(isAuthenticated, updateProfile);

router.route("/updatepassword").put(isAuthenticated, changePassword);

router.route("/updatepic").put(isAuthenticated, singleUpload, updatePicture);

//Forget Password & Reset Password

router.route("/forgetpassword").post(forgetPassword).put(resetPassword);

export default router;