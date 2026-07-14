/// <reference types="vite/client" />
import { fetchSearchedLocations, formatCordinates, formatRating, goToAuthPage, goToDashboardPage, goToProfilePage, goToSearchPage, goToViewPage, request } from "./helpers";
import { fetchAndRenderLocations, updateURL } from "./search";
import { LocationInfo } from "./types";

const SEARCH_DELAY = 0.5 * 1000;   // milliseconds;
const brandContainer = document.querySelector(".brand");
const profileBtn = document.querySelector(".profile-btn");
const logoutButton = document.querySelector(".logout-btn");
const navigationSeachBar = document.querySelector(".nav-search-bar") as HTMLInputElement;
const emptyResultCardElement = document.querySelector(".search-results-empty");
const searchMoreResultsButton = document.querySelector(".search-results-more");
const searchedResultsListContainer = document.querySelector(".search-results-list");


let searchedLocations: LocationInfo[];
let timeoutId: number;


function renderSearchedLocations(locations: LocationInfo[]) {

    if (!searchedResultsListContainer) return;

    hideEmptyResultCard();
    showViewMoreButton();
    clearSearchList();

    locations.forEach(location => {
        searchedResultsListContainer.insertAdjacentHTML("beforeend", `
        <a class="search-result-card search-result-template" href="./location.html?loc=${location.location_id}" aria-label="${location.name}">
            <div class="search-result-media">
                <img src="${location.cover_image_url}" alt="${location.name}">
            </div>
            <div class="search-result-content">
                <div class="search-result-title-row">
                    <div>
                        <div class="search-result-title">${location.name}</div>
                        <div class="search-result-address">
                            <span class="material-symbols-outlined">location_on</span>
                            ${location.address}
                        </div>
                    </div>
                    <div class="search-result-pill" aria-label="Rating ${formatRating(Number(location.rating))}">
                        <span class="material-symbols-outlined">star</span>
                        <span>${formatRating(Number(location.rating))}</span>
                    </div>
                </div>
                <div class="search-result-description">${location.description}</div>
                <div class="search-result-meta">
                    <span>${location.reviews_count} reviews</span>
                    <span>${location.views} views</span>
                    <span class="search-result-coordinates">${formatCordinates(Number(location.coordinate_x), Number(location.coordinate_y))}</span>
                </div>
            </div>
        </a>`);
    });
}




function hideEmptyResultCard() {
    if (emptyResultCardElement)
        (emptyResultCardElement as HTMLElement).style.display = "none";
}

function showEmptyResultCard() {
    if (emptyResultCardElement)
        (emptyResultCardElement as HTMLElement).style.display = "flex";
}

function hideViewMoreButton() {
    if (searchMoreResultsButton)
        (searchMoreResultsButton as HTMLElement).style.display = "none";
}
function showViewMoreButton() {
    if (searchMoreResultsButton)
        (searchMoreResultsButton as HTMLElement).style.display = "flex";
}

function clearSearchList() {
    if (searchedResultsListContainer)
        searchedResultsListContainer.innerHTML = "";
}

function hideSearchResult() {
    if (navigationSeachBar)
        navigationSeachBar.blur();
}


async function logoutUser() {
    await request(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST"
    });
    goToAuthPage();
}












// ==========    EVENT LISTENERS    ==========

logoutButton?.addEventListener("click", logoutUser);
profileBtn?.addEventListener("click", goToProfilePage);
brandContainer?.addEventListener("click", goToDashboardPage);
searchMoreResultsButton?.addEventListener("click", () => {
    const query = (navigationSeachBar as HTMLInputElement).value;
    goToSearchPage(1, query);
});
navigationSeachBar?.addEventListener("keyup", async (e: KeyboardEvent) => {
    clearTimeout(timeoutId);

    const query = (navigationSeachBar as HTMLInputElement).value;

    if (!query.trim()) {
        showEmptyResultCard();
        hideViewMoreButton();
        clearSearchList();
        return;
    }
    
    if (e.key !== "Enter") {
        timeoutId = setTimeout(async () => {
            searchedLocations = (await fetchSearchedLocations(1, query)).searched_locations;
            if (searchedLocations.length === 0) {
                showEmptyResultCard();
                hideViewMoreButton();
                clearSearchList();
            } else {
                renderSearchedLocations(searchedLocations);
            }
        }, SEARCH_DELAY);
    } else {
        if (window.location.href.startsWith("search")) {
            hideSearchResult();
            updateURL(1, query);
            await fetchAndRenderLocations();
            renderSearchedLocations(searchedLocations);
        } else {
            goToSearchPage(1, query);
        }
    }
});