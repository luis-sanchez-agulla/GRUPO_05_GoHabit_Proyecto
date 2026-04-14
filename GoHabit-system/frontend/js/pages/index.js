document.addEventListener('DOMContentLoaded', () => {
  // ─── Seeds counter ─────────────────────────────────────
  const refreshSeeds = GoHabit.bindSeeds('[data-seeds]');

  // ─── Quick Habit card ──────────────────────────────────
  const btn        = document.querySelector('[data-habit-toggle]');
  const titleEl    = document.querySelector('.index-task-card__title');
  const progressEl = document.querySelector('.index-task-card__progress-text');
  const fillEl     = document.querySelector('.index-task-card__progress-fill');
  const iconWrap   = document.querySelector('.index-task-card__icon .material-symbols-outlined');

  if (btn && titleEl && progressEl) {
    const habits    = GoHabit.getDueHabitsForDate(new Date());
    const firstHabit = habits[0];

    if (!firstHabit) {
      titleEl.textContent    = 'Sin hábitos para hoy';
      progressEl.textContent = '0 / 0';
      btn.disabled           = true;
      btn.style.opacity      = '0.5';
      btn.style.cursor       = 'not-allowed';
    } else {
      const habitId = Number(firstHabit.id);
      btn.setAttribute('data-habit-toggle', String(habitId));
      titleEl.textContent    = firstHabit.titulo || 'Hábito';
      progressEl.textContent = '0 / 1';
      if (iconWrap) iconWrap.textContent = firstHabit.icono || 'task_alt';

      function paint(done) {
        const checkIcon = btn.querySelector('.material-symbols-outlined');
        if (done) {
          btn.classList.add('is-done');
          btn.style.background = '#728764';
          btn.style.color      = 'white';
          if (checkIcon) checkIcon.textContent = 'check';
          progressEl.textContent = '1 / 1';
          if (fillEl) fillEl.style.width = '100%';
        } else {
          btn.classList.remove('is-done');
          btn.style.background = '';
          btn.style.color      = '';
          if (checkIcon) checkIcon.textContent = 'radio_button_unchecked';
          progressEl.textContent = '0 / 1';
          if (fillEl) fillEl.style.width = '0%';
        }
      }

      paint(GoHabit.getHabitDone(habitId));
      btn.addEventListener('click', () => {
        const { done } = GoHabit.toggleHabit(habitId, { reward: firstHabit.reward || 10 });
        paint(done);
        refreshSeeds();
      });
    }
  }

  // ─── Water Bucket Widget ───────────────────────────────
  const WATER_KEY = 'gohabit_water';
  const WATER_MAX = 8;

  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  function loadWater() {
    try {
      const raw = JSON.parse(localStorage.getItem(WATER_KEY) || '{}');
      if (raw.date !== getTodayKey()) return 0; // new day → reset
      return Number(raw.glasses) || 0;
    } catch { return 0; }
  }

  function saveWater(glasses) {
    localStorage.setItem(WATER_KEY, JSON.stringify({ date: getTodayKey(), glasses }));
  }

  const waterFill   = document.getElementById('waterFill');
  const waterLabel  = document.getElementById('waterLabel');
  const waterSub    = document.getElementById('waterSub');
  const waterAdd    = document.getElementById('waterAdd');
  const waterRemove = document.getElementById('waterRemove');
  const waterBucket = document.getElementById('waterBucket');

  if (waterFill && waterAdd) {
    let glasses = loadWater();

    function renderWater() {
      const pct = Math.min((glasses / WATER_MAX) * 100, 100);
      waterFill.style.height = pct + '%';
      waterLabel.textContent  = `${glasses}/${WATER_MAX}`;
      waterSub.textContent    = `${glasses} de ${WATER_MAX} vasos`;
      waterAdd.disabled    = glasses >= WATER_MAX;
      waterRemove.disabled = glasses <= 0;
      if (glasses >= WATER_MAX) {
        waterBucket.classList.add('full');
      } else {
        waterBucket.classList.remove('full');
      }
    }

    waterAdd.addEventListener('click', () => {
      if (glasses < WATER_MAX) {
        glasses++;
        saveWater(glasses);
        renderWater();
        waterBucket.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.08)' },
          { transform: 'scale(1)' }
        ], { duration: 300, easing: 'ease-out' });
      }
    });

    waterRemove.addEventListener('click', () => {
      if (glasses > 0) {
        glasses--;
        saveWater(glasses);
        renderWater();
      }
    });

    renderWater();
  }
});
