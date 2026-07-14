import { Request, Response, NextFunction } from 'express';
import { AppError, handleAsyncError } from "../error.js";
import pool from "../database.js";
import { buildSearchPatterns, isString } from './helpers.js';

export const getAdsAroundLocation = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { location_title, location_description } = req.body;
    if (!location_title || !location_description || !isString(location_title) || !isString(location_description))
        return next(new AppError("Incorrect Body for Request", 400));
    
    const words = buildSearchPatterns(location_title, location_description);

    if (words.length === 0) 
        return next(new AppError("Incorrect Body for Request", 400));    

    const query = `SELECT title, price, currency, redirect_url, image_url, is_verified, ad_category, company, description FROM ads WHERE ad_id IN ( SELECT ad_id FROM hashtags WHERE tag ILIKE ANY($1)) OR title ILIKE ANY($1) OR description ILIKE ANY($1)`;
    const ads = (await pool.query(query, [words])).rows;

    res.status(200).json({
        status: "success",
        data: ads
    });
});
