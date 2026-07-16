/// <reference types="vite/client" />
import { fetchAds, fetchLocation, formatCordinates, formatPrice, formatRating, goToAuthPage, goToViewPage, request, showError } from "./helpers";
import type { Ad, LocationInfo, User } from "./types";

const startTourButton = document.querySelector(".tour-btn");
const adsListContainer = document.querySelector(".packages-grid");
const bookmarkButton = document.querySelector(".bookmark-btn");
const bookmarkIcon = document.querySelector(".bookmark-icon") as HTMLElement;
const locationContentContainer = document.querySelector(".location-content");
const notFoundCard = document.querySelector(".not-found-card");


let location: LocationInfo | null;
    let location_id = Number(new URLSearchParams(window.location.search).get("loc"));
let ads: Ad[] | null;

try {
    if (!Number.isNaN(location_id)) {
        location = await fetchLocation(location_id);
        if (location) {
            ads = await fetchAds(location.location_id);
            renderLocation();
            renderAds();
        } else {
            console.log(locationContentContainer, notFoundCard);
            locationContentContainer?.classList.add("hidden");
            notFoundCard?.classList.remove("hidden");
        }
    }
} catch (error: any) {
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();
}



function changeBookmarkIcon(flag: number) {
    if (!bookmarkIcon) return;
    bookmarkIcon.classList.toggle("icon-fill", Boolean(flag));
}


function renderLocation() {
    if (!location) return;

    document.title = `Roamistan · ${location.name}`;
    const locationNameElement = document.querySelector(".place-title") as HTMLElement;
    const starsContainer = document.querySelector(".stars") as HTMLElement;
    const reviewsElement = document.querySelector(".reviews") as HTMLElement;
    const descriptionElement = document.querySelector(".description") as HTMLElement;
    const cordinatesElement = document.querySelector(".coords-text") as HTMLElement;
    const stateElement = document.querySelector(".badge-value") as HTMLElement;
    const imageElement = document.querySelector(".hero-img") as HTMLImageElement;
    const rating = Number(location.rating);
    
    for (let i = 1; i <= 5; i++) {
        let starType = "star_outline";

        if (i-1 === Math.floor(rating) && i === Math.ceil(rating)) starType = "star_half";
        else if (i <= rating) starType = "star";

        starsContainer.insertAdjacentHTML("beforeend", `<span class="material-symbols-outlined" ${starType === "star_outline" ? `style="font-variation-settings: 'FILL' 0;"` : ""}>${starType}</span>`);
    }
    
    locationNameElement.textContent = location.name;
    imageElement.src = location.cover_image_url;
    imageElement.alt = location.name;
    changeBookmarkIcon(location.is_bookmarked);
    descriptionElement.textContent = location.description;
    reviewsElement.textContent = `${formatRating(rating)} (${location.reviews_count} Reviews)`;
    cordinatesElement.textContent = formatCordinates(Number(location.coordinate_x), Number(location.coordinate_y));
    stateElement.textContent = location.address;
}

function renderAds() {
    if (!adsListContainer || !ads || !ads.length) return;

    adsListContainer.innerHTML = "";
    ads.forEach((ad) => {
        adsListContainer.insertAdjacentHTML("beforeend", 
        `<div data-redirect-url=${ad.redirect_url} class="package-card">
            <div class="package-img">
              <img src="${ad.image_url}" alt="${ad.title}">
            </div>
            <div class="package-content">
              <h4>${ad.title}</h4>
              <p class="package-provider">${ad.company}</p>
              <p class="package-price">${formatPrice(Number(ad.price), ad.currency)}</p>
            </div>
            <span class="material-symbols-outlined package-arrow">arrow_forward_ios</span>
        </div>`
    )});
}


// ================= EVENT LISTENERS ====================

if (!Number.isNaN(location_id))
    startTourButton?.addEventListener("click", goToViewPage.bind(null, location_id));

adsListContainer?.addEventListener("click", (event: Event) => {
    const target = event?.target;
    if (!target || !(target as HTMLElement).closest(".package-card")) return;

    const topElement = (target as HTMLElement).closest(".package-card") as HTMLElement;
    const redirectUrl = topElement.dataset.redirectUrl;
    if (redirectUrl)
        window.location.href = redirectUrl;
});

bookmarkButton?.addEventListener("click", async () => {
    if (Number.isNaN(location_id) || !location) return;
    try {
        if (location.is_bookmarked) {
            await request(`${import.meta.env.VITE_API_URL}/users/bookmark/${location_id}`, {
                method: "DELETE"
            });            
        } else {
            await request(`${import.meta.env.VITE_API_URL}/users/bookmark/${location_id}`, {
                method: "POST"
            });
        }
        location.is_bookmarked = Number(!location.is_bookmarked);
        changeBookmarkIcon(location.is_bookmarked);
    } catch (error: any) {
        showError(error.message);
    }
});
