import express from "express";
import { protect } from "../controllers/auth.js";
import { getLocation, getLocationsAround, getSearchedLocations, getTourImageOfLocation, getTrendingLocations } from "../controllers/locations.js";

const router = express.Router();

router.post("/search", protect, getSearchedLocations);
router.get("/trending", protect, getTrendingLocations);
router.get("/around", protect, getLocationsAround);
router.get("/tour-image/:imageId", protect, getTourImageOfLocation);
router.get("/:locationId", protect, getLocation);

export default router;