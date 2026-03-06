document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Bindings
  GoHabit.bindSeeds('[data-seeds]');

  const habitsContainer = document.querySelector('.habitos-cards-container');

  // 2. Helper to create a habit card
  function createHabitCard(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    div.setAttribute('data-habit-id', habit.id);

    const isDone = habit.completedToday || false;

    div.innerHTML = `
            <div class="habit-card__icon-container habit-card__icon-container--${habit.color || 'primary'}">
                <span class="material-symbols-outlined">${habit.icon || 'eco'}</span>
            </div>
            <div class="habit-card__content">
                <h3 class="habit-card__title">${habit.name}</h3>
                <p class="habit-card__category">${habit.category || 'Hábito'}</p>
            </div>
            <label class="habit-checkbox">
                <input class="habit-checkbox__input" type="checkbox" ${isDone ? 'checked' : ''} />
                <div class="habit-checkbox__box">
                    <span class="material-symbols-outlined habit-checkbox__icon">check</span>
                </div>
            </label>
        `;

    const checkbox = div.querySelector('.habit-checkbox__input');
    checkbox.addEventListener('change', async () => {
      try {
        // If it was already checked, we might want to "un-complete" if the backend supports it
        // For now, let's assume we always POST to complete
        if (checkbox.checked) {
          await window.GoHabitAPI.post(`/habits/${habit.id}/completions`);
          GoHabit.toast(`¡Has completado: ${habit.name}! 🌟`);
        } else {
          // Placeholder for un-completing if implemented
          GoHabit.toast('Hábito desmarcado', 'bad');
        }
        // Refresh profile data
        GoHabit.initUser();
      } catch (err) {
        checkbox.checked = !checkbox.checked; // Revert
        GoHabit.toast('Error: ' + err.message, 'bad');
      }
    });

    return div;
  }

  // 3. Fetch and render habits
  async function loadHabits() {
    if (!window.GoHabitAPI) return;

    try {
      habitsContainer.innerHTML = '<p style="text-align:center;width:100%;padding:20px;">Cargando tus objetivos...</p>';
      const habits = await window.GoHabitAPI.get('/habits');

      habitsContainer.innerHTML = ''; // Clear loading

      if (habits.data && habits.data.length > 0) {
        habits.data.forEach(habit => {
          habitsContainer.appendChild(createHabitCard(habit));
        });
      } else {
        habitsContainer.innerHTML = '<p style="text-align:center;width:100%;padding:20px;">No tienes hábitos creados. ¡Añade uno nuevo!</p>';
      }
    } catch (err) {
      console.error('Failed to load habits:', err);
      habitsContainer.innerHTML = '<p style="text-align:center;width:100%;padding:20px;color:red;">Error al cargar hábitos.</p>';
    }
  }

  loadHabits();
});
