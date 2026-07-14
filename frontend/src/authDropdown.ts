// ===========    CODEX CODE    ===========

const customSelects = [...document.querySelectorAll<HTMLElement>(".custom-select")];

function closeCustomSelect(selectRoot: HTMLElement) {
    selectRoot.classList.remove("is-open");
    const trigger = selectRoot.querySelector<HTMLButtonElement>(".select-trigger");
    if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
    }
}

export function closeAllCustomSelects(except?: HTMLElement) {
    customSelects.forEach((selectRoot) => {
        if (selectRoot !== except) closeCustomSelect(selectRoot);
    });
}

function openCustomSelect(selectRoot: HTMLElement) {
    closeAllCustomSelects(selectRoot);
    selectRoot.classList.add("is-open");
    const trigger = selectRoot.querySelector<HTMLButtonElement>(".select-trigger");
    if (trigger) {
        trigger.setAttribute("aria-expanded", "true");
    }
}

function setCustomSelectValue(selectRoot: HTMLElement, value: string, optionElement: HTMLButtonElement) {
    const triggerValue = selectRoot.querySelector<HTMLElement>(".select-value");
    const hiddenInput = selectRoot.querySelector<HTMLInputElement>('input[type="hidden"]');
    const options = [...selectRoot.querySelectorAll<HTMLButtonElement>(".select-option")];

    if (hiddenInput) {
        hiddenInput.value = value;
    }

    if (triggerValue) {
        triggerValue.textContent = value;
        triggerValue.classList.remove("select-placeholder");
    }

    options.forEach((option) => {
        const isSelected = option === optionElement;
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    });

    closeCustomSelect(selectRoot);
}

export function initializeCustomSelects() {
    customSelects.forEach((selectRoot) => {
        const trigger = selectRoot.querySelector<HTMLButtonElement>(".select-trigger");
        const options = [...selectRoot.querySelectorAll<HTMLButtonElement>(".select-option")];
        const triggerValue = selectRoot.querySelector<HTMLElement>(".select-value");
        const hiddenInput = selectRoot.querySelector<HTMLInputElement>('input[type="hidden"]');

        if (!trigger || !triggerValue || !hiddenInput) return;

        const initialValue = hiddenInput.value.trim();
        if (initialValue) {
            triggerValue.textContent = initialValue;
            triggerValue.classList.remove("select-placeholder");
        }

        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            const isOpen = selectRoot.classList.contains("is-open");
            if (isOpen) {
                closeCustomSelect(selectRoot);
            } else {
                openCustomSelect(selectRoot);
            }
        });

        options.forEach((option) => {
            const value = option.dataset.value ?? option.textContent?.trim() ?? "";
            option.setAttribute("aria-selected", String(value === initialValue));
            option.classList.toggle("is-selected", value === initialValue);

            option.addEventListener("click", () => {
                setCustomSelectValue(selectRoot, value, option);
            });
        });
    });

    document.addEventListener("click", (event: MouseEvent) => {
        const target = event.target as Node;
        customSelects.forEach((selectRoot) => {
            if (!selectRoot.contains(target)) {
                closeCustomSelect(selectRoot);
            }
        });
    });

    document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            closeAllCustomSelects();
        }
    });
}