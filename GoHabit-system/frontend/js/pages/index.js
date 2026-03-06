document.addEventListener('DOMContentLoaded', () => {
  // seeds counter
  GoHabit.bindSeeds('[data-seeds]');

  async function initNextHabit() {
    try {
      const habits = await window.GoHabitAPI.get('/habits');
      if (habits.data && habits.data.length > 0) {
        const habit = habits.data[0]; // Just take the first one for the "Next Habit" card

        const cardTitle = document.querySelector('.index-task-card__title');
        if (cardTitle) cardTitle.textContent = habit.name;

        const cardIcon = document.querySelector('.index-task-card__icon span');
        if (cardIcon) cardIcon.textContent = habit.icon || 'eco';

        btn.setAttribute('data-habit-toggle', habit.id);

        // Completion logic
        btn.addEventListener('click', async () => {
          try {
            await window.GoHabitAPI.post(`/habits/${habit.id}/completions`);
            GoHabit.toast(`¡Has completado: ${habit.name}! 🌟`);
            paint(true);
            // Refresh profile data (seeds/lvl)
            GoHabit.initUser();
          } catch (err) {
            GoHabit.toast('Error al marcar hábito: ' + err.message, 'bad');
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    }
  }

  initNextHabit();
});
