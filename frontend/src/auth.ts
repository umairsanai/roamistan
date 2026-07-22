/// <reference types="vite/client" />
import { goToDashboardPage, request, showError } from "./helpers.js";
import { closeAllCustomSelects, initializeCustomSelects } from "./authDropdown.js";

const loginForm = document.getElementById('formLogin');
const signupForm = document.getElementById('formSignup');
const forgotPasswordForm = document.getElementById('formForgotPassword');
const resetPasswordForm = document.getElementById('formResetPassword');
const loginModeBtn = document.getElementById('btnLogin');
const signupModeBtn = document.getElementById('btnSignup');
const forgotPasswordBtn = document.getElementById('btnForgotPassword');
const backToLoginBtn = document.getElementById('btnBackToLogin');
const backToLoginFromResetBtn = document.getElementById('btnBackToLoginFromReset');
const authModeToggle = document.querySelector<HTMLElement>('.toggle-group');
const oauthButton = document.querySelector(".btn-oauth");
const passwordToggleButtons = document.querySelectorAll<HTMLButtonElement>("[data-password-toggle]");
const forgotPasswordMessage = document.getElementById('forgotPasswordMessage');

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

const modeTitles: Record<AuthMode, string> = {
    "login": "Login",
    "signup": "Signup",
    "forgot-password": "Forgot Password",
    "reset-password": "Reset Password"
};

const resetToken = new URLSearchParams(window.location.search).get("token")?.trim() || null;
let mode: AuthMode = resetToken ? "reset-password" : "login";

if (resetToken)
    window.history.replaceState({}, document.title, window.location.pathname);


function switchMode(nextMode: AuthMode) {
    const indicator = document.getElementById('toggleIndicator');
    closeAllCustomSelects();

    mode = nextMode;

    [loginForm, signupForm, forgotPasswordForm, resetPasswordForm].forEach(form => {
        form?.classList.toggle('hidden', form.dataset.authMode !== mode);
    });

    const isLoginOrSignup = mode === "login" || mode === "signup";
    authModeToggle?.classList.toggle('hidden', !isLoginOrSignup);
    loginModeBtn?.classList.toggle('active', mode === "login");
    loginModeBtn?.classList.toggle('inactive', mode !== "login");
    signupModeBtn?.classList.toggle('active', mode === "signup");
    signupModeBtn?.classList.toggle('inactive', mode !== "signup");
    document.title = `Roamistan · ${modeTitles[mode]}`;

    if (mode === 'login' && indicator)
        indicator.style.transform = 'translateX(0)';
    else if (mode === 'signup' && indicator)
        indicator.style.transform = 'translateX(100%)';
}


async function validateLogin(e: Event) {
    e.preventDefault();

    const email = (document.getElementById("loginEmail") as HTMLInputElement).value.trim();
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

    const name = (document.getElementById("signupName") as HTMLInputElement).value.trim();
    const email = (document.getElementById("signupEmail") as HTMLInputElement).value.trim();
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

async function validateForgotPassword(e: Event) {
    e.preventDefault();

    const email = (document.getElementById("forgotEmail") as HTMLInputElement).value.trim();

    await request(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
            "Content-type": "application/json"
        }
    });

    if (forgotPasswordMessage) {
        forgotPasswordMessage.textContent = "If an account exists for this email, you'll receive reset instructions shortly.";
        forgotPasswordMessage.classList.remove("hidden");
    }
}

async function validateResetPassword(e: Event) {
    e.preventDefault();

    if (!resetToken)
        throw new Error("This password reset link is invalid or has expired.");

    const password = (document.getElementById("resetPassword") as HTMLInputElement).value;
    const passwordConfirmation = (document.getElementById("resetPasswordConfirmation") as HTMLInputElement).value;

    if (password !== passwordConfirmation)
        throw new Error("Passwords do not match.");

    await request(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ token: resetToken, password }),
        headers: {
            "Content-type": "application/json"
        }
    });
}

async function handleFormSubmit(form: HTMLFormElement, handler: (e: Event) => Promise<void>, e: Event) {
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
        await handler(e);
    } catch (error: any) {
        showError(error.message);
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

async function loginEventHandler(e: Event) {
    await validateLogin(e);
    goToDashboardPage();
}

async function signupEventHandler(e: Event) {
    await validateSignup(e);
    goToDashboardPage();
}

async function resetPasswordEventHandler(e: Event) {
    await validateResetPassword(e);
    goToDashboardPage();
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
    button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
}


// ==========    EVENT LISTENERS    ==========


loginModeBtn?.addEventListener("click", () => switchMode("login"));
signupModeBtn?.addEventListener("click", () => switchMode("signup"));
forgotPasswordBtn?.addEventListener("click", () => switchMode("forgot-password"));
backToLoginBtn?.addEventListener("click", () => switchMode("login"));
backToLoginFromResetBtn?.addEventListener("click", () => switchMode("login"));
loginForm?.addEventListener("submit", e => handleFormSubmit(loginForm as HTMLFormElement, loginEventHandler, e));
signupForm?.addEventListener("submit", e => handleFormSubmit(signupForm as HTMLFormElement, signupEventHandler, e));
forgotPasswordForm?.addEventListener("submit", e => handleFormSubmit(forgotPasswordForm as HTMLFormElement, validateForgotPassword, e));
resetPasswordForm?.addEventListener("submit", e => handleFormSubmit(resetPasswordForm as HTMLFormElement, resetPasswordEventHandler, e));
oauthButton?.addEventListener("click", () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
});
passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", () => togglePasswordVisibility(button));
});
initializeCustomSelects();
switchMode(mode);
