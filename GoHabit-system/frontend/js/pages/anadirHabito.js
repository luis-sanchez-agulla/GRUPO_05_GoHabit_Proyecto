document.addEventListener('DOMContentLoaded', () => {
  GoHabit.bindSeeds('[data-seeds]');

  const form = document.getElementById('habitForm');
  if(!form) return;

  const categoryButtons = document.querySelectorAll('.category-button');
  const frequencyDays = document.querySelectorAll('.frequency-day');

  const state = {
    categoria: 'salud',
    frecuencia: [1,2,3,4,5],
  };

  // category
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.categoria = btn.getAttribute('data-category') || 'salud';
    });
  });

  // frequency
  frequencyDays.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const day = parseInt(btn.getAttribute('data-day') || '0', 10);
      if(state.frecuencia.includes(day)){
        state.frecuencia = state.frecuencia.filter(d => d !== day);
      }else{
        state.frecuencia.push(day);
      }
    });
  });

  function iconForCategory(cat){
    switch(String(cat||'').toLowerCase()){
      case 'mente': return { icono: 'psychology', color: 'purple', etiqueta: 'Mente' };
      case 'deporte': return { icono: 'fitness_center', color: 'blue', etiqueta: 'Deporte' };
      case 'espiritu':
      case 'espíritu':
      case 'espiritualidad': return { icono: 'auto_awesome', color: 'orange', etiqueta: 'Espiritualidad' };
      case 'salud':
      default: return { icono: 'favorite', color: 'primary', etiqueta: 'Salud' };
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('nombreHabito')?.value?.trim();
    const metaValor = parseInt(document.getElementById('metaValor')?.value || '1', 10);
    const metaUnidad = document.getElementById('metaUnidad')?.value || 'veces';
    const recordatorio = !!document.getElementById('recordatorio')?.checked;

    if(!titulo){
      GoHabit.toast('Ponle un nombre al hábito', 'bad');
      return;
    }
    if(state.frecuencia.length === 0){
      GoHabit.toast('Selecciona al menos 1 día', 'bad');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if(submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';
    }

    const metaTxt = `${metaValor} ${metaUnidad}`;
    const metaLabel = (metaUnidad === 'litros') ? 'Hidratación' : (metaUnidad === 'paginas' ? 'Lectura' : (metaUnidad === 'minutos' ? 'Tiempo' : 'Objetivo'));

    const map = iconForCategory(state.categoria);

    let aiReward = Math.max(8, Math.min(20, 8 + Math.ceil(state.frecuencia.length * 1.5)));
    let backendId = null;

    try {
      if (window.GoHabitAPI?.post) {
        // 1. Obtener recompensa AI si es posible
        const aiMessage = `Quiero crear este hábito: ${titulo}. Categoría: ${state.categoria}. Meta: ${metaValor} ${metaUnidad}. Frecuencia semanal: ${state.frecuencia.length} días.`;
        const aiResponse = await window.GoHabitAPI.post('/ai/recommend', { message: aiMessage }).catch(() => null);
        
        if (aiResponse?.data?.suggestions?.[0]) {
            const maybeReward = Number(aiResponse.data.suggestions[0].xpReward || 0);
            if (maybeReward > 0) aiReward = maybeReward;
        }

        // 2. Sincronizar con el backend para tener un ID real en el muro social
        const backendRes = await window.GoHabitAPI.post('/habits', {
            title: `${titulo} (${metaTxt})`,
            description: `Meta: ${metaTxt}`,
            frequency: state.frecuencia.join(','), // Guardamos los días como string
            targetCount: metaValor,
            color: map.color,
            icon: map.icono
        }).catch(err => {
            console.warn('Backend habit creation failed, falling back to local only:', err);
            return null;
        });

        if (backendRes?.data?.id) {
            backendId = backendRes.data.id;
        }
      }
    } catch (err) {
      console.error("Error during habit synchronization:", err);
    }

    const created = GoHabit.addHabit({
      titulo: `${titulo} (${metaTxt})`,
      categoria: state.categoria,
      etiqueta: map.etiqueta || metaLabel,
      icono: map.icono,
      color: map.color,
      reward: aiReward,
      frecuencia: state.frecuencia.slice(),
      metaValor,
      metaUnidad,
      recordatorio,
      backendId: backendId, // Guardamos el ID del servidor
    });

    if(!created || created.error){
      GoHabit.toast(created?.message || `Máximo ${GoHabit.getHabitLimitPerDay()} hábitos por día.`, 'bad');
      if(submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Hábito';
      }
      return;
    }

    // Mejora del feedback: informar en qué días aparecerá
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const diasTxt = state.frecuencia.map(d => dias[d]).join(', ');
    
    GoHabit.toast(`¡Hábito guardado! Programado para: ${diasTxt}`, 'good', { duration: 4000 });
    
    setTimeout(() => {
        window.location.href = 'habitos.html';
    }, 1200);
  });
});
