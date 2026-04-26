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
      const allHabits = GoHabit.getHabitsList() || [];
      const empty = document.createElement('div');
      empty.className = 'habit-card gh-glass';
      
      if (allHabits.length > 0) {
        empty.innerHTML = `
          <div class="habit-card__icon-container habit-card__icon-container--primary">
            <span class="material-symbols-outlined">calendar_today</span>
          </div>
          <div class="habit-card__content">
            <h3 class="habit-card__title">Hoy descansas</h3>
            <p class="habit-card__category">Tienes ${allHabits.length} hábitos guardados, pero ninguno para hoy. ¡Sigue así!</p>
          </div>
        `;
      } else {
        empty.innerHTML = `
          <div class="habit-card__icon-container habit-card__icon-container--primary">
            <span class="material-symbols-outlined">add_task</span>
          </div>
          <div class="habit-card__content">
            <h3 class="habit-card__title">Empieza tu viaje</h3>
            <p class="habit-card__category">Crea tu primer hábito para empezar a ganar XP y semillas.</p>
          </div>
        `;
      }
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
      input.addEventListener('click', async (e) => {
        // Prevenir el cambio inmediato para validar
        e.preventDefault();
        
        const isCurrentlyDone = GoHabit.getHabitDone(h.id);
        if (isCurrentlyDone) {
            GoHabit.toast('Hábito ya completado', 'good', { icon: 'lock' });
            return;
        }

        const confirmed = await GoHabit.confirmModal('Completar hábito', `¿Has terminado "${h.titulo}" por hoy?`);
        if (!confirmed) return;

        const reward = parseInt(wrapper.getAttribute('data-reward') || '10', 10);
        const { done } = GoHabit.toggleHabit(h.id, { reward });
        
        if (done) {
            input.checked = true;
            refreshSeeds();
            try {
                const apiId = h.backendId || h.id;
                await GoHabitAPI.post(`/habits/${apiId}/completions`, { note: h.titulo });
            } catch (err) {
                console.error('Error sincronizando XP:', err);
            }
        }
      });

      container.appendChild(wrapper);
    });
  }

  function openManageModal(){
    const allHabits = GoHabit.ensureDefaultHabits();

    const overlay = document.createElement('div');
    overlay.className = 'habit-manage-overlay';

    const listHtml = allHabits.length
      ? allHabits.map((habit) => `
          <article class="habit-manage-item" data-manage-item="${String(habit.id)}">
            <div class="habit-manage-item__icon">
              <span class="material-symbols-outlined">${habit.icono || 'task_alt'}</span>
            </div>
            <div class="habit-manage-item__meta">
              <p class="habit-manage-item__title">${escapeHTML(habit.titulo)}</p>
              <p class="habit-manage-item__sub">${escapeHTML((habit.etiqueta || habit.categoria || '').toString())}</p>
            </div>
            <button class="habit-manage-item__delete" data-delete-habit="${String(habit.id)}" aria-label="Eliminar hábito">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </article>
        `).join('')
      : '<p class="habit-manage-empty">No tienes hábitos creados todavía.<br>¡Empieza añadiendo uno!</p>';

    overlay.innerHTML = `
      <div class="habit-manage-panel" role="dialog" aria-modal="true" aria-label="Gestionar hábitos">
        <div class="habit-manage-panel__header">
          <div class="habit-manage-panel__header-icon">
            <span class="material-symbols-outlined">tune</span>
          </div>
          <div>
            <h3 class="habit-manage-panel__title">Gestionar hábitos</h3>
            <p class="habit-manage-panel__sub">${allHabits.length} hábito${allHabits.length !== 1 ? 's' : ''} en total</p>
          </div>
          <button class="habit-manage-panel__close" data-close-manage aria-label="Cerrar">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="habit-manage-panel__list">${listHtml}</div>
        <div class="habit-manage-panel__footer">
          <a href="anadirHabito.html" class="habit-manage-panel__add-btn">
            <span class="material-symbols-outlined">add_circle</span>
            Añadir hábito
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    // Trigger animation
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    function close(){
      overlay.classList.remove('is-open');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    overlay.addEventListener('click', (event) => {
      if(event.target === overlay) close();
    });

    const closeBtn = overlay.querySelector('[data-close-manage]');
    if(closeBtn) closeBtn.addEventListener('click', close);

    overlay.querySelectorAll('[data-delete-habit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const habitId = btn.getAttribute('data-delete-habit');
        if(!habitId) return;

        const ok = window.confirm('¿Seguro que quieres eliminar este hábito?');
        if(!ok) return;

        const removed = GoHabit.removeHabit(habitId);
        if(removed){
          const item = overlay.querySelector(`[data-manage-item="${CSS.escape(String(habitId))}"]`);
          if(item){
            item.style.transition = 'all 0.25s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateX(30px)';
            setTimeout(() => item.remove(), 260);
          }
          GoHabit.toast('Hábito eliminado', 'good', { icon: 'delete' });
          render();
        } else {
          GoHabit.toast('No se pudo eliminar el hábito', 'bad', { icon: 'warning' });
        }

        const countEl = overlay.querySelector('.habit-manage-panel__sub');
        if(countEl){
          const remaining = overlay.querySelectorAll('[data-manage-item]').length - 1;
          countEl.textContent = `${remaining} hábito${remaining !== 1 ? 's' : ''} en total`;
        }

        const stillItems = overlay.querySelectorAll('[data-manage-item]').length;
        if(!stillItems){
          const listNode = overlay.querySelector('.habit-manage-panel__list');
          if(listNode) listNode.innerHTML = '<p class="habit-manage-empty">No tienes hábitos creados todavía.<br>¡Empieza añadiendo uno!</p>';
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

  // Re-renderizar cuando el sync de session-user.js descargue hábitos del servidor
  // (el render inicial ocurre antes de que llegue la respuesta async del backend)
  window.addEventListener('gohabit:habits-synced', () => render());

  if(manageBtn){
    manageBtn.addEventListener('click', openManageModal);
  }
});
