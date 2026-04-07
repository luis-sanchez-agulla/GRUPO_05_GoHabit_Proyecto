document.addEventListener('DOMContentLoaded', () => {
  const refreshSeeds = GoHabit.bindSeeds('[data-seeds]');

  const container = document.querySelector('.habitos-cards-container');
  const manageBtn = document.querySelector('[data-manage-habits]');
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
    const habits = GoHabit.getDueHabitsForDate(new Date());
    container.innerHTML = '';

    if(!habits.length){
      const empty = document.createElement('div');
      empty.className = 'habit-card';
      empty.innerHTML = `
        <div class="habit-card__icon-container habit-card__icon-container--primary">
          <span class="material-symbols-outlined">task_alt</span>
        </div>
        <div class="habit-card__content">
          <h3 class="habit-card__title">No tienes objetivos para hoy</h3>
          <p class="habit-card__category">Tus hábitos de otros días no se muestran en esta lista diaria.</p>
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

  function openManageModal(){
    const allHabits = GoHabit.ensureDefaultHabits();

    const overlay = document.createElement('div');
    overlay.className = 'habit-manage-modal';

    const listHtml = allHabits.length
      ? allHabits.map((habit) => `
          <article class="habit-manage-item" data-manage-item="${String(habit.id)}">
            <div class="habit-manage-item__meta">
              <p class="habit-manage-item__title">${escapeHTML(habit.titulo)}</p>
              <p class="habit-manage-item__sub">${escapeHTML((habit.etiqueta || habit.categoria || '').toString())}</p>
            </div>
            <button class="habit-manage-item__delete" data-delete-habit="${String(habit.id)}">Eliminar</button>
          </article>
        `).join('')
      : '<p class="habit-manage-empty">No tienes hábitos creados.</p>';

    overlay.innerHTML = `
      <div class="habit-manage-modal__panel" role="dialog" aria-modal="true" aria-label="Gestionar hábitos">
        <h3 class="habit-manage-modal__title">Gestionar hábitos</h3>
        <div class="habit-manage-modal__list">${listHtml}</div>
        <div class="habit-manage-modal__footer">
          <button class="habit-manage-modal__close" data-close-manage>Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    function close(){
      overlay.remove();
    }

    overlay.addEventListener('click', (event) => {
      if(event.target === overlay){
        close();
      }
    });

    const closeBtn = overlay.querySelector('[data-close-manage]');
    if(closeBtn){
      closeBtn.addEventListener('click', close);
    }

    overlay.querySelectorAll('[data-delete-habit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const habitId = btn.getAttribute('data-delete-habit');
        if(!habitId) return;

        const ok = window.confirm('¿Seguro que quieres eliminar este hábito?');
        if(!ok) return;

        const removed = GoHabit.removeHabit(habitId);
        if(removed){
          const item = overlay.querySelector(`[data-manage-item="${CSS.escape(String(habitId))}"]`);
          if(item) item.remove();
          GoHabit.toast('Hábito eliminado', 'good', { icon: 'delete' });
          render();
        } else {
          GoHabit.toast('No se pudo eliminar el hábito', 'bad', { icon: 'warning' });
        }

        const stillItems = overlay.querySelectorAll('[data-manage-item]').length;
        if(!stillItems){
          const listNode = overlay.querySelector('.habit-manage-modal__list');
          if(listNode) listNode.innerHTML = '<p class="habit-manage-empty">No tienes hábitos creados.</p>';
        }
      });
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

  if(manageBtn){
    manageBtn.addEventListener('click', openManageModal);
  }
});
