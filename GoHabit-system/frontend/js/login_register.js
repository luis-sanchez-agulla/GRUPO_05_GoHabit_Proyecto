document.addEventListener("DOMContentLoaded", () => {
    const ONBOARDING_KEY = "gohabit_onboarding_pending";
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const setFieldError = (inputId, message) => {
        const errorEl = document.getElementById(`${inputId}-error`);
        if (!errorEl) return;
        errorEl.textContent = message || "";
        errorEl.style.display = message ? "block" : "none";
    };

    const redirectAfterAuth = ({ forceOnboarding = false } = {}) => {
        if (forceOnboarding) {
            localStorage.setItem(ONBOARDING_KEY, "1");
        } else {
            // Login should never force onboarding for returning users.
            localStorage.setItem(ONBOARDING_KEY, "0");
        }

        const pending = localStorage.getItem(ONBOARDING_KEY) === "1";
        window.location.href = pending ? "onboarding-ia.html" : "index.html";
    };

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email")?.value?.trim() || "";
            const password = document.getElementById("login-password")?.value || "";
            const submitBtn = loginForm.querySelector("button[type='submit']");

            setFieldError("login-email", !email ? "El email es obligatorio" : "");
            setFieldError("login-password", !password ? "La contrasena es obligatoria" : "");

            if (!email || !password) return;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Iniciando sesion...";

                const response = await window.GoHabitAPI.post("/auth/login", { email, password });
                window.GoHabitAPI.setSession(response.data.token, response.data.user);
                redirectAfterAuth();
            } catch (err) {
                const message = err?.message || "Credenciales invalidas";
                setFieldError("login-password", message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Iniciar sesion";
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const firstName = document.getElementById("register-firstname")?.value?.trim() || "";
            const lastName = document.getElementById("register-lastname")?.value?.trim() || "";
            const email = document.getElementById("register-email")?.value?.trim() || "";
            const username = document.getElementById("register-username")?.value?.trim() || "";
            const password = document.getElementById("register-password")?.value || "";
            const confirmPassword = document.getElementById("register-confirm-password")?.value || "";
            const submitBtn = registerForm.querySelector("button[type='submit']");

            setFieldError("register-firstname", !firstName ? "El nombre es obligatorio" : "");
            setFieldError("register-email", !email ? "El email es obligatorio" : "");
            setFieldError("register-username", !username ? "El usuario es obligatorio" : "");
            setFieldError("register-password", !password ? "La contrasena es obligatoria" : "");
            setFieldError(
                "register-confirm-password",
                password !== confirmPassword ? "Las contrasenas no coinciden" : ""
            );

            if (!firstName || !email || !username || !password || password !== confirmPassword) return;

            const payload = {
                firstName,
                lastName,
                email,
                username,
                password,
            };

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Creando cuenta...";

                const response = await window.GoHabitAPI.post("/auth/register", payload);
                window.GoHabitAPI.setSession(response.data.token, response.data.user);
                redirectAfterAuth({ forceOnboarding: true });
            } catch (err) {
                const details = err?.details;
                if (details && typeof details === "object") {
                    const fieldMap = {
                        firstName: "register-firstname",
                        lastName: "register-lastname",
                        email: "register-email",
                        username: "register-username",
                        password: "register-password",
                    };
                    let anyMapped = false;
                    for (const [field, inputId] of Object.entries(fieldMap)) {
                        if (details[field]?.length) {
                            setFieldError(inputId, details[field][0]);
                            anyMapped = true;
                        }
                    }
                    if (!anyMapped) {
                        setFieldError("register-email", err?.message || "No se pudo crear la cuenta");
                    }
                } else {
                    setFieldError("register-email", err?.message || "No se pudo crear la cuenta");
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Crear cuenta";
            }
        });
    }
});