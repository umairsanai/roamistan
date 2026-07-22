import multer from 'multer';
import { Readable } from "stream";
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import pool from "../database.js";
import { AppError, handleAsyncError } from "../error.js";
import { isInteger, isString, sendEmptySuccessResponse } from './helpers.js';
import Validator from "validator"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024           // 2 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new AppError('Only image files are allowed!'));
        }
    }
});

export const uploadToCloudinary = (buffer: Buffer, userId: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "roamistan-user-profiles",
                public_id: `profile-${userId}`,
                transformation: [
                    { width: 300, height: 300, crop: 'fill', gravity: 'face' }
                ],
                overwrite: true,
                resource_type: 'image'
            },
            (error, result) => {
                error ? reject(error) : resolve(result!.secure_url);
            }
        );
        Readable.from(buffer).pipe(uploadStream);
    });
};

export const uploadProfilePicture = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) 
        return next(new AppError("Please upload the profile picture!", 400));

    const image_url = await uploadToCloudinary(req.file.buffer, req.user?.user_id!);

    await pool.query("UPDATE users SET profile_url = $2 WHERE user_id = $1", [req.user?.user_id, image_url])

    res.status(200).json({
        success: true,
        data: image_url
    });
});

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "success",
        data: req.user!
    });
}

export const getBookmarkedLocations = async (req: Request, res: Response, next: NextFunction) => {
    const bookmarks = await fetchBookmarkedLocations(req.user?.user_id!);
    res.status(200).json({
        status: "success",
        data: bookmarks
    });
}

export const bookmarkLocation = async (req: Request, res: Response, next: NextFunction) => {
    const locationId = +req.params.locationId;

    if (!locationId || !isInteger(locationId) || Number.isNaN(locationId))
        return next(new AppError("Incorrect Location ID!", 400));

    (await pool.query("INSERT INTO bookmarks (user_id, location_id) VALUES ($1, $2)", [req.user?.user_id!, locationId]));

    sendEmptySuccessResponse(res);
}

export const deleteBookmarkLocation = async (req: Request, res: Response, next: NextFunction) => {
    const locationId = +req.params.locationId;

    if (!locationId || !isInteger(locationId) || Number.isNaN(locationId))
        return next(new AppError("Incorrect Location ID!", 400));

    (await pool.query("DELETE FROM bookmarks WHERE user_id = $1 AND location_id = $2", [req.user?.user_id!, locationId]));

    sendEmptySuccessResponse(res);
}

export const editProfile = async (req: Request, res: Response, next: NextFunction) => {    
    const { name } = req.body;
    
    if (name && !isString(name)) 
        return next(new AppError("Incompatible Data to update with!", 400));
    
    if (name)
        req.user!.name = (await pool.query(`UPDATE users SET name=$2 WHERE user_id=$1 RETURNING name`, [req.user?.user_id, name])).rows[0].name;

    res.status(200).json({
        status: "success",
        data: req.user!
    });
}

async function fetchBookmarkedLocations(user_id: number) {
    return (await pool.query("SELECT loc.location_id, name, address, cover_image_url, tour_image_id, coordinate_x, coordinate_y, loc.rating, total_views AS views, COALESCE(COUNT(rev.location_id), 0)::INT AS reviews_count, loc.description, 1 AS is_bookmarked FROM bookmarks book INNER JOIN locations loc ON loc.location_id = book.location_id LEFT JOIN reviews rev ON rev.location_id = loc.location_id WHERE book.user_id=$1 GROUP BY loc.location_id, name, address, cover_image_url, tour_image_id, coordinate_x, coordinate_y, loc.rating, total_views, loc.description ORDER BY location_id DESC", [user_id])).rows;
}