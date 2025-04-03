import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncError } from "./error.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
    try {
        // Check for token in cookies
        let token = req.cookies?.token;
        
        // If not in cookies, check for token in Authorization header
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token extracted from Authorization header");
        }
        
        if (!token) {
            console.log("No authentication token found");
            return next(new ErrorHandler("Not Logged In", 401));
        }
        
        console.log("Verifying token...");
        let decodeData;
        
        try {
            decodeData = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error("JWT verification failed:", jwtError.message);
            return next(new ErrorHandler("Invalid token", 401));
        }
        
        console.log("Token verified, finding user with ID:", decodeData._id);
        const user = await User.findById(decodeData._id);
        
        if (!user) {
            console.log("User not found for ID:", decodeData._id);
            return next(new ErrorHandler("User not found", 401));
        }
        
        console.log("User authenticated:", user.email);
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return next(new ErrorHandler("Authentication failed", 500));
    }
});

export const isAdmin = asyncError(async (req, res, next) => {
    if (req.user.role !== "admin") {
        console.log("Access denied: User role is not admin:", req.user.role);
        return next(new ErrorHandler("Only Admin allowed", 401));
    }
    console.log("Admin access granted for:", req.user.email);
    next();
});