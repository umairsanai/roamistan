/// <reference types="vite/client" />
import { goToDashboardPage, request, showError } from "./helpers.js";
import { closeAllCustomSelects, initializeCustomSelects } from "./authDropdown.js";

const loginForm = document.getElementById('formLogin');
const signupForm = document.getElementById('formSignup');
const loginModeBtn = document.getElementById('btnLogin');
const signupModeBtn = document.getElementById('btnSignup');
const loginSubmitBtn = document.querySelector(".login-submit-btn");
const signupSubmitBtn = document.querySelector(".signup-submit-btn");
const oauthButton = document.querySelector(".btn-oauth");
const passwordToggleButtons = document.querySelectorAll<HTMLButtonElement>("[data-password-toggle]");
const oppositeMode = new Map([["signup", "login"], ["login", "signup"]]);
let mode = "login";


function switchMode() {
    const indicator = document.getElementById('toggleIndicator');
    closeAllCustomSelects();

    loginForm?.classList.toggle('hidden');
    signupForm?.classList.toggle('hidden');
    signupModeBtn?.classList.toggle('active');
    signupModeBtn?.classList.toggle('inactive');
    loginModeBtn?.classList.toggle('active');
    loginModeBtn?.classList.toggle('inactive');
    mode = oppositeMode.get(mode)!;
    document.title = `Roamistan · ${mode[0].toUpperCase() + mode.toLowerCase().slice(1)}`;

    if (mode === 'login' && indicator)
        indicator.style.transform = 'translateX(0)';
    else if (indicator)
        indicator.style.transform = 'translateX(100%)';
}


async function validateLogin(e: Event) {
    e.preventDefault();

    const email = (document.getElementById("loginEmail") as HTMLInputElement).value;
    const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

    await request(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password}),
        headers: {
            "Content-type": "application/json"
        }
    });
}

async function validateSignup(e: Event) {
    e.preventDefault();

    const name = (document.getElementById("signupName") as HTMLInputElement).value;
    const email = (document.getElementById("signupEmail") as HTMLInputElement).value;
    const city = (document.querySelector('input[name="city"]') as HTMLInputElement).value;
    const country = (document.querySelector('input[name="country"]') as HTMLInputElement).value;
    const password = (document.getElementById("signupPassword") as HTMLInputElement).value;

    await request(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        body: JSON.stringify({ name, email, city, country, password}),
        headers: {
            "Content-type": "application/json"
        }
    });
}

async function loginEventHandler(e: Event) {
    try {
        await validateLogin(e);
        return goToDashboardPage();
    } catch (error: any) {
        showError(error.message);
    }
}

async function signupEventHandler(e: Event) {
    try {
        await validateSignup(e);
        return goToDashboardPage();
    } catch (error: any) {
        showError(error.message);
    }
}

function togglePasswordVisibility(button: HTMLButtonElement) {
    const targetId = button.dataset.passwordToggle;
    if (!targetId) return;

    const passwordInput = document.getElementById(targetId) as HTMLInputElement | null;
    const icon = button.querySelector(".password-toggle-icon");
    if (!passwordInput || !icon) return;

    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    icon.textContent = isHidden ? "visibility_off" : "visibility";
}


// ==========    EVENT LISTENERS    ==========



loginModeBtn?.addEventListener("click", switchMode);
signupModeBtn?.addEventListener("click", switchMode);
loginSubmitBtn?.addEventListener("click", loginEventHandler);
signupSubmitBtn?.addEventListener("click", signupEventHandler);
document.body.addEventListener("keydown", async (e: KeyboardEvent) => {
    if (e.code !== "Enter") return;
    mode === "signup" ? await signupEventHandler(e) : await loginEventHandler(e);
});
oauthButton?.addEventListener("click", () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
});
passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", () => togglePasswordVisibility(button));
});
initializeCustomSelects();