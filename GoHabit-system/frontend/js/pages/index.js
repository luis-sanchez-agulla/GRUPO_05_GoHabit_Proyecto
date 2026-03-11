document.addEventListener('DOMContentLoaded', () => {
  // seeds counter
  GoHabit.bindSeeds('[data-seeds]');

  const btn        = document.querySelector('[data-habit-toggle]');
  const titleEl    = document.querySelector('.index-task-card__title');
  const progressEl = document.querySelector('.index-task-card__progress-text');
  const fillEl     = document.querySelector('.index-task-card__progress-fill');
  const iconWrap   = document.querySelector('.index-task-card__icon .material-symbols-outlined');
  if (!btn || !titleEl || !progressEl) return;

  const habits    = GoHabit.ensureDefaultHabits();
  const firstHabit = habits[0];

  if (!firstHabit) {
    titleEl.textContent    = 'Sin hábitos todavía';
    progressEl.textContent = '0 / 0';
    btn.disabled           = true;
    btn.style.opacity      = '0.5';
    btn.style.cursor       = 'not-allowed';
    return;
  }

  const habitId = Number(firstHabit.id);
  btn.setAttribute('data-habit-toggle', String(habitId));
  titleEl.textContent    = firstHabit.titulo || 'Hábito';
  progressEl.textContent = '0 / 1';

  // Set the habit's real icon
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
    GoHabit.bindSeeds('[data-seeds]')();
  });
});
