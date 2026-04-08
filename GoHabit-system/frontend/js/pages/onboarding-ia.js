document.addEventListener("DOMContentLoaded", () => {
    const WEEKDAY_TO_INDEX = {
        domingo: 0,
        lunes: 1,
        martes: 2,
        miercoles: 3,
        miércoles: 3,
        jueves: 4,
        viernes: 5,
        sabado: 6,
        sábado: 6,
    };

    const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (ch) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    }[ch]));

    const normalizeDays = (days) => Array.from(new Set((Array.isArray(days) ? days : [])
        .map((day) => String(day || "").trim())
        .filter(Boolean)));

    const daysToFrequency = (days) => normalizeDays(days)
        .map((day) => {
            const key = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return WEEKDAY_TO_INDEX[key];
        })
        .filter((value) => typeof value === "number");

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

    const renderSuggestion = (item) => {
        const title = item?.title || "Habito recomendado";
        const reason = item?.reason || "Este habito puede ayudarte a mantener constancia.";
        const frequency = item?.frequency || "Frecuencia flexible";
        const recommendedDays = normalizeDays(item?.recommendedDays);
        const scheduleHint = item?.scheduleHint || frequency;
        const daysLabel = recommendedDays.length ? recommendedDays.join(", ") : scheduleHint;
        const icon = item?.icon || "task_alt";

        return `
            <article class="ai-suggestion">
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(reason)}</p>
              <p><strong>Frecuencia:</strong> ${escapeHtml(frequency)}</p>
              <p><strong>Días recomendados:</strong> ${escapeHtml(daysLabel)}</p>
                            <p><strong>XP sugerida:</strong> ${escapeHtml(String(item?.xpReward || 10))}</p>
              <button
                type="button"
                class="ai-suggestion__add"
                data-title="${escapeHtml(title)}"
                data-icon="${escapeHtml(icon)}"
                data-days="${escapeHtml(recommendedDays.join("|"))}"
                                data-xp="${escapeHtml(String(item?.xpReward || 10))}"
              >Añadir a mi plan</button>
            </article>
        `;
    };

    const bindAddButtons = () => {
        document.querySelectorAll(".ai-suggestion__add").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (!window.GoHabit?.addHabit) return;

                const title = btn.dataset.title || "Nuevo hábito";
                const icono = btn.dataset.icon || "task_alt";
                const days = (btn.dataset.days || "").split("|").filter(Boolean);
                const frecuencia = daysToFrequency(days);
                const xpReward = Number(btn.dataset.xp || 10);

                const created = window.GoHabit.addHabit({
                    titulo: title,
                    icono,
                    categoria: "salud",
                    etiqueta: "salud",
                    reward: xpReward,
                    frecuencia: frecuencia.length ? frecuencia : [1, 3, 5],
                });

                if (!created || created.error) {
                    window.GoHabit.toast(created?.message || `Máximo ${window.GoHabit.getHabitLimitPerDay()} hábitos por día.`, "bad", { icon: "warning" });
                    return;
                }

                btn.textContent = "Añadido";
                btn.disabled = true;
                window.GoHabit.toast(`Hábito añadido: ${created.titulo}`, "good", { icon: "eco" });
            });
        });
    };

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

            list.innerHTML = suggestions.map(renderSuggestion).join("");

            results.hidden = false;
            bindAddButtons();
        } catch (err) {
            errorEl.textContent = err?.message || "No se pudieron obtener sugerencias.";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Pedir sugerencias";
        }
    });
});
