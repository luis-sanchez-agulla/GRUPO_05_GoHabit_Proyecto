document.addEventListener('DOMContentLoaded', () => {
  const refreshSeeds = GoHabit.bindSeeds('[data-seeds]');

  const container = document.querySelector('.habitos-cards-container');
  if(!container) return;

  const colorClass = (c) => {
    switch(String(c||'').toLowerCase()){
      case 'purple': return 'habit-card__icon-container--purple';
      case 'orange': return 'habit-card__icon-container--orange';
      case 'blue': return 'habit-card__icon-container--blue';
      case 'primary':
      default: return 'habit-card__icon-container--primary';
    }
  };

  function render(){
    const habits = GoHabit.ensureDefaultHabits();
    container.innerHTML = '';

    if(!habits.length){
      const empty = document.createElement('div');
      empty.className = 'habit-card';
      empty.innerHTML = `
        <div class="habit-card__icon-container habit-card__icon-container--primary">
          <span class="material-symbols-outlined">task_alt</span>
        </div>
        <div class="habit-card__content">
          <h3 class="habit-card__title">Todavia no tienes habitos</h3>
          <p class="habit-card__category">Crea el primero en "Anadir habito"</p>
        </div>
      `;
      container.appendChild(empty);
      return;
    }

    habits.forEach(h => {
      const wrapper = document.createElement('div');
      wrapper.className = 'habit-card';
      wrapper.setAttribute('data-habit-id', String(h.id));
      wrapper.setAttribute('data-reward', String(h.reward ?? 10));

      const done = GoHabit.getHabitDone(h.id);

      wrapper.innerHTML = `
        <div class="habit-card__icon-container ${colorClass(h.color)}">
          <span class="material-symbols-outlined">${h.icono || 'task_alt'}</span>
        </div>
        <div class="habit-card__content">
          <h3 class="habit-card__title">${escapeHTML(h.titulo)}</h3>
          <p class="habit-card__category">${escapeHTML(h.etiqueta || h.categoria || '')}</p>
        </div>
        <label class="habit-checkbox">
          <input class="habit-checkbox__input" type="checkbox" ${done ? 'checked' : ''}/>
          <div class="habit-checkbox__box">
            <span class="material-symbols-outlined habit-checkbox__icon">check</span>
          </div>
        </label>
      `;

      const input = wrapper.querySelector('input[type="checkbox"]');
      input.addEventListener('change', () => {
        const reward = parseInt(wrapper.getAttribute('data-reward') || '10', 10);
        GoHabit.toggleHabit(h.id, { reward });
        refreshSeeds();
      });

      container.appendChild(wrapper);
    });
  }

  function escapeHTML(str){
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  render();
});
