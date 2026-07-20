/// <reference types="vite/client" />
import { fetchBookmarks, fetchLocationsAround, fetchMe, fetchTrendingLocations, goToAuthPage, goToLocationPage, goToProfilePage, greetUser, showError } from "./helpers.js";
import { type LocationInfo } from "./types.js";
import { hydrateSkeletonImages, initializeSkeletons, locationCardSkeleton, removeSkeletons, renderSkeletons } from "./skeleton.js";


let user;
let bookmarks: LocationInfo[];
let trendingLocations: LocationInfo[];
let locationsAround: LocationInfo[];

const bookmarksContainer = document.querySelector(".favorites-scroll");
const locationsAroundContainer = document.querySelector(".locations-grid");
const trendingLocationsContainer = document.querySelector(".trending-grid");


try {
    initializeSkeletons();
    renderSkeletons(bookmarksContainer, () => locationCardSkeleton(false), 3);
    renderSkeletons(locationsAroundContainer, () => locationCardSkeleton(true), 3);
    renderSkeletons(trendingLocationsContainer, () => locationCardSkeleton(true), 3);

    [user, bookmarks, trendingLocations, locationsAround] = await Promise.all([fetchMe(), fetchBookmarks(), fetchTrendingLocations(), fetchLocationsAround()]);
    greetUser(user.name.split(" ")[0]);
    renderBookmarks(bookmarks);
    renderLocationsAround(locationsAround);
    renderTrendingLocations(trendingLocations);
} catch (error: any) {
    [bookmarksContainer, locationsAroundContainer, trendingLocationsContainer].forEach(removeSkeletons);
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();
}

function emptyState(icon: string, title: string, description: string) {
    return `<div class="empty-state-card">
        <span class="material-symbols-outlined empty-state-icon">${icon}</span>
        <h3>${title}</h3>
        <p>${description}</p>
    </div>`;
}


function renderBookmarks(locations: LocationInfo[]) {
    if (!bookmarksContainer) return;

    if (!locations.length) {
        bookmarksContainer.innerHTML = emptyState("bookmark", "No bookmarks yet", "Saved places will appear here once you add them.");
        return;
    }

    bookmarksContainer.innerHTML = "";

    locations.forEach(location => {
        bookmarksContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-card">
            <div class="img-wrap" data-skeleton-image-wrapper>
                <img data-alt="${location.name}" data-skeleton-image src="${location.cover_image_url}">
                <div class="fav-badge"><span class="material-symbols-outlined">favorite</span></div>
            </div>
            <div class="card-body">
                <h3 class="font-headline-sm text-on-surface">${location.name}</h3>
                <div class="location"><span class="material-symbols-outlined">location_on</span>${location.address}</div>
                <button data-location-id=${location.location_id} class="btn-resume">Resume Tour</button>
            </div>
        </div>`);
    });

    hydrateSkeletonImages(bookmarksContainer);
}

function renderLocationsAround(locations: LocationInfo[]) {
    if (!locationsAroundContainer) return;

    if (!locations.length) {
        locationsAroundContainer.innerHTML = emptyState("travel_explore", "No Locations Found", "Locations around you will show up here when they are available.");
        return;
    }

    locationsAroundContainer.innerHTML = "";
    locations.forEach(location => {
        locationsAroundContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-card">
            <div class="img-wrap" data-skeleton-image-wrapper>
                <img data-alt="${location.name}" data-skeleton-image src="${location.cover_image_url}">
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

    hydrateSkeletonImages(locationsAroundContainer);
}

function renderTrendingLocations(locations: LocationInfo[]) {
    if (!trendingLocationsContainer) return;

    if (!locations.length) {
        trendingLocationsContainer.innerHTML = emptyState("local_fire_department", "No Locations Found", "Trending destinations will appear here when the feed is ready.");
        return;
    }

    trendingLocationsContainer.innerHTML = "";
    locations.forEach((location, i) => {
        trendingLocationsContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-card">
            <div class="img-wrap" data-skeleton-image-wrapper>
                <img data-alt="${location.name}" data-skeleton-image src="${location.cover_image_url}">
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

    hydrateSkeletonImages(trendingLocationsContainer);
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
