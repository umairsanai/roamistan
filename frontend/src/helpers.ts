/// <reference types="vite/client" />
import { Ad, Image3D, LocationInfo, SearchRequestResult, User } from "./types.js";

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

export async function fetchAds(location_id: number) {
    return await request(`${import.meta.env.VITE_API_URL}/packages/${location_id}`) as Ad[];
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

export async function fetchTourImage(tour_image_id: number) {
    return await request(`${import.meta.env.VITE_API_URL}/locations/tour-image/${tour_image_id}`) as Image3D;    
}

export async function fetchLocationsAround() {
    return await request(`${import.meta.env.VITE_API_URL}/locations/around`) as LocationInfo[];
}

export async function bookmarkLocation(location_id: number) {
    await request(`${import.meta.env.VITE_API_URL}/users/bookmark/${location_id}`, {
        method: "POST"
    });
}

export async function deleteBookmarkedLocation(location_id: number) {
    await request(`${import.meta.env.VITE_API_URL}/users/bookmark/${location_id}`, {
        method: "DELETE"
    });
}






// ERROR MESSAGE


const DISPLAY_MS = 2000;
const ANIMATION_MS = 280;

let hideTimer: number | null = null;
let removeTimer: number | null = null;

export function showError(message: any) {
    console.log(message);

    message = (typeof message === 'string') ? message : String('An unexpected error occurred.');

    let host = document.getElementById('global-error-toast');
    if (!host) {
        host = document.createElement('div');
        host.id = 'global-error-toast';
        host.className = 'error-toast-shell';
        host.setAttribute('role', 'alert');
        document.body.append(host);
    }

    host.insertAdjacentHTML('beforeend', `
        <article class="error-toast-card">
            <span class="material-symbols-outlined error-toast-icon">error</span>
            <div class="error-toast-text-wrap">
            <p class="error-toast-title">Request Failed</p>
            <p class="error-toast-message">${message}</p>
            </div>
            <span class="error-toast-progress" style="--error-duration: ${DISPLAY_MS}ms"></span>
        </article>
    `);

    // Clear old timers
    if (hideTimer) clearTimeout(hideTimer);
    if (removeTimer) clearTimeout(removeTimer);

    // Show
    host.classList.remove('is-hiding');
    void host.offsetWidth; // force reflow
    host.classList.add('is-visible');

    hideTimer = setTimeout(() => {
        host.classList.remove('is-visible');
        host.classList.add('is-hiding');
    }, DISPLAY_MS);

    removeTimer = setTimeout(host.remove, DISPLAY_MS + ANIMATION_MS);
}