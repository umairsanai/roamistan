/// <reference types="vite/client" />
import { fetchAds, fetchLocation, fetchTourImage, formatCordinates, formatPrice, goToAuthPage, showError } from "./helpers.ts";
import type { Ad, Image3D, LocationInfo } from "./types.ts"
import "pannellum";

let location: LocationInfo | null;
let tourImage: Image3D | null = null;
let viewer: Pannellum.Viewer | null = null;
let location_id = Number(new URLSearchParams(window.location.search).get("loc"));
let ads: Ad[] | null;

const viewerContentContainer = document.querySelector(".viewer-content");
const notFoundCard = document.querySelector(".not-found-card");


try {
    if (!Number.isNaN(location_id)) {
        location = await fetchLocation(location_id);
        if (location) {
            ads = await fetchAds(location.location_id);
            renderLocationDetails()
            renderAds();    
        } else {
            viewerContentContainer?.classList.add("hidden");
            notFoundCard?.classList.remove("hidden");
        }
    }
} catch (error: any) {
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();  
}


async function renderLocationDetails() {
    if (!location) return;

    const locationNameElement = document.querySelector(".location-name") as HTMLElement;
    const locationStateElement = document.querySelector(".location-state") as HTMLElement;
    const cordinatesElement = document.querySelector(".coord-badge") as HTMLElement;

    if (location.tour_image_id)
        tourImage = await fetchTourImage(location.tour_image_id);

    if (tourImage)
        await showTourImage(tourImage);

    locationNameElement.textContent = location.name;
    locationStateElement.textContent = location.address;
    cordinatesElement.textContent = formatCordinates(Number(location.coordinate_x), Number(location.coordinate_y))
}

function renderAds() {
    const adCardsContainer = document.querySelector(".cards-container");

    if (!adCardsContainer || !ads || !ads.length) return;

    adCardsContainer.innerHTML = "";
    adCardsContainer.addEventListener("click", (e: Event) => {
        const btn = (e.target as HTMLElement).closest(".card-btn");
    
        if (btn) {
            const url = (btn as HTMLElement).dataset.adUrl;
            if (url) 
                window.location.href = url;
        }
    });
    
    ads.forEach(ad => {
        adCardsContainer.insertAdjacentHTML("beforeend", 
        `<div class="tour-card">
            <div class="tour-card-img">
                <img src="${ad.image_url}" alt="${ad.title}">
                <div class="sponsor-tag"><span class="material-symbols-outlined">star</span>${ad.ad_category}</div>
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h4>${ad.title}</h4>
                    <div class="price-block">
                        <div class="price">${formatPrice(Number(ad.price), ad.currency)}</div>
                    </div>
                </div>
                <p class="card-desc">${ad.description}</p>
                ${ad.is_verified 
                    ? `<div class="agency-badge"><span class="material-symbols-outlined">verified</span>VERIFIED</div>`
                    : `` 
                }
                <button data-ad-url="${ad.redirect_url}" class="card-btn">Book Experience <span class="material-symbols-outlined">arrow_forward</span></button>
            </div>
        </div>`);
    });
}

async function showTourImage(tourImage: Image3D) {
    viewer = pannellum.viewer("panorama-bg", {
        type: "equirectangular",
        panorama: tourImage.image_url,
        autoLoad: true,
        compass: false,
        showZoomCtrl: false,
        showControls: false,
    });
}

document.querySelector(".fullscreen-btn")?.addEventListener("click", async () => {
    const imageContainer = document.getElementById("panorama-bg");

    if (!imageContainer) return;

    if (tourImage)
        await showTourImage(tourImage);

    await imageContainer.requestFullscreen();
});


document.getElementById("left-btn")?.addEventListener("click", () => {
    viewer?.setYaw((viewer.getConfig().yaw || 0) - 15, 400);
});
document.getElementById("right-btn")?.addEventListener("click", () => {
    viewer?.setYaw((viewer.getConfig().yaw || 0) + 15, 400);
});
document.getElementById("zoom-in-btn")?.addEventListener("click", () => {
    viewer?.setHfov(Math.max(20, (viewer?.getConfig().hfov ?? 0) - 10), 400);
});
document.getElementById("zoom-out-btn")?.addEventListener('click', () => {
    viewer?.setHfov(Math.max(20, (viewer?.getConfig().hfov ?? 0) + 10), 400);
});