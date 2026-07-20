export type SkeletonTemplate = (index: number) => string;

export function renderSkeletons(
    container: Element | null,
    template: SkeletonTemplate,
    count: number
) {
    if (!container) return;

    container.innerHTML = Array.from({ length: count }, (_, index) => template(index)).join("");
}

export function removeSkeletons(container: Element | null) {
    if (!container) return;
    container.innerHTML = "";
}

export function initializeSkeletons(root: ParentNode = document) {
    root.querySelectorAll<HTMLElement>("[data-skeleton-rating]").forEach(container => {
        if (!container.children.length) {
            container.innerHTML = ratingSkeleton();
        }
    });

    hydrateSkeletonImages(root);
}

export function resolveSkeletons(root: ParentNode = document) {
    resolveTextSkeletons(root);
    root.querySelectorAll<HTMLElement>("[data-skeleton-panorama]")
        .forEach(element => element.classList.add("skeleton-ready"));

    hydrateSkeletonImages(root);
}

export function resolveTextSkeletons(root: ParentNode = document) {
    root.querySelectorAll<HTMLElement>("[data-skeleton-text], [data-skeleton-rating]")
        .forEach(element => element.classList.add("skeleton-ready"));

    root.querySelectorAll<HTMLElement>("[data-skeleton-rating] .skeleton-rating-star")
        .forEach(element => element.remove());

    hydrateSkeletonImages(root);
}

export function hydrateSkeletonImages(root: ParentNode = document) {
    root.querySelectorAll<HTMLImageElement>("img[data-skeleton-image]").forEach(image => {
        if (!image.getAttribute("src")) return;
        if (image.dataset.skeletonBound === "true") return;

        image.dataset.skeletonBound = "true";
        const finish = (failed = false) => {
            const wrapper = image.closest<HTMLElement>("[data-skeleton-image-wrapper]") ?? image.parentElement;
            wrapper?.classList.add("is-image-loaded");
            if (failed) wrapper?.classList.add("is-image-error");
        };

        image.addEventListener("load", () => finish(), { once: true });
        image.addEventListener("error", () => finish(true), { once: true });

        if (image.complete) finish(image.naturalWidth === 0);
    });
}

export function revealSkeletonImage(image: HTMLImageElement | null) {
    if (!image) return;
    const wrapper = image.closest<HTMLElement>("[data-skeleton-image-wrapper]") ?? image.parentElement;
    wrapper?.classList.add("is-image-loaded");
}

export function locationCardSkeleton(showRating = true): string {
    return `<div class="fav-card skeleton-card">
        <div class="img-wrap"><div class="skeleton skeleton-media"></div></div>
        <div class="card-body">
            <span class="skeleton skeleton-text skeleton-card-title"></span>
            <span class="skeleton-inline"><span class="skeleton skeleton-icon"></span><span class="skeleton skeleton-text skeleton-card-location"></span></span>
            ${showRating ? `<span class="skeleton-inline skeleton-card-rating"><span class="skeleton skeleton-icon"></span><span class="skeleton skeleton-text skeleton-card-rating-value"></span><span class="skeleton skeleton-text skeleton-card-views"></span></span>` : ""}
            <span class="skeleton skeleton-button"></span>
        </div>
    </div>`;
}

export function searchCardSkeleton(): string {
    return `<article class="card skeleton-card skeleton-search-card">
        <div class="card-img"><div class="skeleton skeleton-media"></div></div>
        <div class="card-body">
            <span class="skeleton skeleton-text skeleton-search-title"></span>
            <span class="skeleton-inline"><span class="skeleton skeleton-icon"></span><span class="skeleton skeleton-text skeleton-search-location"></span></span>
            <span class="skeleton skeleton-text skeleton-search-description"></span>
            <span class="skeleton skeleton-text skeleton-search-description skeleton-search-description-short"></span>
            <span class="skeleton skeleton-button"></span>
        </div>
    </article>`;
}

export function packageCardSkeleton(): string {
    return `<div class="package-card skeleton-card">
        <div class="package-img"><div class="skeleton skeleton-media"></div></div>
        <div class="package-content">
            <span class="skeleton skeleton-text skeleton-package-title"></span>
            <span class="skeleton skeleton-text skeleton-package-provider"></span>
            <span class="skeleton skeleton-text skeleton-package-price"></span>
        </div>
        <span class="skeleton skeleton-icon skeleton-package-arrow"></span>
    </div>`;
}

export function adCardSkeleton(): string {
    return `<div class="tour-card skeleton-card">
        <div class="tour-card-img"><div class="skeleton skeleton-media"></div></div>
        <div class="card-body">
            <div class="skeleton-card-header"><span class="skeleton skeleton-text skeleton-ad-title"></span><span class="skeleton skeleton-text skeleton-ad-price"></span></div>
            <span class="skeleton skeleton-text skeleton-ad-description"></span>
            <span class="skeleton skeleton-text skeleton-ad-description skeleton-ad-description-short"></span>
            <span class="skeleton skeleton-button"></span>
        </div>
    </div>`;
}

export function bookmarkCardSkeleton(): string {
    return `<div class="fav-item skeleton-card">
        <div class="fav-img"><div class="skeleton skeleton-media"></div></div>
        <div class="fav-body">
            <div class="skeleton-card-header"><span class="skeleton skeleton-text skeleton-bookmark-title"></span><span class="skeleton skeleton-icon"></span></div>
            <span class="skeleton skeleton-text skeleton-bookmark-description"></span>
            <span class="skeleton skeleton-text skeleton-bookmark-description skeleton-bookmark-description-short"></span>
            <div class="skeleton-card-footer"><span class="skeleton skeleton-text skeleton-bookmark-location"></span><span class="skeleton skeleton-button skeleton-bookmark-button"></span></div>
        </div>
    </div>`;
}

function ratingSkeleton(): string {
    return Array.from({ length: 5 }, () => `<span class="skeleton skeleton-rating-star"></span>`).join("");
}
