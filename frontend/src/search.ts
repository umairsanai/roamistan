/// <reference types="vite/client" />
import { fetchSearchedLocations, goToAuthPage, goToLocationPage, showError } from "./helpers";
import { LocationInfo } from "./types";

let total_pages: number;
const paginationContainer = document.querySelector(".pagination");
let searchedLocations: LocationInfo[] | null;



try {
    await fetchAndRenderLocations();
} catch (error: any) {
    showError(error.message);
    if (error.message.toLowerCase().includes("not logged in"))
        goToAuthPage();
}



export function updateURL(page: number, query: string) {
  const newUrl = `${window.location.pathname}?page=${page}&query=${query}`;
  history.pushState({ page, query }, '', newUrl);
}

function startButtonLocationCardHandler(e: Event) {
    const target = e.target as HTMLElement;
    const btn = target.closest(".card-btn");
    if (!btn) return;

    const location_id: number = Number((btn as HTMLElement).dataset.locationId);
    if (!location_id) return;

    if (!searchedLocations) return;

    if (searchedLocations.find(location => location.location_id === location_id)) {
        goToLocationPage(location_id);
        return;
    }

    showError("Location Can't be displayed. Refresh the page!");
}

function renderLocations(locations: LocationInfo[]) {

    const locationsGridContainer = document.querySelector(".card-grid");
    if (!locationsGridContainer) return;

    locationsGridContainer.innerHTML = "";
    locations.forEach(location => {
        locationsGridContainer.insertAdjacentHTML("beforeend", `
        <article class="card">
            <div class="card-img">
                <img src="${location.cover_image_url}" alt="${location.name}">
                <div class="card-badge"><span class="material-symbols-outlined">star</span><span>${location.rating}</span></div>
            </div>
            <div class="card-body">
                <h3>${location.name}</h3>
                <div class="card-location"><span class="material-symbols-outlined">location_on</span>${location.address}</div>
                <p class="card-desc">${location.description}</p>
                <button data-location-id=${location.location_id} class="card-btn">Start Virtual Tour</button>
            </div>
        </article>`);
    });
}

function renderPagination(current_page: number) {
    const leftButtonHTML = `<button data-page=${Math.max(current_page-1, 1)} class="page-btn page-prev" ${current_page <= 1 ? "disabled" : ""}><span class="material-symbols-outlined">chevron_left</span></button>`;
    const rightButtonHTML = `<button data-page=${Math.min(current_page+1, total_pages)} class="page-btn page-next" ${current_page >= total_pages ? "disabled" : ""}><span class="material-symbols-outlined">chevron_right</span></button>`;
    const dottedButtonHTML = `<span class="page-dots">…</span>`;

    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    paginationContainer.insertAdjacentHTML("beforeend", leftButtonHTML);

    if (total_pages <= 6) {
        for (let i = 1; i <= total_pages; i++) 
            paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${i} class="page-btn ${i === current_page && "active"}">${i}</button>`)
    } else {        
        if (current_page <= 3) {

            for (let i = 1; i <= current_page + 2; i++) 
                paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${i} class="page-btn ${i === current_page && "active"}">${i}</button>`)                
            paginationContainer.insertAdjacentHTML("beforeend", dottedButtonHTML);
            paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${total_pages} class="page-btn">${total_pages}</button>`);

        } else if (current_page >= total_pages - 2) {

            paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${1} class="page-btn">1</button>`);
            paginationContainer.insertAdjacentHTML("beforeend", dottedButtonHTML);
            for (let i = total_pages-4; i <= total_pages; i++) 
                paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${i} class="page-btn ${i === current_page && "active"}">${i}</button>`)

        } else {

            paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${1} class="page-btn">1</button>`);
            paginationContainer.insertAdjacentHTML("beforeend", dottedButtonHTML);

            for (let i = current_page -2; i <= current_page + 2; i++) 
                paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${i} class="page-btn ${i === current_page && "active"}">${i}</button>`)

            paginationContainer.insertAdjacentHTML("beforeend", dottedButtonHTML);
            paginationContainer.insertAdjacentHTML("beforeend", `<button data-page=${total_pages} class="page-btn">${total_pages}</button>`);
        }
    }

    paginationContainer.insertAdjacentHTML("beforeend", rightButtonHTML);
}


export async function fetchAndRenderLocations() {
    const params = new URLSearchParams(window.location.search);
    const page  = params.get('page') ? Number(params.get('page')) : 1
    const query = params.get('query') ?? "";

    const result = await fetchSearchedLocations(page, query);
    searchedLocations = result.searched_locations;
    total_pages = result.pages;

    renderLocations(result.searched_locations);
    renderPagination(page);
}









// ================= EVENT LISTENERS ======================



document.body.addEventListener("click", startButtonLocationCardHandler);


paginationContainer?.addEventListener("click", (event) => {
    let target = event.target as HTMLElement;
    if (!target.closest(".page-btn")) return;
    target = target.closest(".page-btn") as HTMLElement;

    const newPage = Number(target.dataset.page);
    if (!newPage || Number.isNaN(newPage)) return;

    updateURL(newPage, new URLSearchParams(window.location.search).get('query') ?? "");
    fetchAndRenderLocations();
});

window.addEventListener('popstate', fetchAndRenderLocations);