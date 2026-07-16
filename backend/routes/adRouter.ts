import express from "express";
import { protect } from "../controllers/auth.js";
import { getAdsAroundLocation } from "../controllers/ads.js";

const router = express.Router();

// Get all the ads for a particular location
router.get("/:locationId", protect, getAdsAroundLocation);

export default router;