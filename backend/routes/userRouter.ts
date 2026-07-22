import express from "express";
import { bookmarkLocation, deleteBookmarkLocation, editProfile, getBookmarkedLocations, getMe, upload, uploadProfilePicture } from "../controllers/users.js";
import { protect } from "../controllers/auth.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMe);
router.patch("/edit",  editProfile);
router.get("/bookmarks", getBookmarkedLocations);
router.post("/bookmark/:locationId", bookmarkLocation);
router.delete("/bookmark/:locationId", deleteBookmarkLocation);
router.post("/profile-picture", upload.single('profile_picture'), uploadProfilePicture);

export default router;


