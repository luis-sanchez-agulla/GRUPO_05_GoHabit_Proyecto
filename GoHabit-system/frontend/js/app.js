/* app.js - shared UI + state helpers for GoHabit (no framework) */

(function(){
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

  function getCurrentUserId(){
    try{
      const raw = localStorage.getItem('gohabit_user');
      const user = raw ? JSON.parse(raw) : null;
      return user?.id ? String(user.id) : 'anon';
    }catch{
      return 'anon';
    }
  }

  function storageKey(base){
    // Theme is global; user progress/state is namespaced per user.
    if(base === STORAGE.theme) return base;
    return `${base}:${getCurrentUserId()}`;
  }

  function todayKey(d = new Date()){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function getJSON(key, fallback){
    try{
      const v = localStorage.getItem(storageKey(key));
      return v ? JSON.parse(v) : fallback;
    }catch{ return fallback; }
  }

  function setJSON(key, value){
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  }

  function updateProgressCoinsOnSeedChange(coins){
    const current = getProgress();
    setProgress({
      ...current,
      coins: Math.max(0, Number(coins) || 0),
      startedAt: current.startedAt || Date.now(),
    });
  }

  // Seeds
  function getSeeds(){
    const v = localStorage.getItem(storageKey(STORAGE.seeds));
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }
  function setSeeds(n){
    const safe = Math.max(0, n|0);
    localStorage.setItem(storageKey(STORAGE.seeds), String(safe));
    updateProgressCoinsOnSeedChange(safe);
    return safe;
  }
  function addSeeds(delta){ const n = getSeeds() + (delta|0); return setSeeds(n); }
  function subSeeds(delta){ const n = Math.max(0, getSeeds() - (delta|0)); return setSeeds(n); }

  // Habits state (per day)
  function getHabitsState(){ return getJSON(STORAGE.habits, {}); }
  function getHabitDone(habitId, dateKey = todayKey()){
    const st = getHabitsState();
    return !!(st?.[dateKey]?.[String(habitId)]);
  }
  function setHabitDone(habitId, done, dateKey = todayKey()){
    const st = getHabitsState();
    if(!st[dateKey]) st[dateKey] = {};
    st[dateKey][String(habitId)] = !!done;
    setJSON(STORAGE.habits, st);
  }

  function getProgress(){
    const p = getJSON(STORAGE.progress, null);
    if(p && typeof p === 'object') return p;
    return {
      points: 0,
      coins: getSeeds(),
      startedAt: null,
    };
  }

  function setProgress(progress){
    const safe = {
      points: Math.max(0, Number(progress?.points || 0)),
      coins: Math.max(0, Number(progress?.coins || 0)),
      startedAt: progress?.startedAt || null,
    };
    setJSON(STORAGE.progress, safe);
    return safe;
  }

  function levelFromPoints(points){
    return 1 + Math.floor(Math.max(0, Number(points) || 0) / 100);
  }

  function syncProgressUI(){
    const progress = getProgress();
    const points = Math.max(0, Number(progress?.points || 0));
    const level = levelFromPoints(points);
    const xpTarget = 1000;
    const xpPct = Math.max(0, Math.min(100, Math.round((points / xpTarget) * 100)));

    document.querySelectorAll('[data-user-points]').forEach((el) => {
      el.textContent = String(points);
    });

    document.querySelectorAll('[data-user-level]').forEach((el) => {
      el.textContent = String(level);
    });

    const xpValue = document.querySelector('.habitos-xp-value');
    if(xpValue) xpValue.textContent = `${points} / ${xpTarget} XP`;

    const xpFill = document.querySelector('.habitos-xp-fill');
    if(xpFill) xpFill.style.width = `${xpPct}%`;
  }

  function syncSessionUserProgress(points, coins){
    try{
      const raw = localStorage.getItem('gohabit_user');
      if(!raw) return;
      const user = JSON.parse(raw);
      const merged = {
        ...user,
        points: Math.max(0, Number(points) || 0),
        coins: Math.max(0, Number(coins) || 0),
        level: levelFromPoints(points),
      };
      localStorage.setItem('gohabit_user', JSON.stringify(merged));
    }catch{
      // Ignore malformed cached user data.
    }
  }

  function toggleHabit(habitId, opts = {}){
    const {
      reward = 10,
      dateKey = todayKey(),
      onChange,
      toastGood = `+${reward} semillas 🌱`,
      toastBad = `-${reward} semillas`,
    } = opts;

    const done = getHabitDone(habitId, dateKey);
    const next = !done;
    setHabitDone(habitId, next, dateKey);
    const total = next ? addSeeds(reward) : subSeeds(reward);

    const progress = getProgress();
    const nextPoints = Math.max(0, progress.points + (next ? reward : -reward));
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

    const toastKind = next ? 'good' : 'bad';
    toast(next ? toastGood : toastBad, toastKind, { icon: 'eco' });
    toast(`${next ? '+' : '-'}${reward} XP`, toastKind, { icon: 'bolt' });
    if(typeof onChange === 'function') onChange(next, total);
    return {done: next, total};
  }

  // Habits definitions (the list you see in "Tus hábitos")
  function getHabitsList(){
    return getJSON(STORAGE.habitsList, null);
  }

  function setHabitsList(list){
    if(!Array.isArray(list)) list = [];
    setJSON(STORAGE.habitsList, list);
    return list;
  }

  function ensureDefaultHabits(){
    const existing = getHabitsList();
    if(Array.isArray(existing)) return existing;

    // New users start with no pre-created habits.
    setHabitsList([]);
    return [];
  }

  function getHabitLimitPerDay(){
    return 5;
  }

  function normalizeFrequencyDays(days){
    const source = Array.isArray(days) ? days : [];
    const unique = [];
    source.forEach((value) => {
      const day = Number(value);
      if(Number.isInteger(day) && day >= 0 && day <= 6 && !unique.includes(day)){
        unique.push(day);
      }
    });
    return unique;
  }

  function isHabitScheduledForDay(habit, day){
    const freq = normalizeFrequencyDays(habit?.frecuencia);
    if(!freq.length) return true;
    return freq.includes(Number(day));
  }

  function getDueHabitsForDate(date = new Date()){
    const day = date.getDay();
    const habits = ensureDefaultHabits();
    return habits.filter((habit) => isHabitScheduledForDay(habit, day));
  }

  function validateFrequencyAgainstDailyLimit(existingHabits, newFrequency){
    const frequency = normalizeFrequencyDays(newFrequency);
    const limit = getHabitLimitPerDay();
    if(!frequency.length){
      return { ok: false, reason: 'Selecciona al menos un día de frecuencia.' };
    }

    for(const day of frequency){
      const count = existingHabits.filter((habit) => isHabitScheduledForDay(habit, day)).length;
      if(count >= limit){
        return { ok: false, reason: `Ya tienes ${limit} hábitos para el día ${day}.` };
      }
    }

    return { ok: true, reason: '' };
  }

  function nextHabitId(list){
    const ids = (list || []).map(h => Number(h.id) || 0);
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
  }

  function addHabit(habit){
    const list = ensureDefaultHabits().slice();
    const id = nextHabitId(list);
    const frequency = normalizeFrequencyDays(habit?.frecuencia);
    const safe = {
      id,
      titulo: String(habit?.titulo || habit?.nombre || 'Nuevo hábito').trim() || 'Nuevo hábito',
      categoria: String(habit?.categoria || 'salud'),
      etiqueta: String(habit?.etiqueta || habit?.categoria || 'General'),
      icono: String(habit?.icono || 'task_alt'),
      color: String(habit?.color || 'primary'),
      reward: Number(habit?.reward ?? 10) || 10,
      frecuencia: frequency.length ? frequency : [1,2,3,4,5],
      metaValor: Number(habit?.metaValor ?? 1) || 1,
      metaUnidad: String(habit?.metaUnidad || 'veces'),
      recordatorio: !!habit?.recordatorio,
      creadoEn: Date.now(),
    };

    const limitValidation = validateFrequencyAgainstDailyLimit(list, safe.frecuencia);
    if(!limitValidation.ok){
      return {
        error: true,
        message: limitValidation.reason || `Límite de ${getHabitLimitPerDay()} hábitos por día alcanzado.`,
      };
    }

    list.push(safe);
    setHabitsList(list);
    return safe;
  }

  function removeHabit(habitId){
    const idStr = String(habitId);
    const list = ensureDefaultHabits().slice();
    const nextList = list.filter((habit) => String(habit?.id) !== idStr);

    if(nextList.length === list.length){
      return false;
    }

    setHabitsList(nextList);

    // Clean completion state for removed habit across all stored days.
    const state = getHabitsState();
    Object.keys(state).forEach((dateKey) => {
      if(state?.[dateKey] && Object.prototype.hasOwnProperty.call(state[dateKey], idStr)){
        delete state[dateKey][idStr];
        if(!Object.keys(state[dateKey]).length){
          delete state[dateKey];
        }
      }
    });
    setJSON(STORAGE.habits, state);

    return true;
  }

  // Cosmetics (loot/chests)
  function getCosmeticsInventory(){
    const inventory = getJSON(STORAGE.cosmeticsInventory, []);
    return Array.isArray(inventory) ? inventory : [];
  }

  function setCosmeticsInventory(list){
    const safe = Array.isArray(list) ? list : [];
    setJSON(STORAGE.cosmeticsInventory, safe);
    return safe;
  }

  function hasCosmetic(itemId){
    return getCosmeticsInventory().some((item) => String(item?.id) === String(itemId));
  }

  function unlockCosmetic(item){
    const inventory = getCosmeticsInventory();
    const id = String(item?.id || '').trim();
    if(!id) return { added: false, item: null };

    if(inventory.some((entry) => String(entry?.id) === id)){
      return { added: false, item: inventory.find((entry) => String(entry?.id) === id) || null };
    }

    const safeItem = {
      id,
      name: String(item?.name || 'Objeto misterioso'),
      icon: String(item?.icon || 'star'),
      slot: String(item?.slot || 'aura'),
      rarity: String(item?.rarity || 'common'),
      sourceChest: String(item?.sourceChest || 'madera'),
      obtainedAt: Date.now(),
    };

    inventory.push(safeItem);
    setCosmeticsInventory(inventory);
    return { added: true, item: safeItem };
  }

  function getCosmeticsEquipped(){
    const equipped = getJSON(STORAGE.cosmeticsEquipped, {});
    return equipped && typeof equipped === 'object' ? equipped : {};
  }

  function setCosmeticsEquipped(equipped){
    const safe = equipped && typeof equipped === 'object' ? equipped : {};
    setJSON(STORAGE.cosmeticsEquipped, safe);
    return safe;
  }

  function equipCosmetic(itemId){
    const inventory = getCosmeticsInventory();
    const item = inventory.find((entry) => String(entry?.id) === String(itemId));
    if(!item) return null;

    const equipped = getCosmeticsEquipped();
    equipped[item.slot] = item.id;
    setCosmeticsEquipped(equipped);
    return item;
  }

  function unequipCosmetic(slot){
    const equipped = getCosmeticsEquipped();
    if(Object.prototype.hasOwnProperty.call(equipped, slot)){
      delete equipped[slot];
      setCosmeticsEquipped(equipped);
    }
    return equipped;
  }

  // Level (very simple for the prototype; later you can compute from XP)
  function getLevel(){
    const v = localStorage.getItem(storageKey(STORAGE.level));
    const n = v ? parseInt(v, 10) : 1;
    return Number.isFinite(n) ? Math.max(1, n) : 1;
  }
  function setLevel(n){
    const val = Math.max(1, Number(n)||1);
    localStorage.setItem(storageKey(STORAGE.level), String(val|0));
    return getLevel();
  }

  // Toast
  function getToastHost(){
    let host = document.getElementById('gh-toast-host');
    if(host) return host;

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

  function toast(message, kind = 'good', opts = {}){
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
  function applyTheme(mode){
    document.body.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }

  function initTheme(){
    const saved = localStorage.getItem(STORAGE.theme);
    if(saved === 'dark' || saved === 'light'){
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  function toggleTheme(){
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(STORAGE.theme, next);
    applyTheme(next);
    const btns = document.querySelectorAll('[data-theme-toggle]');
    btns.forEach(b => {
      const icon = b.querySelector('.material-symbols-outlined');
      if(icon) icon.textContent = next === 'dark' ? 'light_mode' : 'dark_mode';
      b.setAttribute('aria-label', next === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    });
  }

  // Bind seeds to any element
  function bindSeeds(selector){
    const els = document.querySelectorAll(selector);
    const update = () => {
      const n = getSeeds();
      els.forEach(el => { el.textContent = n.toLocaleString('es-ES'); });
    };
    update();
    window.addEventListener('storage', update);
    return update;
  }

  function initNav(){
    const path = (location.pathname.split('/').pop() || '').toLowerCase();
    document.querySelectorAll('nav a[href]').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const active = href.endsWith(path);
      if(active){
        a.setAttribute('aria-current', 'page');
        // try to add an active class if the page uses it
        if(!a.className.includes('--active')) a.classList.add('is-active');
      }
    });
  }

  function wireThemeButtons(){
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
      btn.classList.add('gh-icon-btn');
      const icon = btn.querySelector('.material-symbols-outlined');
      if(icon){
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
    // ui
    toast,
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
