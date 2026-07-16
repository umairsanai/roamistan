import { Request, Response, NextFunction } from 'express';
import { AppError, handleAsyncError } from "../error.js";
import pool from "../database.js";

export const getAdsAroundLocation = handleAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const location_id  = Number(req.params.locationId);
    if (!location_id || Number.isNaN(location_id))
        return next(new AppError("Incorrect Location ID", 400));
    
    const query = "SELECT title, price, currency, redirect_url, image_url, is_verified, ad_category, company, description FROM ads INNER JOIN ad_location_map ON ads.ad_id=ad_location_map.ad_id AND location_id=$1";
    const ads = (await pool.query(query, [location_id])).rows;

    res.status(200).json({
        status: "success",
        data: ads
    });
});
