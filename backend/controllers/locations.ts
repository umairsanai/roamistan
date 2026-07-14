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

export const getSearchedLocations = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    if (!isInteger(req.body.page) || Number.isNaN(req.body.page) || req.body.page < 1)
        return next(new AppError("Incorrect Page", 400));
    if (!isString(req.body.search))
        return next(new AppError("Incorrect Search Query", 400));

    const ITEMS_PER_PAGE = 1;
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