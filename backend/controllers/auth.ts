import { Request, Response, NextFunction, CookieOptions } from "express";
import { AppError, handleAsyncError } from "../error.js";
import pool from "../database.js";
import argon from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { LoginRequestBody, SignupRequestBody } from "../types.js";
import Validator from "validator";
import { sendEmptySuccessResponse } from "./helpers.js";

const signJwtToken = (email: string) => {
    return jwt.sign({ email }, process.env.JWT_SIGN_SECRET as string, {
        expiresIn: "7 days"
    });
}

const signTokenAndSetInCookie = (email: string, res: Response, cookie_name: string) => {
    res.cookie(cookie_name, signJwtToken(email), {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
        secure: process.env.MODE === "prod"
    });
}

const hashPassword = async (password: string) => {
    try {
        return (await argon.hash(password, {
            hashLength: 32,
            type: argon.argon2id,
            secret: Buffer.from(process.env.PASSWORD_HASH_SECRET as string)
        }));
    } catch(err) {
        throw new AppError("Error in hashing passwrod", 500);
    }
}

const verifyPassword = async (actual_password: string, input_password: string) => {
    return await argon.verify(actual_password, input_password, {
        secret: Buffer.from(process.env.PASSWORD_HASH_SECRET as string)
    });
}

export const protect = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies["roamistan-login-token"];

    if (!token) 
        return next(new AppError("You're not logged in!", 401));

    let payload: JwtPayload;

    try {
        payload = jwt.verify(token, process.env.JWT_SIGN_SECRET as string) as JwtPayload;
    } catch (error) {
        return next(new AppError("Your login session token has been malformed. Please login again.", 400));
    }

    const user = (await pool.query("SELECT user_id, name, email, city, country, password_changed_at, created_at::TEXT, tours_completed, profile_url FROM users WHERE email=$1", [payload.email])).rows[0];
    
    if (!user)
        return next(new AppError("This user doesn't exist", 404));
    
    if (payload.iat && payload.iat*1000 <= user.password_changed_at)
        return next(new AppError("You have changed your password. Please log in again!", 401));
    
    delete user.password_changed_at;
    req.user = user;
    next();
});


export const signup = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    let {name,  email, city, country, password} = req.body as SignupRequestBody;

    if (!name || !name.trim().length || !email || !city || !country || !password) 
        return next(new AppError("Incomplete Data for Signup!", 400));

    if (!Validator.isEmail(email)) 
        return next(new AppError("Please provide a Valid Email!", 400));

    password = await hashPassword(password);

    await pool.query("INSERT INTO users (name, email, city, country, password) VALUES ($1, $2, $3, $4, $5)", [name.trim(), email.trim(), city.trim(), country.trim(), password]);

    signTokenAndSetInCookie(email, res, "roamistan-login-token");

    sendEmptySuccessResponse(res, 201);
});

export const login = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginRequestBody;

    if (!email || !password) 
        return next(new AppError("Please provide complete credentials", 400));

    const user = (await pool.query("SELECT email, password FROM users WHERE email=$1", [email])).rows[0];

    if (!user || !await verifyPassword(user.password, password))
        return next(new AppError("Incorrect credentials!", 401));

    signTokenAndSetInCookie(user.email, res, "roamistan-login-token");
    sendEmptySuccessResponse(res);
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL!}/auth/google/verify`
    },
    function(accessToken, refreshToken, profile, callback) {
        return callback(null, {
            user_id: -1,
            name: "",
            email: "",
            city: "",
            country: "",
            profile_url: "",
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            googleProfile: profile
        });
    }
));

export const authenticateUserAfterOAuth = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.googleProfile.emails[0].value;
    const user = (await pool.query("SELECT email FROM users WHERE email=$1", [email])).rows[0];

    if (!user) 
        return next(new AppError("You don't have any account with this email!", 404));

    signTokenAndSetInCookie(user.email, res, "roamistan-login-token");
    signTokenAndSetInCookie(req.user?.googleAccessToken!, res, "roamistan-google-access-token");
    signTokenAndSetInCookie(req.user?.googleRefreshToken!, res, "roamistan-google-refresh-token");

    res.redirect(`${process.env.FRONTEND_URL}/dashboard.html`);
});



export const logout = (req: Request, res: Response, next: NextFunction) => {
    const cookieOptions: CookieOptions = {
        sameSite: "none",
        path: "/",
        secure: process.env.MODE === "prod"
    };

    res.clearCookie("roamistan-login-token", cookieOptions);
    res.clearCookie("roamistan-google-access-token", cookieOptions);
    res.clearCookie("roamistan-google-refresh-token", cookieOptions);
    sendEmptySuccessResponse(res);
};