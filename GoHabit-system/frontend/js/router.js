/* router.js - keeps template navigation and auth flow consistent */

(function () {
  const TOKEN_KEY = "gohabit_token";
  const USER_KEY = "gohabit_user";
  const ONBOARDING_KEY = "gohabit_onboarding_pending";

  const PUBLIC_PAGES = new Set(["login.html", "registro.html"]);
  const ONBOARDING_PAGE = "onboarding-ia.html";
  const HOME_PAGE = "index.html";

  const page = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const token = localStorage.getItem(TOKEN_KEY);
  const onboardingPending = localStorage.getItem(ONBOARDING_KEY) === "1";

  function redirect(pageName) {
    if (page !== pageName) {
      window.location.replace(pageName);
    }
  }

  function enforceRouteGuards() {
    if (!token && !PUBLIC_PAGES.has(page)) {
      redirect("login.html");
      return;
    }

    if (token && PUBLIC_PAGES.has(page)) {
      redirect(onboardingPending ? ONBOARDING_PAGE : HOME_PAGE);
      return;
    }

    if (token && onboardingPending && !PUBLIC_PAGES.has(page) && page !== ONBOARDING_PAGE) {
      redirect(ONBOARDING_PAGE);
      return;
    }

    if (token && page === ONBOARDING_PAGE && !onboardingPending) {
      redirect(HOME_PAGE);
    }
  }

  function wireLogout() {
    document.querySelectorAll("[data-logout]").forEach((el) => {
      el.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
          if (window.GoHabitAPI) {
            try {
              await window.GoHabitAPI.post("/auth/logout", {});
            } catch {
              // Ignore API logout failure; local cleanup still logs the user out.
            }
            window.GoHabitAPI.clearSession();
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } finally {
          localStorage.setItem(ONBOARDING_KEY, "0");
          window.location.href = "login.html";
        }
      });
    });
  }

  enforceRouteGuards();
  document.addEventListener("DOMContentLoaded", wireLogout);
})();
