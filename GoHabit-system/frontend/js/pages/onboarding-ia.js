document.addEventListener("DOMContentLoaded", () => {
    const token = window.GoHabitAPI.getToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const form = document.getElementById("ai-onboarding-form");
    const textarea = document.getElementById("ai-message");
    const errorEl = document.getElementById("ai-message-error");
    const results = document.getElementById("ai-results");
    const list = document.getElementById("ai-suggestions-list");
    const skipBtn = document.getElementById("ai-skip");
    const continueBtn = document.getElementById("ai-continue");

    const goToHome = () => {
        localStorage.setItem("gohabit_onboarding_pending", "0");
        window.location.href = "index.html";
    };

    skipBtn.addEventListener("click", goToHome);
    continueBtn.addEventListener("click", goToHome);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = textarea.value.trim();

        errorEl.textContent = "";
        if (!message) {
            errorEl.textContent = "Escribe algo sobre tus habitos o retos diarios.";
            return;
        }

        const submitBtn = form.querySelector("button[type='submit']");

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Generando sugerencias...";

            const response = await window.GoHabitAPI.post("/ai/recommend", { message });
            const suggestions = response?.data?.suggestions || [];

            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                errorEl.textContent = "No pude generar sugerencias ahora mismo.";
                return;
            }

            list.innerHTML = suggestions
                .map((item) => {
                    const title = item?.title || "Habito recomendado";
                    const reason = item?.reason || "Este habito puede ayudarte a mantener constancia.";
                    const frequency = item?.frequency || "Frecuencia flexible";
                    return `
                        <article class="ai-suggestion">
                          <h3>${title}</h3>
                          <p>${reason}</p>
                          <p><strong>Frecuencia:</strong> ${frequency}</p>
                        </article>
                    `;
                })
                .join("");

            results.hidden = false;
        } catch (err) {
            errorEl.textContent = err?.message || "No se pudieron obtener sugerencias.";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Pedir sugerencias";
        }
    });
});
