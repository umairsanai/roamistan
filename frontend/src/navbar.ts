/// <reference types="vite/client" />
import { fetchSearchedLocations, goToAuthPage, goToDashboardPage, goToProfilePage, goToViewPage, request } from "./helpers";
import { fetchAndRenderLocations, updateURL } from "./search";
import { LocationInfo } from "./types";

const SEARCH_DELAY = 0.5 * 1000;   // milliseconds;
const brandContainer = document.querySelector(".brand");
const profileBtn = document.querySelector(".profile-btn");
const logoutButton = document.querySelector(".logout-btn");
const navigationSeachBar = document.querySelector(".nav-search-bar") as HTMLInputElement;
let searchedLocations: LocationInfo[];
let timeoutId: number;





async function logoutUser() {
    await request(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST"
    });
    goToAuthPage();
}


// ==========    EVENT LISTENERS    ==========

profileBtn?.addEventListener("click", goToProfilePage);
logoutButton?.addEventListener("click", logoutUser);
brandContainer?.addEventListener("click", goToDashboardPage);
navigationSeachBar?.addEventListener("keydown", async (e: KeyboardEvent) => {
    clearTimeout(timeoutId);

    const query = (document.querySelector(".nav-search-bar") as HTMLInputElement).value;
    if (!query.trim()) return;

    if (e.key !== "Enter") {
        timeoutId = setTimeout(async () => {
            searchedLocations = (await fetchSearchedLocations(1, query)).searched_locations;         
            console.log(searchedLocations);
        }, SEARCH_DELAY);

        // Display Locations as search results below the search bar.
    } else {
        if (window.location.href.startsWith("search")) {
            updateURL(1, query);
            await fetchAndRenderLocations();
        } else {
            window.location.href = `search.html?page=${1}&query=${query}`;
        }
    }
});