/// <reference types="vite/client" />
import { fetchBookmarks, fetchMe, fetchTrendingLocations, goToAuthPage, goToLocationPage, goToProfilePage, greetUser, showError } from "./helpers.ts";
import { type LocationInfo } from "./types.ts";


let user;
let bookmarks: LocationInfo[];
let trendingLocations: LocationInfo[];
const locationsAround: LocationInfo[] = [
    {location_id: 4, name: "Lahore Fort", address: "Lahore, Punjab", tour_image_id: null, cover_image_url: "../assets/lahore-fort.jpg", rating: "4.7", views: 100, reviews_count: 100, description: "A UNESCO World Heritage site, Lahore Fort stands as a testament to Mughal grandeur and architectural brilliance. Built over centuries, it features stunning palaces, marble mosques, and beautifully adorned halls that whisper tales of royal history.", coordinate_x: "30.0000", coordinate_y: "40.0000", is_bookmarked: 0},
    {location_id: 5, name: "Faisal Mosque", address: "Islamabad", tour_image_id: null, cover_image_url: "../assets/faisal-mosque.jpg", rating: "4.9", views: 150, reviews_count: 100, description: "Designed by Turkish architect Vedat Dalokay, Faisal Mosque is the largest mosque in South Asia and a modern architectural marvel. Its unique tent-like shape, surrounded by four towering minarets, sits beautifully against the backdrop of the Margalla Hills.", coordinate_x: "30.0000", coordinate_y: "40.0000", is_bookmarked: 0},
    {location_id: 6, name: "Margalla Hills", address: "Islamabad", tour_image_id: null, cover_image_url: "../assets/margalla-hills.jpg", rating: "4.8", views: 350, reviews_count: 100, description: "Part of the Himalayan foothills, Margalla Hills offer a serene escape from the bustling city life of Islamabad. With lush green trails, diverse wildlife, and panoramic views of the capital, it's a haven for hikers and nature lovers.", coordinate_x: "30.0000", coordinate_y: "40.0000", is_bookmarked: 0}
];

try {
    user = await fetchMe();
    bookmarks = await fetchBookmarks();
    trendingLocations = await fetchTrendingLocations();
    greetUser(user.name.split(" ")[0]);
    renderBookmarks(bookmarks);
    renderLocationsAround(locationsAround);
    renderTrendingLocations(trendingLocations);
} catch (error: any) {
    showError(error.message);
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