/* app.js - shared UI + state helpers for GoHabit (no framework) */

(function(){
  const STORAGE = {
    seeds: 'semillasUsuario',
    habits: 'habitosCompletados',
    theme: 'gohabitTheme',
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
    // ui
    toast,
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
