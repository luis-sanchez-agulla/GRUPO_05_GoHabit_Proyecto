/* chatbot.js – floating AI assistant bubble for GoHabit */
(function () {
  const WEEKDAY_TO_INDEX = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sábado: 6,
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[ch]));
  }

  function normalizeDays(days) {
    return Array.from(new Set((Array.isArray(days) ? days : [])
      .map((day) => String(day || '').trim())
      .filter(Boolean)));
  }

  function daysToFrequency(days) {
    return normalizeDays(days)
      .map((day) => {
        const key = day.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return WEEKDAY_TO_INDEX[key];
      })
      .filter((value) => typeof value === 'number');
  }

  function createChatbot() {
    if (document.getElementById('gh-chatbot-bubble')) return;

    // ── Bubble button ────────────────────────────────────────────
    const bubble = document.createElement('button');
    bubble.id = 'gh-chatbot-bubble';
    bubble.className = 'gh-chatbot-bubble';
    bubble.setAttribute('aria-label', 'Asistente IA');
    bubble.innerHTML = '<span class="material-symbols-outlined">smart_toy</span>';
    // Inline fallback styles to avoid being hidden by page-specific CSS conflicts.
    bubble.style.position = 'fixed';
    bubble.style.right = '20px';
    bubble.style.bottom = '90px';
    bubble.style.width = '56px';
    bubble.style.height = '56px';
    bubble.style.borderRadius = '50%';
    bubble.style.border = 'none';
    bubble.style.zIndex = '99999';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    bubble.style.justifyContent = 'center';
    bubble.style.background = 'linear-gradient(135deg, #4a7c59, #728764)';
    bubble.style.color = '#ffffff';
    bubble.style.boxShadow = '0 6px 24px rgba(0,0,0,.28)';
    bubble.style.cursor = 'pointer';

    // ── Panel ────────────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.id = 'gh-chatbot-panel';
    panel.className = 'gh-chatbot-panel gh-chatbot-panel--hidden';
    panel.style.zIndex = '100000';
    panel.innerHTML = `
      <div class="gh-chatbot-panel__header">
        <span class="material-symbols-outlined">smart_toy</span>
        <div>
          <p class="gh-chatbot-panel__title">Asistente GoHabit</p>
          <p class="gh-chatbot-panel__subtitle">Recomendaciones de hábitos con IA</p>
        </div>
        <button class="gh-chatbot-close" id="gh-chatbot-close" aria-label="Cerrar">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="gh-chatbot-messages" id="gh-chatbot-messages">
        <div class="gh-chatbot-msg gh-chatbot-msg--bot">
          <p class="gh-chatbot-msg__text">Hola. Soy tu asistente de hábitos. Cuéntame tus rutinas, retos o metas y te sugeriré hábitos personalizados usando IA.</p>
        </div>
      </div>

      <form class="gh-chatbot-form" id="gh-chatbot-form">
        <textarea
          id="gh-chatbot-input"
          class="gh-chatbot-input"
          placeholder="Ej: Quiero dormir mejor y reducir el estrés"
          rows="2"
          maxlength="500"
        ></textarea>
        <button type="submit" class="gh-chatbot-send" id="gh-chatbot-send">
          <span class="material-symbols-outlined">send</span>
        </button>
      </form>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    // ── State ─────────────────────────────────────────────────────
    let open = false;
    let conversationHistory = [];

    function togglePanel() {
      open = !open;
      panel.classList.toggle('gh-chatbot-panel--hidden', !open);
      if (open) {
        document.getElementById('gh-chatbot-input')?.focus();
      }
    }

    bubble.addEventListener('click', togglePanel);
    document.getElementById('gh-chatbot-close').addEventListener('click', togglePanel);

    // ── Helpers ───────────────────────────────────────────────────
    function appendMsg(text, role) {
      const box = document.getElementById('gh-chatbot-messages');
      if (!box) return;
      const div = document.createElement('div');
      div.className = `gh-chatbot-msg gh-chatbot-msg--${role}`;
      div.innerHTML = `<p class="gh-chatbot-msg__text">${escapeHtml(text)}</p>`;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    function appendSuggestion(suggestion) {
      const box = document.getElementById('gh-chatbot-messages');
      if (!box) return;

      const title     = suggestion?.title || 'Hábito sugerido';
      const reason    = suggestion?.reason || '';
      const frequency = suggestion?.frequency || '';
      const recommendedDays = normalizeDays(suggestion?.recommendedDays);
      const scheduleHint = suggestion?.scheduleHint || frequency;
      const icono     = suggestion?.icon || suggestion?.icono || 'task_alt';
      const categoria = suggestion?.category || suggestion?.categoria || 'salud';
      const daysLabel = recommendedDays.length ? recommendedDays.join(', ') : scheduleHint;

      const div = document.createElement('div');
      div.className = 'gh-chatbot-suggestion';
      div.innerHTML = `
        <div class="gh-chatbot-suggestion__header">
          <span class="material-symbols-outlined">${escapeHtml(icono)}</span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        ${reason    ? `<p class="gh-chatbot-suggestion__reason">${escapeHtml(reason)}</p>` : ''}
        ${frequency ? `<p class="gh-chatbot-suggestion__freq"><strong>Frecuencia:</strong> ${escapeHtml(frequency)}</p>` : ''}
        <p class="gh-chatbot-suggestion__freq"><strong>Días recomendados:</strong> ${escapeHtml(daysLabel)}</p>
        <p class="gh-chatbot-suggestion__freq"><strong>XP sugerida:</strong> ${escapeHtml(String(suggestion?.xpReward || 10))}</p>
        <button class="gh-chatbot-suggestion__add" data-title="${escapeHtml(title)}" data-icon="${escapeHtml(icono)}" data-cat="${escapeHtml(categoria)}" data-days="${escapeHtml(recommendedDays.join('|'))}" data-xp="${escapeHtml(String(suggestion?.xpReward || 10))}">
          <span class="material-symbols-outlined">add_circle</span> Añadir hábito
        </button>
      `;

      div.querySelector('.gh-chatbot-suggestion__add').addEventListener('click', function () {
        const btn = this;
        const days = (btn.dataset.days || '').split('|').filter(Boolean);
        const created = GoHabit.addHabit({
          titulo:    btn.dataset.title,
          icono:     btn.dataset.icon,
          categoria: btn.dataset.cat,
          etiqueta:  btn.dataset.cat,
          reward: Number(btn.dataset.xp || 10),
          frecuencia: daysToFrequency(days).length ? daysToFrequency(days) : [1,2,3,4,5],
        });

        if(!created || created.error){
          appendMsg(created?.message || `Máximo ${GoHabit.getHabitLimitPerDay()} hábitos por día.`, 'bot');
          return;
        }

        btn.textContent = 'Añadido';
        btn.disabled = true;
        btn.style.background = '#728764';

        // Recargar para que aparezca en la lista de objetivos
        setTimeout(() => {
          if (window.location.pathname.includes('habitos.html')) {
            window.location.reload();
          } else {
            GoHabit.toast('Hábito añadido. Ve a la sección de Hábitos para verlo.', 'good');
          }
        }, 800);
      });

      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    // ── Form submit ───────────────────────────────────────────────
    document.getElementById('gh-chatbot-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const input   = document.getElementById('gh-chatbot-input');
      const sendBtn = document.getElementById('gh-chatbot-send');
      const message = input.value.trim();
      if (!message) return;

      appendMsg(message, 'user');
      conversationHistory.push({ role: 'user', text: message });
      input.value = '';
      sendBtn.disabled = true;

      const typingEl = document.createElement('div');
      typingEl.className = 'gh-chatbot-msg gh-chatbot-msg--bot gh-chatbot-typing';
      typingEl.innerHTML = '<p class="gh-chatbot-msg__text">Analizando con IA<span class="gh-chatbot-dots">...</span></p>';
      const box = document.getElementById('gh-chatbot-messages');
      box.appendChild(typingEl);
      box.scrollTop = box.scrollHeight;

      try {
        const response = await window.GoHabitAPI.post('/ai/recommend', { 
            message,
            history: conversationHistory
        });
        const suggestions = response?.data?.suggestions || [];
        const textResponse = response?.data?.textResponse;
        const provider = response?.data?.provider || 'unknown';

        typingEl.remove();

        if (textResponse) {
          appendMsg(textResponse, 'bot');
          conversationHistory.push({ role: 'model', text: textResponse });
        } else if (!suggestions.length) {
          appendMsg('No pude generar sugerencias ahora mismo. Intenta describir más detalladamente tus metas.', 'bot');
          conversationHistory.push({ role: 'model', text: 'No pude generar sugerencias.' });
        }

        if (suggestions.length) {
          const providerLabel = provider === 'chatgpt'
            ? '(ChatGPT)'
            : '(Generador de Hábitos)';
          if (!textResponse) {
            appendMsg(`He analizado tu entrada y tengo ${suggestions.length} hábito(s) personalizados para ti ${providerLabel}:`, 'bot');
          }
          suggestions.forEach(s => appendSuggestion(s));
          
          const suggestionsText = suggestions.map(s => s.title).join(', ');
          if (!textResponse) {
            conversationHistory.push({ role: 'model', text: `Te sugerí los siguientes hábitos: ${suggestionsText}` });
          }
        }
      } catch (err) {
        typingEl.remove();
        appendMsg('Hubo un error al conectar con el asistente. Comprueba tu conexión e inténtalo de nuevo.', 'bot');
        console.error('Chatbot error:', err);
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbot);
  } else {
    createChatbot();
  }
})();
