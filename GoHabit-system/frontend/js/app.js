/* app.js - shared UI + state helpers for GoHabit (no framework) */

(function () {
  const STORAGE = {
    seeds: 'semillasUsuario',
    habits: 'habitosCompletados',
    habitsList: 'habitosLista',
    progress: 'progresoUsuario',
    cosmeticsInventory: 'inventarioCosmeticos',
    cosmeticsEquipped: 'cosmeticosEquipados',
    theme: 'gohabitTheme',
    level: 'nivelArbol',
  };

  const PET_BONUS = {
    common: { type: 'seeds', pct: 0.05, label: '+5% Semillas' },
    rare:   { type: 'xp',    pct: 0.10, label: '+10% XP' },
    epic:   { type: 'both',  pct: 0.15, label: '+15% Semillas y XP' },
  };

  const CHEST_COSTS = { madera: 80, plata: 180, oro: 320 };

  function getCurrentUserId() {
    try {
      const raw = localStorage.getItem('gohabit_user');
      const user = raw ? JSON.parse(raw) : null;
      return user?.id ? String(user.id) : 'anon';
    } catch {
      return 'anon';
    }
  }

  function storageKey(base) {
    // Theme is global; user progress/state is namespaced per user.
    if (base === STORAGE.theme) return base;
    return `${base}:${getCurrentUserId()}`;
  }

  function todayKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getJSON(key, fallback) {
    try {
      const v = localStorage.getItem(storageKey(key));
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  }

  function setJSON(key, value) {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  }

  function updateProgressCoinsOnSeedChange(coins) {
    const current = getProgress();
    setProgress({
      ...current,
      coins: Math.max(0, Number(coins) || 0),
      startedAt: current.startedAt || Date.now(),
    });
  }

  // Seeds
  function getSeeds() {
    const v = localStorage.getItem(storageKey(STORAGE.seeds));
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }
  function setSeeds(n) {
    const safe = Math.max(0, n | 0);
    localStorage.setItem(storageKey(STORAGE.seeds), String(safe));
    updateProgressCoinsOnSeedChange(safe);
    return safe;
  }
  function addSeeds(delta) { const n = getSeeds() + (delta | 0); return setSeeds(n); }
  function subSeeds(delta) { const n = Math.max(0, getSeeds() - (delta | 0)); return setSeeds(n); }

  // Habits state (per day)
  function getHabitsState() { return getJSON(STORAGE.habits, {}); }
  function getHabitDone(habitId, dateKey = todayKey()) {
    const st = getHabitsState();
    return !!(st?.[dateKey]?.[String(habitId)]);
  }
  function setHabitDone(habitId, done, dateKey = todayKey()) {
    const st = getHabitsState();
    if (!st[dateKey]) st[dateKey] = {};
    st[dateKey][String(habitId)] = !!done;
    setJSON(STORAGE.habits, st);
  }

  function getProgress() {
    const p = getJSON(STORAGE.progress, null);
    if (p && typeof p === 'object') return p;
    return {
      points: 0,
      coins: getSeeds(),
      startedAt: null,
    };
  }

  function setProgress(progress) {
    const safe = {
      points: Math.max(0, Number(progress?.points || 0)),
      coins: Math.max(0, Number(progress?.coins || 0)),
      startedAt: progress?.startedAt || null,
    };
    setJSON(STORAGE.progress, safe);
    return safe;
  }

  function levelFromPoints(points) {
    let currentLevel = 1;
    let xpTarget = 50;
    let p = Math.max(0, Number(points) || 0);
    while (p >= xpTarget) {
      p -= xpTarget;
      currentLevel++;
      xpTarget += 50;
    }
    return currentLevel;
  }

  function syncProgressUI() {
    const progress = getProgress();
    const points = Math.max(0, Number(progress?.points || 0));
    const level = levelFromPoints(points);

    let xpTarget = 50;
    let p = points;
    while (p >= xpTarget) {
      p -= xpTarget;
      xpTarget += 50;
    }
    const xpCurrent = p;
    const xpPct = Math.max(0, Math.min(100, Math.round((xpCurrent / xpTarget) * 100)));

    document.querySelectorAll('[data-user-points]').forEach((el) => {
      el.textContent = String(points);
    });

    document.querySelectorAll('[data-user-level]').forEach((el) => {
      el.textContent = String(level);
    });

    const xpValue = document.querySelector('.habitos-xp-value');
    if (xpValue) xpValue.textContent = `${Math.floor(xpCurrent)} / ${xpTarget} XP`;

    const xpFill = document.querySelector('.habitos-xp-fill');
    if (xpFill) xpFill.style.width = `${xpPct}%`;
  }

  function syncSessionUserProgress(points, coins) {
    try {
      const raw = localStorage.getItem('gohabit_user');
      if (!raw) return;
      const user = JSON.parse(raw);
      const merged = {
        ...user,
        points: Math.max(0, Number(points) || 0),
        coins: Math.max(0, Number(coins) || 0),
        level: levelFromPoints(points),
      };
      localStorage.setItem('gohabit_user', JSON.stringify(merged));

      // SYNC BACKEND
      if (window.GoHabitAPI) {
        window.GoHabitAPI.put('/users/profile', {
          points: merged.points,
          coins: merged.coins,
          level: merged.level
        }).catch(err => console.warn('Sync profile failed', err));
      }
    } catch {
      // Ignore malformed cached user data.
    }
  }

  function toggleHabit(habitId, opts = {}) {
    const {
      reward = 10,
      dateKey = todayKey(),
      onChange,
      toastGood = `+${reward} semillas 🌱`,
      toastBad = `-${reward} semillas`,
    } = opts;

    const done = getHabitDone(habitId, dateKey);
    if (done) {
        toast('Este hábito ya ha sido completado hoy', 'good', { icon: 'lock' });
        return { done: true, total: getSeeds() };
    }
    const next = true;
    setHabitDone(habitId, next, dateKey);

    const petBonus = getEquippedCompanionBonus();
    const bonusSeeds = petBonus && (petBonus.type === 'seeds' || petBonus.type === 'both') ? Math.round(reward * petBonus.pct) : 0;
    const bonusXp    = petBonus && (petBonus.type === 'xp'    || petBonus.type === 'both') ? Math.round(reward * petBonus.pct) : 0;

    const total = addSeeds(reward + bonusSeeds);

    const progress = getProgress();
    const nextPoints = Math.max(0, progress.points + reward + bonusXp);

    // SYNC COMPLETION TO BACKEND
    const habit = getHabitsList()?.find(h => String(h.id) === String(habitId));
    if (habit && habit.backendId && next && window.GoHabitAPI) {
      window.GoHabitAPI.post(`/habits/${habit.backendId}/completions`, { note: 'Auto' })
        .catch(err => console.warn('Sync completion failed', err));
    }

    setProgress({
      ...progress,
      points: nextPoints,
      coins: total,
      startedAt: progress.startedAt || (next ? Date.now() : null),
    });

    syncSessionUserProgress(nextPoints, total);
    syncProgressUI();

    window.dispatchEvent(new CustomEvent('gohabit:progress-changed', {
      detail: {
        habitId: String(habitId),
        done: next,
        reward,
        points: nextPoints,
        coins: total,
        level: levelFromPoints(nextPoints),
        dateKey,
      },
    }));

    toast(toastGood, 'good', { icon: 'eco' });
    toast(`+${reward} XP`, 'good', { icon: 'bolt' });
    if (bonusSeeds > 0) toast(`+${bonusSeeds} semillas (mascota)`, 'good', { icon: 'pets' });
    if (bonusXp   > 0) toast(`+${bonusXp} XP (mascota)`,           'good', { icon: 'auto_awesome' });
    if (typeof onChange === 'function') onChange(next, total);
    return { done: next, total };
  }

  // Habits definitions (the list you see in "Tus hábitos")
  function getHabitsList() {
    return getJSON(STORAGE.habitsList, null);
  }

  function setHabitsList(list) {
    if (!Array.isArray(list)) list = [];
    setJSON(STORAGE.habitsList, list);
    return list;
  }

  function ensureDefaultHabits() {
    const existing = getHabitsList();
    if (Array.isArray(existing)) return existing;

    // New users start with no pre-created habits.
    setHabitsList([]);
    return [];
  }

  function getHabitLimitPerDay() {
    return 50;
  }

  function normalizeFrequencyDays(days) {
    const source = Array.isArray(days) ? days : [];
    const unique = [];
    source.forEach((value) => {
      // Si recibimos nombres de días por IA (ej: 'Lunes'), los convertimos a números
      if (typeof value === 'string' && isNaN(Number(value))) {
        const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const map = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
        if (map[normalized] !== undefined) {
          const day = map[normalized];
          if (!unique.includes(day)) unique.push(day);
          return;
        }
      }

      const day = Number(value);
      if (Number.isInteger(day) && day >= 0 && day <= 6 && !unique.includes(day)) {
        unique.push(day);
      }
    });
    return unique;
  }

  function isHabitScheduledForDay(habit, day) {
    const freq = normalizeFrequencyDays(habit?.frecuencia);
    if (!freq.length) return true;
    return freq.includes(Number(day));
  }

  function getDueHabitsForDate(date = new Date()) {
    const day = date.getDay();
    const habits = ensureDefaultHabits();
    return habits.filter((habit) => isHabitScheduledForDay(habit, day));
  }

  function validateFrequencyAgainstDailyLimit(existingHabits, newFrequency) {
    const frequency = normalizeFrequencyDays(newFrequency);
    const limit = getHabitLimitPerDay();
    if (!frequency.length) {
      return { ok: false, reason: 'Selecciona al menos un día de frecuencia.' };
    }

    for (const day of frequency) {
      const count = existingHabits.filter((habit) => isHabitScheduledForDay(habit, day)).length;
      if (count >= limit) {
        return { ok: false, reason: `Ya tienes ${limit} hábitos para el día ${day}.` };
      }
    }

    return { ok: true, reason: '' };
  }

  function nextHabitId(list) {
    const ids = (list || []).map(h => Number(h.id) || 0);
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
  }

  function addHabit(habit) {
    const list = ensureDefaultHabits().slice();
    const id = nextHabitId(list);
    const frequency = normalizeFrequencyDays(habit?.frecuencia);
    const safe = {
      id,
      backendId: habit?.backendId || null,
      titulo: String(habit?.titulo || habit?.nombre || 'Nuevo hábito').trim() || 'Nuevo hábito',
      categoria: String(habit?.categoria || 'salud'),
      etiqueta: String(habit?.etiqueta || habit?.categoria || 'General'),
      icono: String(habit?.icono || 'task_alt'),
      color: String(habit?.color || 'primary'),
      reward: Number(habit?.reward ?? 10) || 10,
      frecuencia: frequency.length ? frequency : [1, 2, 3, 4, 5],
      metaValor: Number(habit?.metaValor ?? 1) || 1,
      metaUnidad: String(habit?.metaUnidad || 'veces'),
      recordatorio: !!habit?.recordatorio,
      creadoEn: Date.now(),
    };

    const limitValidation = validateFrequencyAgainstDailyLimit(list, safe.frecuencia);
    if (!limitValidation.ok) {
      return {
        error: true,
        message: limitValidation.reason || `Límite de ${getHabitLimitPerDay()} hábitos por día alcanzado.`,
      };
    }

    list.push(safe);
    setHabitsList(list);

    // SYNC BACKEND
    if (window.GoHabitAPI) {
      const isHex = /^#[0-9a-fA-F]{6}$/.test(safe.color);
      window.GoHabitAPI.post('/habits', {
        title: safe.titulo,
        frequency: safe.frecuencia.join(','),
        targetCount: safe.metaValor,
        ...(isHex ? { color: safe.color } : {}),
        icon: safe.icono
      }).then(res => {
        if (res && res.data && res.data.id) {
          const currentList = getJSON(STORAGE.habitsList, []);
          const idx = currentList.findIndex(h => String(h.id) === String(safe.id));
          if (idx >= 0) {
            currentList[idx].backendId = res.data.id;
            setJSON(STORAGE.habitsList, currentList);
          }
        }
      }).catch(err => console.warn('Sync addHabit failed', err));
    }

    return safe;
  }

  function removeHabit(habitId) {
    const idStr = String(habitId);
    const list = ensureDefaultHabits().slice();
    const habitToRemove = list.find((habit) => String(habit?.id) === idStr);
    const nextList = list.filter((habit) => String(habit?.id) !== idStr);

    if (nextList.length === list.length) {
      return false;
    }

    // SYNC BACKEND
    if (habitToRemove && habitToRemove.backendId && window.GoHabitAPI) {
      window.GoHabitAPI.delete(`/habits/${habitToRemove.backendId}`)
        .catch(err => console.warn('Sync removeHabit failed', err));
    }

    setHabitsList(nextList);

    // Clean completion state for removed habit across all stored days.
    const state = getHabitsState();
    Object.keys(state).forEach((dateKey) => {
      if (state?.[dateKey] && Object.prototype.hasOwnProperty.call(state[dateKey], idStr)) {
        delete state[dateKey][idStr];
        if (!Object.keys(state[dateKey]).length) {
          delete state[dateKey];
        }
      }
    });
    setJSON(STORAGE.habits, state);

    return true;
  }

  // Cosmetics (loot/chests)
  function getCosmeticsInventory() {
    const inventory = getJSON(STORAGE.cosmeticsInventory, []);
    const list = Array.isArray(inventory) ? inventory : [];
    
    // Fix for legacy items missing image property
    const petMap = {
      'pet-agua': '../assets/mascotas/Agua.png',
      'pet-arbusto': '../assets/mascotas/Arbusto.png',
      'pet-bellota': '../assets/mascotas/Bellota.png',
      'pet-nube': '../assets/mascotas/Nube.png',
      'pet-riego': '../assets/mascotas/Riego.png',
      'pet-roca': '../assets/mascotas/Roca.png',
      'pet-saco': '../assets/mascotas/Saco.png',
      'pet-seta': '../assets/mascotas/Seta.png',
      'pet-arbol': '../assets/mascotas/Arbol.png',
      'pet-escudo': '../assets/mascotas/Escudo.png',
      'pet-serpiente': '../assets/mascotas/Serpiente.png',
      'pet-luciernaga': '../assets/mascotas/Luciernaga.png',
      'pet-calamar': '../assets/mascotas/Calamar.png',
      'pet-esqueleto': '../assets/mascotas/Esqueleto.png',
      'pet-hada': '../assets/mascotas/Hada.png',
      'pet-libelula': '../assets/mascotas/Libelula.png',
      'pet-dragon': '../assets/mascotas/Dragon.png'
    };

    list.forEach(item => {
      if (!item.image && petMap[item.id]) {
        item.image = petMap[item.id];
      }
    });

    return list;
  }

  function setCosmeticsInventory(list) {
    const safe = Array.isArray(list) ? list : [];
    setJSON(STORAGE.cosmeticsInventory, safe);
    return safe;
  }

  function hasCosmetic(itemId) {
    return getCosmeticsInventory().some((item) => String(item?.id) === String(itemId));
  }

  function unlockCosmetic(item) {
    const inventory = getCosmeticsInventory();
    const id = String(item?.id || '').trim();
    if (!id) return { added: false, item: null };

    if (inventory.some((entry) => String(entry?.id) === id)) {
      return { added: false, item: inventory.find((entry) => String(entry?.id) === id) || null };
    }

    const safeItem = {
      id,
      name: String(item?.name || 'Objeto misterioso'),
      icon: String(item?.icon || 'star'),
      image: item?.image || null,
      slot: String(item?.slot || 'aura'),
      rarity: String(item?.rarity || 'common'),
      sourceChest: String(item?.sourceChest || 'madera'),
      obtainedAt: Date.now(),
    };

    inventory.push(safeItem);
    setCosmeticsInventory(inventory);
    return { added: true, item: safeItem };
  }

  function getCosmeticsEquipped() {
    const equipped = getJSON(STORAGE.cosmeticsEquipped, {});
    return equipped && typeof equipped === 'object' ? equipped : {};
  }

  function setCosmeticsEquipped(equipped) {
    const safe = equipped && typeof equipped === 'object' ? equipped : {};
    setJSON(STORAGE.cosmeticsEquipped, safe);
    return safe;
  }

  function equipCosmetic(itemId) {
    const inventory = getCosmeticsInventory();
    const item = inventory.find((entry) => String(entry?.id) === String(itemId));
    if (!item) return null;

    const equipped = getCosmeticsEquipped();
    equipped[item.slot] = item.id;
    setCosmeticsEquipped(equipped);
    return item;
  }

  function unequipCosmetic(slot) {
    const equipped = getCosmeticsEquipped();
    if (Object.prototype.hasOwnProperty.call(equipped, slot)) {
      delete equipped[slot];
      setCosmeticsEquipped(equipped);
    }
    return equipped;
  }

  function getEquippedCompanionBonus() {
    const equipped = getCosmeticsEquipped();
    const companionId = equipped['companion'];
    if (!companionId) return null;
    const companion = getCosmeticsInventory().find((i) => String(i.id) === String(companionId));
    if (!companion) return null;
    const bonus = PET_BONUS[companion.rarity] || PET_BONUS.common;
    return { ...bonus, companion };
  }

  function sellCosmetic(itemId) {
    const inventory = getCosmeticsInventory();
    const item = inventory.find((i) => String(i.id) === String(itemId));
    if (!item) return null;
    const chestCost = CHEST_COSTS[item.sourceChest] || CHEST_COSTS.madera;
    const sellValue = Math.floor(chestCost * 0.20);
    const equipped = getCosmeticsEquipped();
    if (equipped[item.slot] === item.id) unequipCosmetic(item.slot);
    setCosmeticsInventory(inventory.filter((i) => String(i.id) !== String(itemId)));
    addSeeds(sellValue);
    return { item, sellValue };
  }

  function getUser() {
    try {
      const raw = localStorage.getItem('gohabit_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  // Level (very simple for the prototype; later you can compute from XP)
  function getLevel() {
    const progress = getProgress();
    return levelFromPoints(progress.points || 0);
  }
  function setLevel(n) {
    const val = Math.max(1, Number(n) || 1);
    localStorage.setItem(storageKey(STORAGE.level), String(val | 0));
    return getLevel();
  }

  // Toast
  function getToastHost() {
    let host = document.getElementById('gh-toast-host');
    if (host) return host;

    host = document.createElement('div');
    host.id = 'gh-toast-host';
    host.style.position = 'fixed';
    host.style.top = '20px';
    host.style.right = '20px';
    host.style.display = 'flex';
    host.style.flexDirection = 'column';
    host.style.gap = '10px';
    host.style.zIndex = '10000';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);
    return host;
  }
  
  function confirmModal(title, text) {
      return new Promise((resolve) => {
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.inset = '0';
          overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
          overlay.style.zIndex = '100000';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          
          const dialog = document.createElement('div');
          dialog.style.background = 'var(--bg-surface, #fff)';
          dialog.style.padding = '24px';
          dialog.style.borderRadius = '12px';
          dialog.style.maxWidth = '300px';
          dialog.style.textAlign = 'center';
          dialog.style.color = 'var(--text-primary, #000)';
          
          dialog.innerHTML = `
            <h3 style="margin-bottom:12px;font-size:1.2rem;">${title}</h3>
            <p style="margin-bottom:20px;font-size:0.95rem;opacity:0.8;">${text}</p>
            <div style="display:flex;gap:10px;justify-content:center;">
              <button id="gh-conf-no" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#e2e8f0;color:#334155;font-weight:600;">Cancelar</button>
              <button id="gh-conf-yes" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:var(--primary);color:#fff;font-weight:600;">Confirmar</button>
            </div>
          `;
          
          overlay.appendChild(dialog);
          document.body.appendChild(overlay);
          
          dialog.querySelector('#gh-conf-no').addEventListener('click', () => {
              document.body.removeChild(overlay);
              resolve(false);
          });
          dialog.querySelector('#gh-conf-yes').addEventListener('click', () => {
              document.body.removeChild(overlay);
              resolve(true);
          });
      });
  }

  function toast(message, kind = 'good', opts = {}) {
    const { icon: iconName, duration = 2600 } = opts;
    const el = document.createElement('div');
    el.className = `gh-toast gh-toast--${kind === 'bad' ? 'bad' : 'good'}`;
    el.style.animation = 'ghSlideIn .18s ease-out';
    el.style.position = 'relative';
    el.style.top = '0';
    el.style.right = '0';
    el.style.pointerEvents = 'auto';

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = iconName || (kind === 'bad' ? 'warning' : 'eco');

    const msg = document.createElement('div');
    msg.style.fontWeight = '700';
    msg.textContent = message;

    el.appendChild(icon);
    el.appendChild(msg);
    getToastHost().appendChild(el);

    window.setTimeout(() => {
      el.style.animation = 'ghSlideOut .18s ease-in';
      window.setTimeout(() => el.remove(), 200);
    }, duration);
  }

  // Theme
  function applyTheme(mode) {
    document.body.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE.theme);
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(STORAGE.theme, next);
    applyTheme(next);
    const btns = document.querySelectorAll('[data-theme-toggle]');
    btns.forEach(b => {
      const icon = b.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = next === 'dark' ? 'light_mode' : 'dark_mode';
      b.setAttribute('aria-label', next === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    });
  }

  // Bind seeds to any element
  function bindSeeds(selector) {
    const els = document.querySelectorAll(selector);
    const update = () => {
      const n = getSeeds();
      els.forEach(el => { el.textContent = n.toLocaleString('es-ES'); });
    };
    update();
    window.addEventListener('storage', update);
    return update;
  }

  function renderEquippedOnAvatar(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.avatar-cosmetic').forEach((el) => el.remove());

    const companionSlot = document.getElementById('avatar-companion-slot');
    if (companionSlot) {
      companionSlot.querySelectorAll('.avatar-companion-slot__img, .avatar-companion-slot__icon').forEach((el) => el.remove());
    }

    const equipped = getCosmeticsEquipped();
    const inventory = getCosmeticsInventory();
    const map = inventory.reduce((acc, item) => {
      acc[String(item.id)] = item;
      return acc;
    }, {});

    const SLOT_CLASS = {
      head: 'avatar-cosmetic--head',
      face: 'avatar-cosmetic--face',
      aura: 'avatar-cosmetic--aura',
    };

    Object.keys(equipped).forEach((slot) => {
      const itemId = equipped[slot];
      const item = map[String(itemId)];
      if (!item) return;

      if (item.slot === 'companion' && companionSlot) {
        const emptyIcon = companionSlot.querySelector('.avatar-companion-slot__empty');
        if (emptyIcon) emptyIcon.style.display = 'none';

        if (item.image) {
          const img = document.createElement('img');
          img.src = item.image;
          img.className = 'avatar-companion-slot__img';
          img.alt = item.name;
          companionSlot.appendChild(img);
        } else {
          const icon = document.createElement('span');
          icon.className = `material-symbols-outlined avatar-companion-slot__icon avatar-cosmetic--${item.rarity || 'common'}`;
          icon.textContent = item.icon || 'pets';
          icon.title = item.name || 'Mascota';
          companionSlot.appendChild(icon);
        }
      } else {
        const isCompanion = item.slot === 'companion';
        if (item.image) {
          const img = document.createElement('img');
          img.src = item.image;
          img.className = `avatar-cosmetic ${SLOT_CLASS[item.slot] || ''}`;
          img.alt = item.name;
          if (isCompanion) {
            const pos = window.GoHabitPetConfig || { bottom: '15%', right: '8%', size: 65 };
            img.style.position = 'absolute';
            img.style.bottom = pos.bottom || '15%';
            img.style.right  = pos.right  !== undefined ? pos.right  : '8%';
            img.style.left   = pos.left   !== undefined ? pos.left   : 'auto';
            const sz = (pos.size || 65) + 'px';
            img.style.width  = sz;
            img.style.height = sz;
            img.style.objectFit = 'contain';
            img.style.zIndex = '5';
            img.classList.add('gh-pet-live');
          }
          container.appendChild(img);
        } else {
          const icon = document.createElement('span');
          icon.className = `material-symbols-outlined avatar-cosmetic ${SLOT_CLASS[item.slot] || ''} avatar-cosmetic--${item.rarity || 'common'}`;
          icon.textContent = item.icon || 'star';
          if (isCompanion) icon.classList.add('gh-pet-live');
          container.appendChild(icon);
        }
      }
    });

    if (companionSlot && !equipped['companion']) {
      const emptyIcon = companionSlot.querySelector('.avatar-companion-slot__empty');
      if (emptyIcon) emptyIcon.style.display = '';
    }
  }

  function initNav() {
    const path = (location.pathname.split('/').pop() || '').toLowerCase();
    document.querySelectorAll('nav a[href]').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const active = href.endsWith(path);
      if (active) {
        a.setAttribute('aria-current', 'page');
        // try to add an active class if the page uses it
        if (!a.className.includes('--active')) a.classList.add('is-active');
      }
    });
  }

  function wireThemeButtons() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
      btn.classList.add('gh-icon-btn');
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        const isDark = document.body.classList.contains('dark');
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
      }
    });
  }

  window.GoHabit = {
    todayKey,
    // seeds
    getSeeds, setSeeds, addSeeds, subSeeds,
    // habits
    getHabitDone, setHabitDone, toggleHabit, getHabitsState,
    // habits list
    getHabitsList, setHabitsList, ensureDefaultHabits, addHabit, removeHabit,
    getHabitLimitPerDay, getDueHabitsForDate,
    isHabitScheduledForDay,
    // cosmetics
    getCosmeticsInventory, setCosmeticsInventory,
    hasCosmetic, unlockCosmetic,
    getCosmeticsEquipped, setCosmeticsEquipped,
    equipCosmetic, unequipCosmetic,
    getEquippedCompanionBonus, sellCosmetic,
    PET_BONUS, CHEST_COSTS,
    // ui
    toast, confirmModal, renderEquippedOnAvatar,
    // user
    getUser,
    // level
    getLevel, setLevel,
    // progress
    getProgress, setProgress,
    syncProgressUI,
    // theme
    theme: { initTheme, toggleTheme, applyTheme },
    // binders
    bindSeeds,
    initNav,
    wireThemeButtons,
  };

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    wireThemeButtons();
    initNav();
    syncProgressUI();
  });
})();
