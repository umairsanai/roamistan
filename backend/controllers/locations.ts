import { Request, Response, NextFunction } from 'express';
import { AppError, handleAsyncError } from "../error.js";
import pool from "../database.js";
import { buildSearchPatterns, sendEmptySuccessResponse, isInteger, isString } from './helpers.js';


export const getTrendingLocations = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const count = req.query.count ? +req.query.count : 3;
    if (!isInteger(count) || Number.isNaN(count)) 
        return next(new AppError("Incorrect Query Inputs!", 400));

    const trendingLocations = (await pool.query("SELECT loc.location_id, loc.name, address, cover_image_url, tour_image_id, loc.rating, total_views AS views, COALESCE(COUNT(rev.location_id), 0)::INT AS reviews_count, loc.description, coordinate_x, coordinate_y, 0 AS is_bookmarked FROM locations loc LEFT JOIN reviews rev ON rev.location_id = loc.location_id GROUP BY loc.location_id, name, address, cover_image_url, tour_image_id, coordinate_x, coordinate_y, loc.rating, total_views, loc.description ORDER BY today_views DESC, total_views DESC, location_id ASC, name ASC LIMIT $1", [count])).rows;

    res.status(200).json({
        status: "success",
        data: trendingLocations
    });
});

export const getLocationsAround = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "success",
        data: [
            {location_id: 4, name: "Lahore Fort", address: "Lahore, Punjab", tour_image_id: null, cover_image_url: "https://res.cloudinary.com/dfue7z6ls/image/upload/v1784272317/qh8caswelgtivjiuwtww.jpg", rating: "4.7", views: 100, reviews_count: 100, description: "A UNESCO World Heritage site, Lahore Fort stands as a testament to Mughal grandeur and architectural brilliance. Built over centuries, it features stunning palaces, marble mosques, and beautifully adorned halls that whisper tales of royal history.", coordinate_x: "30.0000", coordinate_y: "40.0000", is_bookmarked: 0},
            {location_id: 5, name: "Faisal Mosque", address: "Islamabad", tour_image_id: null, cover_image_url: "https://res.cloudinary.com/dfue7z6ls/image/upload/v1784272318/kenizw4q4frizb5bre0s.jpg", rating: "4.9", views: 150, reviews_count: 100, description: "Designed by Turkish architect Vedat Dalokay, Faisal Mosque is the largest mosque in South Asia and a modern architectural marvel. Its unique tent-like shape, surrounded by four towering minarets, sits beautifully against the backdrop of the Margalla Hills.", coordinate_x: "30.0000", coordinate_y: "40.0000", is_bookmarked: 0},
            {location_id: 6, name: "Margalla Hills", address: "Islamabad", tour_image_id: null, cover_image_url: "https://res.cloudinary.com/dfue7z6ls/image/upload/v1784272317/k0c7dkwx620imur0ht6p.jpg", rating: "4.8", views: 350, reviews_count: 100, description: "Part of the Himalayan foothills, Margalla Hills offer a serene escape from the bustling city life of Islamabad. With lush green trails, diverse wildlife, and panoramic views of the capital, it's a haven for hikers and nature lovers.", coordinate_x: "30.0000", coordinate_y: "40.0000", is_bookmarked: 0}
        ]
    });
});

export const getSearchedLocations = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    if (!isInteger(req.body.page) || Number.isNaN(req.body.page) || req.body.page < 1)
        return next(new AppError("Incorrect Page", 400));
    if (!isString(req.body.search))
        return next(new AppError("Incorrect Search Query", 400));

    const ITEMS_PER_PAGE = 10;
    const {search, page} = req.body;
    const searchWords = buildSearchPatterns(search);

    if (!searchWords.length) {
        return res.status(200).json({
            status: "success",
            data: {
                pages: 0,
                searched_locations: []
            }
        });
    };

    const query = `SELECT loc.location_id, name, address, cover_image_url, tour_image_id, loc.rating, views::INT, loc.description, coordinate_x, coordinate_y, COUNT(*) OVER()::INT AS matched_locations, is_bookmarked, COALESCE(COUNT(rev.location_id), 0)::INT AS reviews_count FROM ( SELECT locations.location_id, locations.name, address, cover_image_url, tour_image_id, rating, total_views AS views, description, coordinate_x, coordinate_y, CASE WHEN book.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_bookmarked FROM locations LEFT JOIN bookmarks book ON book.user_id=$3 AND locations.location_id=book.location_id WHERE locations.name ILIKE ANY($4) OR locations.description ILIKE ANY($4) ) AS loc LEFT JOIN reviews rev ON rev.location_id = loc.location_id GROUP BY loc.location_id, name, address, cover_image_url, tour_image_id, coordinate_x, coordinate_y, loc.rating, views, loc.description, is_bookmarked LIMIT $1 OFFSET $2`

    let total_matches;
    let searched_locations = (await pool.query(query, [ITEMS_PER_PAGE, (page-1)*ITEMS_PER_PAGE, req.user?.user_id, searchWords])).rows;

    searched_locations = searched_locations.map(location => {
        total_matches = location.matched_locations;
        delete location.matched_locations;
        return location;
    });

    res.status(200).json({
        status: "success",
        data: {
            pages: Math.ceil(total_matches!/ITEMS_PER_PAGE),
            searched_locations
        } 
    });
});

export const getLocation = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const locationId = Number(req.params.locationId);        
    if (!isInteger(locationId) || Number.isNaN(locationId)) 
        return next(new AppError("Incorrect Request Parameter!", 400));

    const location = (await pool.query(`SELECT loc.location_id, name, address, cover_image_url, tour_image_id, loc.rating, total_views::INT AS views, loc.description, coordinate_x, coordinate_y, CASE WHEN book.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_bookmarked, COALESCE(COUNT(rev.location_id), 0)::INT AS reviews_count FROM locations loc LEFT JOIN bookmarks book ON book.location_id=loc.location_id AND book.user_id=$2 LEFT JOIN reviews rev ON rev.location_id = loc.location_id WHERE loc.location_id=$1 GROUP BY loc.location_id, name, address, cover_image_url, tour_image_id, coordinate_x, coordinate_y, loc.rating, views, loc.description, is_bookmarked`, [locationId, req.user?.user_id])).rows[0];

    res.status(200).json({
        status: "success",
        data: location
    });
});

export const getTourImageOfLocation = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const imageId = Number(req.params.imageId);        
    if (!isInteger(imageId) || Number.isNaN(imageId)) 
        return next(new AppError("Incorrect Request Parameter!", 400));

    const tour_image = (await pool.query("SELECT * FROM tour_images WHERE image_id=$1", [imageId])).rows[0];

    res.status(200).json({
        status: "success",
        data: tour_image
    });
});