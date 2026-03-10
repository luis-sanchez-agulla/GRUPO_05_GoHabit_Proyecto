/* app.js - shared UI + state helpers for GoHabit (no framework) */

(function(){
  const STORAGE = {
    seeds: 'semillasUsuario',
    habits: 'habitosCompletados',
    habitsList: 'habitosLista',
    theme: 'gohabitTheme',
    level: 'nivelArbol',
  };

  function todayKey(d = new Date()){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function getJSON(key, fallback){
    try{
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }catch{ return fallback; }
  }

  function setJSON(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Seeds
  function getSeeds(){
    const v = localStorage.getItem(STORAGE.seeds);
    const n = v ? parseInt(v, 10) : 500;
    return Number.isFinite(n) ? n : 500;
  }
  function setSeeds(n){ localStorage.setItem(STORAGE.seeds, String(Math.max(0, n|0))); }
  function addSeeds(delta){ const n = getSeeds() + (delta|0); setSeeds(n); return getSeeds(); }
  function subSeeds(delta){ const n = Math.max(0, getSeeds() - (delta|0)); setSeeds(n); return getSeeds(); }

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
    toast(next ? toastGood : toastBad, next ? 'good' : 'bad');
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
    if(Array.isArray(existing) && existing.length) return existing;

    // Defaults shown in habitos.html
    const defaults = [
      { id: 1, titulo: 'Beber 2L de agua', categoria: 'salud', etiqueta: 'Hidratación', icono: 'water_drop', color: 'primary', reward: 10 },
      { id: 2, titulo: 'Leer 15 páginas', categoria: 'mente', etiqueta: 'Mente', icono: 'menu_book', color: 'purple', reward: 10 },
      { id: 3, titulo: 'Meditar 10 min', categoria: 'espiritu', etiqueta: 'Espiritualidad', icono: 'self_improvement', color: 'orange', reward: 10 },
      { id: 4, titulo: 'Caminar 5000 pasos', categoria: 'salud', etiqueta: 'Salud', icono: 'directions_walk', color: 'blue', reward: 10 },
    ];
    setHabitsList(defaults);
    return defaults;
  }

  function nextHabitId(list){
    const ids = (list || []).map(h => Number(h.id) || 0);
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
  }

  function addHabit(habit){
    const list = ensureDefaultHabits().slice();
    const id = nextHabitId(list);
    const safe = {
      id,
      titulo: String(habit?.titulo || habit?.nombre || 'Nuevo hábito').trim() || 'Nuevo hábito',
      categoria: String(habit?.categoria || 'salud'),
      etiqueta: String(habit?.etiqueta || habit?.categoria || 'General'),
      icono: String(habit?.icono || 'task_alt'),
      color: String(habit?.color || 'primary'),
      reward: Number(habit?.reward ?? 10) || 10,
      frecuencia: Array.isArray(habit?.frecuencia) ? habit.frecuencia : [1,2,3,4,5],
      metaValor: Number(habit?.metaValor ?? 1) || 1,
      metaUnidad: String(habit?.metaUnidad || 'veces'),
      recordatorio: !!habit?.recordatorio,
      creadoEn: Date.now(),
    };
    list.push(safe);
    setHabitsList(list);
    return safe;
  }

  // Level (very simple for the prototype; later you can compute from XP)
  function getLevel(){
    const v = localStorage.getItem(STORAGE.level);
    const n = v ? parseInt(v, 10) : 5;
    return Number.isFinite(n) ? Math.max(1, n) : 5;
  }
  function setLevel(n){
    const val = Math.max(1, Number(n)||1);
    localStorage.setItem(STORAGE.level, String(val|0));
    return getLevel();
  }

  // Toast
  function toast(message, kind = 'good'){
    const el = document.createElement('div');
    el.className = `gh-toast gh-toast--${kind === 'bad' ? 'bad' : 'good'}`;
    el.style.animation = 'ghSlideIn .18s ease-out';

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = kind === 'bad' ? 'warning' : 'eco';

    const msg = document.createElement('div');
    msg.style.fontWeight = '700';
    msg.textContent = message;

    el.appendChild(icon);
    el.appendChild(msg);
    document.body.appendChild(el);

    window.setTimeout(() => {
      el.style.animation = 'ghSlideOut .18s ease-in';
      window.setTimeout(() => el.remove(), 200);
    }, 2600);
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
    getHabitDone, setHabitDone, toggleHabit,
    // habits list
    getHabitsList, setHabitsList, ensureDefaultHabits, addHabit,
    // ui
    toast,
    // level
    getLevel, setLevel,
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
  });
})();
