/* session-user.js - loads authenticated user profile and binds it to UI */

(function () {
  function pct(numerator, denominator) {
    if (!denominator || denominator <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
  }

  function getMergedUser(baseUser) {
    const localProgress = window.GoHabit?.getProgress?.() || { points: 0, coins: 0 };
    // Once local progress starts, prefer it so unchecking habits can reduce XP/coins.
    const hasLocalProgress = localProgress?.startedAt != null;
    const points = hasLocalProgress
      ? Math.max(0, Number(localProgress.points || 0))
      : Math.max(Number(baseUser?.points || 0), Number(localProgress.points || 0));
    const coins = hasLocalProgress
      ? Math.max(0, Number(localProgress.coins || 0))
      : Math.max(Number(baseUser?.coins || 0), Number(localProgress.coins || 0));
    let levFromPts = 1;
    let xpTarg = 50;
    let currentP = points;
    while (currentP >= xpTarg) {
      currentP -= xpTarg;
      levFromPts++;
      xpTarg += 50;
    }
    const level = Math.max(Number(baseUser?.level || 1), levFromPts);

    return {
      ...baseUser,
      points,
      coins,
      level,
    };
  }

  function getWeekProgress() {
    const habits = window.GoHabit?.ensureDefaultHabits?.() || [];
    const habitsState = window.GoHabit?.getHabitsState?.() || {};
    const days = [];
    const now = new Date();

    function isScheduledForDate(habit, date) {
      const freq = Array.isArray(habit?.frecuencia) ? habit.frecuencia : [];
      if (!freq.length) return true;
      return freq.includes(date.getDay());
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = window.GoHabit?.todayKey?.(d);
      const doneMap = habitsState?.[key] || {};
      const dueHabits = habits.filter((h) => isScheduledForDate(h, d));
      const doneCount = dueHabits.filter((h) => !!doneMap[String(h.id)]).length;
      const dueCount = dueHabits.length;
      const ratio = dueCount ? doneCount / dueCount : 0;
      days.push({ key, date: d, doneCount, dueCount, ratio });
    }

    return { habits, days };
  }

  function bindProgressWidgets(user) {
    const { habits, days } = getWeekProgress();
    const today = days[days.length - 1] || { doneCount: 0, ratio: 0 };

    const overallPct = pct(today.doneCount, habits.length || 0);
    document.querySelectorAll('.index-progress-card__percentage').forEach((el) => {
      el.textContent = `${overallPct}%`;
    });
    document.querySelectorAll('.index-progress-card__bar-fill').forEach((el) => {
      el.style.width = `${overallPct}%`;
    });

    let curLevel = 1;
    let xpTarget = 50;
    let xpRemaining = Number(user?.points || 0);
    while (xpRemaining >= xpTarget) {
      xpRemaining -= xpTarget;
      curLevel++;
      xpTarget += 50;
    }
    const xpCurrent = xpRemaining;
    const xpPct = pct(xpCurrent, xpTarget);

    const xpValue = document.querySelector('.habitos-xp-value');
    if (xpValue) xpValue.textContent = `${Math.floor(xpCurrent)} / ${xpTarget} XP`;

    const xpFill = document.querySelector('.habitos-xp-fill');
    if (xpFill) xpFill.style.width = `${xpPct}%`;

    const streakValue = document.querySelector('[data-user-streak]');
    if (streakValue) {
      let streak = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].doneCount > 0) streak += 1;
        else break;
      }
      streakValue.textContent = String(streak);
    }

    const bars = document.querySelectorAll('.perfil-progress-chart__bar');
    if (bars.length === days.length) {
      bars.forEach((bar, idx) => {
        const ratio = Math.max(0, Math.min(1, days[idx].ratio || 0));
        const h = 12 + Math.round(ratio * 78);
        bar.style.height = `${h}%`;
        bar.style.backgroundColor = ratio > 0 ? '#22c55e' : 'rgba(34, 197, 94, 0.2)';
        bar.classList.toggle('perfil-progress-chart__bar--active', idx === days.length - 1);
        bar.classList.toggle('perfil-progress-chart__bar--inactive', idx !== days.length - 1);
      });
    }

    const labelEls = document.querySelectorAll('.perfil-progress-chart__labels span');
    const weekdayShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    if (labelEls.length === days.length) {
      labelEls.forEach((el, idx) => {
        const d = days[idx]?.date;
        el.textContent = d ? weekdayShort[d.getDay()] : '-';
      });
    }
  }

  function pickDisplayName(user) {
    if (!user) return "Usuario";
    const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return full || user.username || user.email || "Usuario";
  }

  function bindUser(user, { skipName = false } = {}) {
    const displayName = pickDisplayName(user);
    // Nombre de saludo: usa username (identificador único de cuenta).
    // Si no hay username, cae a firstName. Nunca usa datos de caché que pueden
    // pertenecer a otra cuenta de prueba (ej. residuos de sesiones anteriores).
    const firstName = (user?.username || user?.firstName || "Usuario").trim();

    if (!skipName) {
      document.querySelectorAll("[data-user-full-name]").forEach((el) => {
        el.textContent = displayName;
      });

      document.querySelectorAll("[data-user-first-name]").forEach((el) => {
        el.textContent = firstName;
      });

      // Fallback for any old static heading markup still cached in some templates.
      const indexTitle = document.querySelector('.index-header__title');
      if (indexTitle) {
        indexTitle.textContent = `Hola, ${firstName}`;
      }
    }

    document.querySelectorAll("[data-user-email]").forEach((el) => {
      el.textContent = user?.email || "sin-email";
    });

    document.querySelectorAll("[data-user-username]").forEach((el) => {
      el.textContent = user?.username || "sin-usuario";
    });

    document.querySelectorAll("[data-user-level]").forEach((el) => {
      el.textContent = String(user?.level ?? 1);
    });

    document.querySelectorAll("[data-user-points]").forEach((el) => {
      el.textContent = String(user?.points ?? 0);
    });

    document.querySelectorAll("[data-user-coins]").forEach((el) => {
      el.textContent = String(user?.coins ?? 0);
    });

    // Keep seed counter aligned with merged user coins.
    if (window.GoHabit?.setSeeds) {
      window.GoHabit.setSeeds(Number(user?.coins ?? 0));
    }
    document.querySelectorAll("[data-seeds]").forEach((el) => {
      el.textContent = Number(user?.coins ?? 0).toLocaleString("es-ES");
    });

    const avatarSrc = user?.avatarUrl || localStorage.getItem('gohabit_avatar_url') || null;
    if (avatarSrc) {
      document.querySelectorAll('[data-user-avatar]').forEach((el) => {
        el.style.backgroundImage = `url('${avatarSrc}')`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        const placeholder = el.querySelector('.perfil-avatar__placeholder');
        if (placeholder) placeholder.style.display = 'none';
      });
    }

    bindProgressWidgets(user);
  }

  async function loadCurrentUser() {
    if (!window.GoHabitAPI) return;

    const token = window.GoHabitAPI.getToken();
    if (!token) return;

    const cached = window.GoHabitAPI.getSessionUser();
    if (cached) {
      // skipName: true — no mostrar nombre de la caché; puede ser de otra cuenta de prueba.
      // El nombre solo se actualiza cuando la API confirma el usuario real (más abajo).
      bindUser(getMergedUser(cached), { skipName: true });
    }

    try {
      const response = await window.GoHabitAPI.get("/auth/me");
      const profile = response?.data;
      if (!profile) return;

      const merged = getMergedUser(profile);

      // Sincronización PROFUNDA: si los puntos localmente son mayores que en el servidor, 
      // actualizamos el servidor para que el resto de usuarios (y el muro social) vean el nivel real.
      if (merged.points > Number(profile.points || 0) || merged.coins > Number(profile.coins || 0)) {
        console.log("[Sync] Empujando progreso local al servidor...", merged);
        try {
          await window.GoHabitAPI.put('/users/profile', {
            points: merged.points,
            coins: merged.coins,
            level: merged.level
          });
        } catch (syncErr) {
          console.warn("[Sync] Error al sincronizar stats con el servidor:", syncErr);
        }
      }

      window.GoHabitAPI.setSession(token, merged);
      bindUser(merged);

      // Sincronizar hábitos desde el servidor para compartir entre dispositivos
      try {
        if (window.GoHabit) {
          const localHabits = window.GoHabit.getHabitsList() || [];
          const mergedHabits = [...localHabits];
          let hasNewUploads = false;

          // 1. Upload any old local habits that don't have a backendId yet
          for (let i = 0; i < mergedHabits.length; i++) {
            if (!mergedHabits[i].backendId) {
              try {
                console.log("[Sync] Pushing viejo hábito local al servidor...", mergedHabits[i].titulo);
                const isHex = /^#[0-9a-fA-F]{6}$/.test(mergedHabits[i].color);
                const res = await window.GoHabitAPI.post('/habits', {
                  title: mergedHabits[i].titulo,
                  frequency: (mergedHabits[i].frecuencia || []).join(','),
                  targetCount: mergedHabits[i].metaValor || 1,
                  ...(isHex ? { color: mergedHabits[i].color } : {}),
                  icon: mergedHabits[i].icono || 'star'
                });
                if (res?.data?.id) {
                  mergedHabits[i].backendId = res.data.id;
                  hasNewUploads = true;
                }
              } catch (e) {
                console.warn('Failed to push old habit:', e);
              }
            }
          }

          if (hasNewUploads) {
            window.GoHabit.setHabitsList(mergedHabits);
          }

          // 2. Fetch server habits and merge as normal
          const habitsRes = await window.GoHabitAPI.get('/habits');
          const serverHabits = habitsRes?.data || [];

          for (const sh of serverHabits) {
            let frequency = [];
            if (sh.frequency && sh.frequency !== 'DAILY' && sh.frequency !== 'WEEKLY' && sh.frequency !== 'MONTHLY') {
              frequency = sh.frequency.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            }
            if (frequency.length === 0) frequency = [1, 2, 3, 4, 5];

            const existingIdx = mergedHabits.findIndex(lh => lh.backendId === sh.id);
            if (existingIdx >= 0) {
              mergedHabits[existingIdx].titulo = sh.title;
              mergedHabits[existingIdx].color = sh.color;
              mergedHabits[existingIdx].icono = sh.icon;
            } else {
              const nextLocalId = mergedHabits.length ? Math.max(...mergedHabits.map(h => Number(h.id) || 0)) + 1 : 1;
              mergedHabits.push({
                id: nextLocalId,
                backendId: sh.id,
                titulo: sh.title,
                categoria: 'salud',
                etiqueta: 'Progreso',
                icono: sh.icon || 'star',
                color: sh.color || 'primary',
                reward: 15,
                frecuencia: frequency,
                metaValor: sh.targetCount || 1,
                metaUnidad: 'veces',
                recordatorio: false,
                creadoEn: Date.now()
              });
            }
          }
          window.GoHabit.setHabitsList(mergedHabits);
          // Notificar a las páginas que ya tienen la UI pintada (ej: habitos.js)
          // para que re-rendericen con los hábitos recién descargados del servidor.
          window.dispatchEvent(new CustomEvent('gohabit:habits-synced', { detail: { habits: mergedHabits } }));
        }
      } catch (syncHabitsErr) {
        console.warn("[Sync] Error sync habits:", syncHabitsErr);
      }

    } catch (err) {
      console.warn("No se pudo cargar /auth/me", err?.message || err);
      if (err?.status === 401 && !window.location.pathname.includes('login.html')) {
        window.GoHabitAPI.clearSession();
        window.location.href = "login.html";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", loadCurrentUser);
})();
