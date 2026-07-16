/// <reference types="vite/client" />
import { Ad, Image3D, LocationInfo, SearchRequestResult, User } from "./types";

export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function greetUser(name: string) {
    const element = document.querySelector(".hero")?.querySelector("h1");
    if (!element) return;
    element.textContent = `Welcome back, ${name}`;
}

export function updateSearchPageURL(page: number, query: string) {
    const newUrl = `${window.location.pathname}?page=${page}&query=${query}`;
    history.pushState({ page, query }, '', newUrl);
}





// NAVIGATION


export const goToProfilePage = () => window.location.href = "profile.html";
export const goToAuthPage = () => window.location.href = "auth.html";
export const goToDashboardPage = () => window.location.href = "dashboard.html";
export const goToViewPage = (location_id: number) => window.location.href = `view.html?loc=${location_id}`;
export const goToLocationPage = (location_id: number) => window.location.href = `location.html?loc=${location_id}`;
export const goToSearchPage = (page: number, query: string) => window.location.href = `search.html?page=${1}&query=${query}`;







// FORMATING


export function formatCordinates(longitude: number, latitude: number){
    const latitudeDirection = latitude >= 0 ? "N" : "S";
    const longitudeDirection = longitude >= 0 ? "E" : "W";

    return `${Math.abs(latitude).toFixed(4)}° ${latitudeDirection}, 
            ${Math.abs(longitude).toFixed(4)}° ${longitudeDirection}`;
} 

export function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
}
export function formatRating(rating: number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(rating);
}

export function formatTimestampToMonthYear(timestamp: string) {
    const [year, month] = timestamp.split('-');
    return `${monthNames[Number(month) - 1]}, ${year}`;
}








// API REQUESTING



export async function request(url: string, options?: RequestInit) {
    const res = await fetch(url, {
        ...options,
        credentials: "include"
    }); 
    const ok = res.ok;
    const parsed = await res.json();

    if (!ok) throw new Error(parsed.message);

    return parsed.data;
}

export async function fetchSearchedLocations(page: number, query: string) {
    return await request(`${import.meta.env.VITE_API_URL}/locations/search`, {
        method: "POST",
        body: JSON.stringify({
            page,
            search: query
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }) as SearchRequestResult;
}

export async function fetchAds(title: string, description: string) {
    return await request(`${import.meta.env.VITE_API_URL}/listings/`, {
        method: "POST",
        body: JSON.stringify({
            location_title: title,
            location_description: description
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }) as Ad[];
}

export async function fetchLocation(location_id: number) {
    return await request(`${import.meta.env.VITE_API_URL}/locations/${location_id}`) as LocationInfo;
}

export async function fetchMe() {
    return await request(`${import.meta.env.VITE_API_URL}/users/me`) as User;
}

export async function fetchBookmarks() {
    return await request(`${import.meta.env.VITE_API_URL}/users/bookmarks`) as LocationInfo[];
}

export async function fetchTrendingLocations() {
    return await request(`${import.meta.env.VITE_API_URL}/locations/trending`) as LocationInfo[]; 
}

export async function fetchTourImage(tourImageId: number) {
    return await request(`${import.meta.env.VITE_API_URL}/locations/tour-image/${tourImageId}`) as Image3D;    
}








// ERROR MESSAGE


export function showError(message: string) {
    alert(`Error: ${message}`);
}