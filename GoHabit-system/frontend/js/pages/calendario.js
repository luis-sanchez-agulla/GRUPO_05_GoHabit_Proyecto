/* calendario.js – dynamic calendar driven by GoHabit local state */
document.addEventListener('DOMContentLoaded', () => {
  const habits = GoHabit.ensureDefaultHabits();

  const dayView   = document.getElementById('dayView');
  const weekView  = document.getElementById('weekView');
  const monthView = document.getElementById('monthView');
  const periodTitle = document.getElementById('periodTitle');

  let currentDate = new Date();
  let currentView = 'day';

  /* ── helpers ─────────────────────────────────────────────────── */
  function dk(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function freshState() { return GoHabit.getHabitsState(); }

  function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function isScheduledForDate(habit, date) {
    const freq = Array.isArray(habit?.frecuencia) ? habit.frecuencia : [];
    if (!freq.length) return true;
    return freq.includes(date.getDay());
  }

  function hasMissedScheduledDay(habit, date, state) {
    // Recovery window: last 14 days
    for (let i = 1; i <= 14; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() - i);
      if (!isScheduledForDate(habit, d)) continue;
      const key = dk(d);
      const done = !!(state?.[key]?.[String(habit.id)]);
      if (!done) return true;
    }
    return false;
  }

  function shouldShowForDate(habit, date, state) {
    return isScheduledForDate(habit, date) || hasMissedScheduledDay(habit, date, state);
  }

  /* ── DAY VIEW ─────────────────────────────────────────────────── */
  function renderDay(date) {
    const container = dayView.querySelector('.calendario-day-habits');
    const header    = dayView.querySelector('.calendario-day-header__date');
    const dateKey   = dk(date);
    const state     = freshState();

    header.textContent = capitalize(
      date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    );

    const dueHabits = habits.filter((h) => shouldShowForDate(h, date, state));

    if (!dueHabits.length) {
      container.innerHTML = `
        <div class="calendario-empty-state">
          <span class="material-symbols-outlined">event_busy</span>
          <p>Hoy no tienes habitos programados.</p>
          <a href="anadirHabito.html" class="calendario-empty-link">Configurar habitos</a>
        </div>`;
      return;
    }

    container.innerHTML = dueHabits.map(h => {
      const done = !!(state?.[dateKey]?.[String(h.id)]);
      const scheduledToday = isScheduledForDate(h, date);
      const statusText = done
        ? 'Completado'
        : (scheduledToday ? 'Pendiente hoy' : 'Recuperacion pendiente');

      return `
        <div class="calendario-habit-card${done ? ' calendario-habit-card--done' : ''}">
          <div class="calendario-habit-card__icon-wrap">
            <span class="material-symbols-outlined">${h.icono || 'task_alt'}</span>
          </div>
          <div class="calendario-habit-card__content">
            <h4 class="calendario-habit-card__title">${h.titulo}</h4>
            <div class="calendario-habit-card__status">
              <span class="material-symbols-outlined">${done ? 'check_circle' : 'radio_button_unchecked'}</span>
              <span>${statusText}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── WEEK VIEW ────────────────────────────────────────────────── */
  function renderWeek(date) {
    const state    = freshState();
    const dow      = (date.getDay() + 6) % 7;   // Monday = 0
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dow);

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const todayDk  = dk(new Date());
    const weekGrid = weekView.querySelector('.calendario-week-grid');
    const summaryList = weekView.querySelector('.calendario-habit-list');

    weekGrid.innerHTML = dayNames.map((name, i) => {
      const d       = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateKey = dk(d);
      const isToday = dateKey === todayDk;
      const isPast  = d < new Date(new Date().setHours(0,0,0,0));
      const dayState = state?.[dateKey] || {};
      const dueHabits = habits.filter((h) => isScheduledForDate(h, d));
      const completed = dueHabits.filter(h => !!(dayState[String(h.id)])).length;
      const total     = dueHabits.length;

      // Traffic-light colour only for past days with scheduled habits
      let colorClass = '';
      if (total > 0 && isPast) {
        if (completed >= total)    colorClass = ' cal-green';
        else if (completed > 0)    colorClass = ' cal-yellow';
        else                       colorClass = ' cal-red';
      }

      const dots = dueHabits.slice(0, 3).map(h => {
        const done = !!(dayState[String(h.id)]);
        return `<div class="calendario-habit-dot${done ? ' done' : ''}"></div>`;
      }).join('') || '<div class="calendario-habit-dot"></div>';

      return `
        <div class="calendario-week-day${isToday ? ' today' : ''}${colorClass}">
          <div class="calendario-week-day__header">
            <span class="calendario-week-day__name">${name}</span>
            <span class="calendario-week-day__date">${d.getDate()}</span>
          </div>
          <div class="calendario-week-day__habits">${dots}</div>
        </div>`;
    }).join('');

    if (summaryList) {
      if (!habits.length) {
        summaryList.innerHTML = '<p class="calendario-empty">No tienes hábitos todavía.</p>';
      } else {
        summaryList.innerHTML = habits.map(h => {
          let count = 0;
          let planned = 0;
          for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            if (!isScheduledForDate(h, d)) continue;
            planned++;
            if (state?.[dk(d)]?.[String(h.id)]) count++;
          }
          return `
            <div class="calendario-habit-item">
              <span class="calendario-habit-item__name">${h.titulo}</span>
              <span class="calendario-habit-item__progress">${count}/${planned || 0}</span>
            </div>`;
        }).join('');
      }
    }
  }

  /* ── MONTH VIEW ───────────────────────────────────────────────── */
  function renderMonth(date) {
    const state   = freshState();
    const grid    = monthView.querySelector('.calendario-month-grid');
    const year    = date.getFullYear();
    const month   = date.getMonth();
    const first   = new Date(year, month, 1);
    const last    = new Date(year, month + 1, 0);
    const todayDk = dk(new Date());
    const startDow = (first.getDay() + 6) % 7;  // Monday = 0

    let html = '';

    // Previous-month fillers
    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, 1 - startDow + i);
      html += `<div class="calendario-month-day other-month"><span class="calendario-month-day__number">${d.getDate()}</span></div>`;
    }

    // Current-month days
    for (let day = 1; day <= last.getDate(); day++) {
      const d       = new Date(year, month, day);
      const dateKey = dk(d);
      const isToday = dateKey === todayDk;
      const isPast  = d < new Date(new Date().setHours(0,0,0,0));
      const dayState = state?.[dateKey] || {};
      const dueHabits = habits.filter((h) => isScheduledForDate(h, d));
      const completed = dueHabits.filter((h) => !!dayState[String(h.id)]).length;
      const total     = dueHabits.length;

      let colorClass = '';
      let indicator  = '';
      if (total > 0) {
        if (completed >= total) {
          indicator  = '<div class="calendario-month-day__indicator full"></div>';
          if (isPast) colorClass = ' cal-green';
        } else if (completed > 0) {
          indicator  = '<div class="calendario-month-day__indicator partial"></div>';
          if (isPast) colorClass = ' cal-yellow';
        } else {
          if (isPast) colorClass = ' cal-red';
        }
      }

      html += `<div class="calendario-month-day${isToday ? ' today' : ''}${colorClass}">
        <span class="calendario-month-day__number">${day}</span>${indicator}
      </div>`;
    }

    // Next-month fillers
    const totalCells = Math.ceil((startDow + last.getDate()) / 7) * 7;
    const endFillers = totalCells - startDow - last.getDate();
    for (let i = 1; i <= endFillers; i++) {
      html += `<div class="calendario-month-day other-month"><span class="calendario-month-day__number">${i}</span></div>`;
    }

    grid.innerHTML = html;
  }

  /* ── PERIOD TITLE ─────────────────────────────────────────────── */
  function renderTitle(date, view) {
    if (view === 'day') {
      periodTitle.textContent = capitalize(
        date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    } else if (view === 'week') {
      const dow   = (date.getDay() + 6) % 7;
      const start = new Date(date);
      start.setDate(date.getDate() - dow);
      const end   = new Date(start);
      end.setDate(start.getDate() + 6);
      periodTitle.textContent =
        `${start.getDate()} ${start.toLocaleDateString('es-ES', { month: 'short' })} – ` +
        `${end.getDate()} ${end.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
    } else {
      periodTitle.textContent = capitalize(
        date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      );
    }
  }

  /* ── RENDER ALL ───────────────────────────────────────────────── */
  function render() {
    renderDay(currentDate);
    renderWeek(currentDate);
    renderMonth(currentDate);
    renderTitle(currentDate, currentView);
  }

  /* ── VIEW TOGGLE ──────────────────────────────────────────────── */
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      [dayView, weekView, monthView].forEach(v => v.classList.add('hidden'));
      document.getElementById(currentView + 'View').classList.remove('hidden');
      render();
    });
  });

  /* ── DATE NAVIGATION ──────────────────────────────────────────── */
  document.getElementById('prevPeriod').addEventListener('click', () => {
    if (currentView === 'day')       currentDate.setDate(currentDate.getDate() - 1);
    else if (currentView === 'week') currentDate.setDate(currentDate.getDate() - 7);
    else                             currentDate.setMonth(currentDate.getMonth() - 1);
    render();
  });
  document.getElementById('nextPeriod').addEventListener('click', () => {
    if (currentView === 'day')       currentDate.setDate(currentDate.getDate() + 1);
    else if (currentView === 'week') currentDate.setDate(currentDate.getDate() + 7);
    else                             currentDate.setMonth(currentDate.getMonth() + 1);
    render();
  });

  render();
});
