import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import cloudinary from "cloudinary";

connectDB();

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server listening on port: ${process.env.PORT}, in ${process.env.NODE_ENV} MODE.`);
    console.log(`Server URL: http:// 192.168.43.161:${process.env.PORT}`);
});
; 