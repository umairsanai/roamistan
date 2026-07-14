/// <reference types="vite/client" />
import { fetchBookmarks, fetchMe, formatTimestampToMonthYear, goToAuthPage, goToLocationPage, showError } from "./helpers";
import type { LocationInfo, User } from "./types";

let user: User;
let bookmarks: LocationInfo[];

try {
    user = await fetchMe();
    bookmarks = await fetchBookmarks();
    renderProfile(user);
    renderBookmarks(bookmarks);
} catch (error: any) {
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();
}

function renderProfile(user: User) {
    const nameElement = document.querySelector(".profile-name") as HTMLElement;
    const emailElement = document.querySelector(".profile-email") as HTMLElement;
    const profileImageElement = document.querySelector(".profile-img") as HTMLImageElement;
    const memberSinceValueElement = document.querySelector(".member-since-value") as HTMLElement;
    const addressValueElement = document.querySelector(".address-value") as HTMLElement;
    const toursCompletedValueElement = document.querySelector(".tours-completed-value") as HTMLElement;
     
    nameElement.textContent = user.name;    
    emailElement.textContent = user.email;
    profileImageElement.src = user.profile_url;
    memberSinceValueElement.textContent = formatTimestampToMonthYear(user.created_at);
    addressValueElement.textContent = `${user.city}, ${user.country}`;
    toursCompletedValueElement.textContent = `${user.tours_completed} Virtual`;

}

function renderBookmarks(locations: LocationInfo[]) {
    const bookmarksListContainer = document.querySelector(".fav-list");
    if (!bookmarksListContainer) return;

    bookmarksListContainer.innerHTML = "";

    locations.forEach(location => {
        bookmarksListContainer.insertAdjacentHTML("beforeend", 
        `<div class="fav-item">
            <div class="fav-img">
                <img src="${location.cover_image_url}" alt="${location.name}">
            </div>
            <div class="fav-body">
            <div>
                <div class="top-row">
                <h3>${location.name}</h3>
                <button class="bookmark-remove" title="Remove from bookmarks">
                    <span class="material-symbols-outlined icon-fill">bookmark_remove</span>
                </button>
                </div>
                <p class="desc">${location.description}</p>
            </div>
            <div class="bottom-row">
                <span class="location-tag"><span class="material-symbols-outlined">location_on</span>${location.address}</span>
                <button data-location-id=${location.location_id} class="btn-explore">Explore Now</button>
            </div>
            </div>
        </div>`);
    });
}

document.body.addEventListener("click", (e: Event) => {

    const target = e.target as HTMLElement;
    const btn = target.closest(".btn-explore");
    if (!btn) return;
    
    const location_id: number = Number((btn as HTMLElement).dataset.locationId);
    if (!location_id) return;

    if (bookmarks.find(location => location.location_id === location_id)) {
        return goToLocationPage(location_id);
    }

    showError("Location Can't be displayed. Refresh the page!");
});