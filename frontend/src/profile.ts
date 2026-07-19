/// <reference types="vite/client" />
import { bookmarkLocation, deleteBookmarkedLocation, fetchBookmarks, fetchMe, formatTimestampToMonthYear, goToAuthPage, goToLocationPage, request, showError } from "./helpers.js";
import type { LocationInfo, User } from "./types.js";

const HIDE_UNDO_CARD_TIMEOUT_LIMIT = 1.5 * 1000;     // seconds

let user: User;
let bookmarks: LocationInfo[];
let oldBookmarks: LocationInfo[] | null = null;
let undoCardTimeoutId: number | null = null;

const bookmarksListContainer = document.querySelector(".fav-list");
const profileImageElement = document.querySelector(".profile-img") as HTMLImageElement | null;
const overlayButton = document.querySelector(".overlay-btn") as HTMLButtonElement | null;
const profilePictureInput = document.querySelector("#profilePictureInput") as HTMLInputElement | null;
const undoCard = document.querySelector(".undo-card") as HTMLElement | null;

try {
    [user, bookmarks] = await Promise.all([fetchMe(), fetchBookmarks()]);
    renderProfile(user);
    renderBookmarks(bookmarks);
} catch (error: any) {
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();
}


const showUndoCard = () => undoCard?.classList.remove("hidden");
const hideUndoCard = () => undoCard?.classList.add("hidden");

function renderProfile(user: User) {
    const nameElement = document.querySelector(".profile-name") as HTMLElement;
    const emailElement = document.querySelector(".profile-email") as HTMLElement;
    const memberSinceValueElement = document.querySelector(".member-since-value") as HTMLElement;
    const addressValueElement = document.querySelector(".address-value") as HTMLElement;
    const toursCompletedValueElement = document.querySelector(".tours-completed-value") as HTMLElement;
     
    nameElement.textContent = user.name;    
    emailElement.textContent = user.email;
    if (user.profile_url && profileImageElement)
        profileImageElement.src = user.profile_url;
    memberSinceValueElement.textContent = formatTimestampToMonthYear(user.created_at);
    addressValueElement.textContent = `${user.city}, ${user.country}`;
    toursCompletedValueElement.textContent = `${user.tours_completed} Virtual`;

}

async function uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("profile_picture", file);

    const imageUrl = await request(`${import.meta.env.VITE_API_URL}/users/profile-picture`, {
        method: "POST",
        body: formData
    }) as string;

    if (profileImageElement)
        profileImageElement.src = imageUrl;
}

async function uploadProfilePictureHandler() {
    const file = profilePictureInput?.files?.[0];
    if (!file) return;

    try {
        await uploadProfilePicture(file);
    } catch (error: any) {
        showError(error.message);
    } finally {
        profilePictureInput.value = "";
    }
}

async function deleteBookmarkHandler(e: Event) {
    if (!e.target) return;

    const target = e.target as HTMLElement;
    if (!target.closest(".bookmark-remove")) return;

    const locationId = Number((target.closest(".bookmark-remove") as HTMLElement).dataset.locationId);
    if (!locationId || Number.isNaN(locationId)) return;

    if (undoCard) {
        showUndoCard();
        (undoCard.querySelector(".undo-card-button")! as HTMLElement).dataset.locationId = locationId.toString();
    }

    oldBookmarks = [...bookmarks];

    try {
        
        bookmarks = bookmarks.filter((location) => location.location_id !== locationId);
        renderBookmarks(bookmarks);
        await deleteBookmarkedLocation(locationId);
        undoCardTimeoutId = setTimeout(hideUndoCard, HIDE_UNDO_CARD_TIMEOUT_LIMIT);

    } catch (error: any) {
        bookmarks = oldBookmarks;
        renderBookmarks(bookmarks);
        showError(error.message);
    }
}

async function undoBookarkDeleteHandler(e: Event) {
    if (!e.target) return;

    const target = e.target as HTMLButtonElement;
    if (!target?.classList?.contains("undo-card-button")) return;

    const locationId = Number(target.dataset.locationId);
    if (!locationId) return;

    if (undoCardTimeoutId)
        clearTimeout(undoCardTimeoutId);
    target.disabled = true;

    let currentBookmarks = [...bookmarks];

    try {
        
        bookmarks = oldBookmarks ?? bookmarks;
        renderBookmarks(bookmarks);
        await bookmarkLocation(locationId);
        hideUndoCard();

    } catch(error: any) {

        bookmarks = currentBookmarks;
        renderBookmarks(bookmarks);        
        showError("Bookmark couldn't be restored! Try again!");

    } finally {
        target.disabled = false;
    }
}

function exploreLocationHandler(e: Event) {

    const target = e.target as HTMLElement;
    const btn = target.closest(".btn-explore");
    if (!btn) return;
    
    const location_id: number = Number((btn as HTMLElement).dataset.locationId);
    if (!location_id) return;

    if (bookmarks.find(location => location.location_id === location_id)) {
        return goToLocationPage(location_id);
    }

    showError("Location Can't be displayed. Refresh the page!");
}

function renderBookmarks(locations: LocationInfo[]) {
    if (!bookmarksListContainer || !locations.length) return;

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
                <button data-location-id=${location.location_id} class="bookmark-remove" title="Remove from bookmarks">
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

overlayButton?.addEventListener("click", () => {
    profilePictureInput?.click();
});
document.body.addEventListener("click", exploreLocationHandler);
profilePictureInput?.addEventListener("change", uploadProfilePictureHandler);
bookmarksListContainer?.addEventListener("click", deleteBookmarkHandler);
undoCard?.addEventListener("click", undoBookarkDeleteHandler);