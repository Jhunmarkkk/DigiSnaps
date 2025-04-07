import express from "express";
import {config} from "dotenv"; 
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
    path:"./data/config.env",
});

export const app = express();

//using middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      origin: [
        "http://192.168.43.161:19000", 
        "http://192.168.43.161:19001", 
        "http://192.168.43.161:19002", 
        "exp://192.168.43.161:19000",
        "http://localhost:19000", 
        "http://localhost:19001", 
        "http://localhost:19002",
        "http://10.0.2.2:19000",
        "http://10.0.2.2:19001",
        "exp://10.0.2.2:19000",
        "*"  // Allow all origins for testing
      ],
    })
  );

app.get("/", (req, res, next) => {
    res.send("working");
})

// Importing routers Here
import user from "./routes/user.js";
import product from "./routes/product.js";
import order from "./routes/order.js";
import review from "./routes/review.js";
app.use("/api/v1/user",user);
app.use("/api/v1/product",product);
app.use("/api/v1/order",order);
app.use("/api/v1/review",review);

app.use(errorMiddleware)
