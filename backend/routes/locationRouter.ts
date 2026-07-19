import express from "express";
import { protect } from "../controllers/auth.js";
import { getLocation, getLocationsAround, getSearchedLocations, getTourImageOfLocation, getTrendingLocations } from "../controllers/locations.js";

const router = express.Router();

router.use(protect);

router.post("/search", getSearchedLocations);
router.get("/trending", getTrendingLocations);
router.get("/around", getLocationsAround);
router.get("/tour-image/:imageId", getTourImageOfLocation);
router.get("/:locationId", getLocation);

export default router;