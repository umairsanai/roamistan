import express from "express";
import passport from "passport";
import { authenticateUserAfterOAuth, forgotPassword, login, logout, protect, resetPassword, signup } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/google/login", passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false 
}));

router.get("/google/verify", passport.authenticate('google', { 
    failureRedirect: '/dashboard.html', 
    session: false 
}), authenticateUserAfterOAuth);

// authRouter
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password", resetPassword);

export default router;