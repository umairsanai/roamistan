/// <reference types="vite/client" />
import { fetchBookmarks, fetchLocationsAround, fetchMe, fetchTrendingLocations, goToAuthPage, goToLocationPage, goToProfilePage, greetUser, showError } from "./helpers.js";
import { type LocationInfo } from "./types.js";


let user;
let bookmarks: LocationInfo[];
let trendingLocations: LocationInfo[];
let locationsAround: LocationInfo[];

try {
    [user, bookmarks, trendingLocations, locationsAround] = await Promise.all([fetchMe(), fetchBookmarks(), fetchTrendingLocations(), fetchLocationsAround()]);
    greetUser(user.name.split(" ")[0]);
    renderBookmarks(bookmarks);
    renderLocationsAround(locationsAround);
    renderTrendingLocations(trendingLocations);
} catch (error: any) {
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();
}


function renderBookmarks(locations: LocationInfo[]) {
    const bookmarksContainer = document.querySelector(".favorites-scroll");
    if (!bookmarksContainer || !locations.length) return;

    bookmarksContainer.innerHTML = "";

    locations.forEach(location => {
        bookmarksContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-card">
            <div class="img-wrap">
                <img data-alt="${location.name}" src="${location.cover_image_url}">
                <div class="fav-badge"><span class="material-symbols-outlined">favorite</span></div>
            </div>
            <div class="card-body">
                <h3 class="font-headline-sm text-on-surface">${location.name}</h3>
                <div class="location"><span class="material-symbols-outlined">location_on</span>${location.address}</div>
                <button data-location-id=${location.location_id} class="btn-resume">Resume Tour</button>
            </div>
        </div>`);
    });
}

function renderLocationsAround(locations: LocationInfo[]) {
    const locationsAroundContainer = document.querySelector(".locations-grid");    
    if (!locationsAroundContainer || !locations.length) return;

    locationsAroundContainer.innerHTML = "";
    locations.forEach(location => {
        locationsAroundContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-card">
            <div class="img-wrap">
                <img data-alt="${location.name}" src="${location.cover_image_url}">
            </div>
            <div class="card-body">
                <h3 class="font-headline-sm text-on-surface">${location.name}</h3>
                <div class="location"><span class="material-symbols-outlined">location_on</span>${location.address}</div>
                <div class="rating">
                    <span class="material-symbols-outlined">star</span> ${location.rating} 
                    <span class="views"><span class="material-symbols-outlined">visibility</span> ${location.views}</span>
                </div>
                <button data-location-id=${location.location_id} class="btn-resume">Start Tour</button>
            </div>
        </div>`);
    });
}

function renderTrendingLocations(locations: LocationInfo[]) {
    const trendingLocationsContainer = document.querySelector(".trending-grid");    
    if (!trendingLocationsContainer || !locations.length) return;

    trendingLocationsContainer.innerHTML = "";
    locations.forEach((location, i) => {
        trendingLocationsContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-card">
            <div class="img-wrap">
                <img data-alt="${location.name}" src="${location.cover_image_url}">
                <div class="trend-badge">Trending #${i+1}</div>
            </div>
            <div class="card-body">
                <h3 class="font-headline-sm text-on-surface">${location.name}</h3>
                <div class="location"><span class="material-symbols-outlined">location_on</span>${location.address}</div>
                <div class="rating">
                    <span class="material-symbols-outlined">star</span> ${location.rating} 
                    <span class="views"><span class="material-symbols-outlined">visibility</span> ${location.views}</span>
                </div>
                <button data-location-id=${location.location_id} class="btn-resume">Start Tour</button>
            </div>
        </div>`);
    });
}




// ==========    EVENT LISTENERS    ==========


document.querySelector(".see-all")?.addEventListener("click", goToProfilePage);
document.body.addEventListener("click", (e: Event) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".btn-resume");
    if (!btn) return;

    const location_id: number = Number((btn as HTMLElement).dataset.locationId);
    if (!location_id) return;

    if([...bookmarks, ...locationsAround, ...trendingLocations].find(location => location.location_id === location_id)) {
        return goToLocationPage(location_id);
    }

    showError("Location Can't be displayed. Refresh the page!");
});