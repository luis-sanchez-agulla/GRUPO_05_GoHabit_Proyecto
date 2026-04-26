document.addEventListener('DOMContentLoaded', () => {
  // ─── Seeds counter ─────────────────────────────────────
  const refreshSeeds = GoHabit.bindSeeds('[data-seeds]');

  // ─── Quick Habit card ──────────────────────────────────
  const btn = document.querySelector('[data-habit-toggle]');
  
  if (btn) {
    const habits     = GoHabit.getDueHabitsForDate(new Date());
    const firstHabit = habits[0];

    if (!firstHabit) {
      const titleEl = document.querySelector('[data-habit-title]');
      if (titleEl) titleEl.textContent = 'Sin hábitos';
      btn.disabled      = true;
      btn.style.opacity = '0.5';
    } else {
      const habitId = Number(firstHabit.id);
      btn.setAttribute('data-habit-toggle', String(habitId));
      
      const titleEl     = document.querySelector('[data-habit-title]');
      const categoryEl  = document.querySelector('[data-habit-category]');
      const iconEl      = document.querySelector('[data-habit-icon]');

      if (titleEl) titleEl.textContent = firstHabit.titulo;
      if (categoryEl) categoryEl.textContent = firstHabit.etiqueta || firstHabit.categoria || 'Hábito';
      if (iconEl) iconEl.textContent = firstHabit.icono || 'task_alt';

      function paint(done) {
        btn.checked = done;
        const card = btn.closest('.habit-card');
        if (done) {
          if (card) card.style.opacity = '0.7';
        } else {
          if (card) card.style.opacity = '1';
        }
      }

      paint(GoHabit.getHabitDone(habitId));
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const isDone = GoHabit.getHabitDone(habitId);
        if (isDone) {
            GoHabit.toast('Hábito ya completado', 'good', { icon: 'lock' });
            return;
        }
        
        const confirmed = await GoHabit.confirmModal('Completar hábito', `¿Has terminado "${firstHabit.titulo}" por hoy?`);
        if (!confirmed) return;

        const { done } = GoHabit.toggleHabit(habitId, { reward: firstHabit.reward || 10 });
        paint(done);
        refreshSeeds();
        if (window.GoHabit && GoHabit.renderEquippedOnAvatar) {
            GoHabit.renderEquippedOnAvatar('.index-tree-container');
        }
      });
    }
  }

  // Force render pet on dashboard with stability delay
  setTimeout(() => {
    if (window.GoHabit && GoHabit.renderEquippedOnAvatar) {
      GoHabit.renderEquippedOnAvatar('.index-tree-container');
    }
  }, 600);
});
