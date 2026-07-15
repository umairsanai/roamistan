import express from "express";
import { bookmarkLocation, deleteBookmarkLocation, getBookmarkedLocations, getMe, upload, uploadProfilePicture } from "../controllers/users.js";
import { protect } from "../controllers/auth.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/bookmarks", protect, getBookmarkedLocations);
router.post("/bookmark/:locationId", protect, bookmarkLocation);
router.delete("/bookmark/:locationId", protect, deleteBookmarkLocation);
router.post("/profile-picture", protect, upload.single('profile_picture'), uploadProfilePicture);

export default router;


