export type LocationInfo = {
    location_id: number
    name: string
    cover_image_url: string
    tour_image_id: number | null
    address: string
    rating: string
    views: number
    reviews_count: number
    description: string
    coordinate_x: string,
    coordinate_y: string,
    is_bookmarked: number
};

export type Ad = {
    title: string
    description: string
    price: string
    currency: "PKR"
    redirect_url: string
    image_url: string
    is_verified: number
    ad_category: "FEATURED" | "SPONSERED"
    company: string
}

export type User = {
    name: string
    email: string
    city: string
    country: string
    created_at: string
    tours_completed: number
    profile_url: string
}

export type Image3D = {
    image_id: number
    image_url: string
    left_image_id: number | null // imageId
    right_image_id: number | null // imageId
    forward_image_id: number | null // imageId
    backward_image_id: number | null // imageId
};











export type SearchRequestResult = {
    pages: number, 
    searched_locations: LocationInfo[]
} 