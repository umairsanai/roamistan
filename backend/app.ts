import express from "express";
import morgan from "morgan";
import cors from "cors";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import hpp from "hpp-clean";
import helmet from "helmet";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import locationRouter from "./routes/locationRouter.js";
import adRouter from "./routes/adRouter.js";
import { errorMiddleware } from "./error.js";
import { unhandledRequestHandler } from "./controllers/helpers.js";

const app = express();

// LOGGING
app.use(morgan("tiny"));

// RATE LIMITING
app.use(rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 60,
    message: {
        status: "fail",
        statusCode: 429,
        message: "Too many requests, please try again later."
    }
}));

// CORS
app.use(cors({origin: ["http://127.0.0.1:4173", "http://localhost:4173", "http://127.0.0.1:5173", "http://localhost:5173"], credentials: true}));

// BODY PARSING
app.set('query parser', 'extended');
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit:'10kb'}));

// SECURITY
app.use([xss(), helmet(), hpp({ whitelist: [] })]);


// ROUTERS
app.use("/api/v1/listings", adRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/locations", locationRouter);
app.use(unhandledRequestHandler);
app.use(errorMiddleware);

export default app;