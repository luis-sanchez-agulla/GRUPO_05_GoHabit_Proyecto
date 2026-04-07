document.addEventListener('DOMContentLoaded', () => {
  if (!window.GoHabit) return;

  const CHESTS = {
    madera: {
      id: 'madera',
      name: 'Cofre de Madera',
      cost: 80,
      rarityWeights: { common: 80, rare: 18, epic: 2 },
    },
    plata: {
      id: 'plata',
      name: 'Cofre de Plata',
      cost: 180,
      rarityWeights: { common: 45, rare: 45, epic: 10 },
    },
    oro: {
      id: 'oro',
      name: 'Cofre de Oro',
      cost: 320,
      rarityWeights: { common: 15, rare: 50, epic: 35 },
    },
  };

  const COSMETICS = [
    { id: 'wood-cap', name: 'Gorra de Madera', icon: 'forest', slot: 'head', rarity: 'common' },
    { id: 'leaf-headband', name: 'Diadema de Hojas', icon: 'eco', slot: 'head', rarity: 'common' },
    { id: 'twig-glasses', name: 'Gafas de Rama', icon: 'visibility', slot: 'face', rarity: 'common' },
    { id: 'sprout-smile', name: 'Sonrisa Brote', icon: 'mood', slot: 'face', rarity: 'common' },

    { id: 'silver-crown', name: 'Corona de Plata', icon: 'diamond', slot: 'head', rarity: 'rare' },
    { id: 'moon-monocle', name: 'Monoculo Lunar', icon: 'lens_blur', slot: 'face', rarity: 'rare' },
    { id: 'wind-aura', name: 'Aura de Viento', icon: 'air', slot: 'aura', rarity: 'rare' },
    { id: 'butterfly-friend', name: 'Mariposa Compañera', icon: 'flutter_dash', slot: 'companion', rarity: 'rare' },

    { id: 'sun-halo', name: 'Halo Solar', icon: 'wb_sunny', slot: 'aura', rarity: 'epic' },
    { id: 'royal-crown', name: 'Corona Real', icon: 'workspace_premium', slot: 'head', rarity: 'epic' },
    { id: 'phoenix-tail', name: 'Cola Fenix', icon: 'local_fire_department', slot: 'companion', rarity: 'epic' },
    { id: 'star-visor', name: 'Visor Estelar', icon: 'auto_awesome', slot: 'face', rarity: 'epic' },
  ];

  const rarityLabel = {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
  };

  function rarityClass(rarity) {
    return `loot-result__rarity--${rarity || 'common'}`;
  }

  function pickRarity(weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((acc, [, value]) => acc + Number(value || 0), 0);
    const roll = Math.random() * total;

    let cursor = 0;
    for (const [rarity, weight] of entries) {
      cursor += Number(weight || 0);
      if (roll <= cursor) return rarity;
    }

    return 'common';
  }

  function pickRandomItem(chestId) {
    const chest = CHESTS[chestId];
    if (!chest) return null;

    const rarity = pickRarity(chest.rarityWeights);
    const inventory = window.GoHabit.getCosmeticsInventory();
    const ownedIds = new Set(inventory.map((item) => String(item.id)));

    const byRarity = COSMETICS.filter((item) => item.rarity === rarity);
    const unowned = byRarity.filter((item) => !ownedIds.has(String(item.id)));
    const pool = unowned.length ? unowned : byRarity;

    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderResult(result) {
    const panel = document.querySelector('[data-loot-result]');
    if (!panel) return;

    if (!result) {
      panel.innerHTML = '<p class="loot-result__placeholder">No se pudo abrir el cofre. Inténtalo de nuevo.</p>';
      return;
    }

    const rarity = result.rarity || 'common';
    const rarityText = rarityLabel[rarity] || 'Común';

    panel.innerHTML = `
      <div class="loot-result__card ${rarityClass(rarity)}">
        <span class="material-symbols-outlined loot-result__icon">${result.icon}</span>
        <div class="loot-result__text">
          <p class="loot-result__name">${result.name}</p>
          <p class="loot-result__meta">Rareza: ${rarityText}</p>
        </div>
      </div>
    `;
  }

  function showModal({
    title,
    body,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    showCancel = true,
    variant = '',
  }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'loot-modal';
      const variantClass = variant ? ` loot-modal__panel--${variant}` : '';
      overlay.innerHTML = `
        <div class="loot-modal__panel${variantClass}" role="dialog" aria-modal="true" aria-label="${title}">
          <h3 class="loot-modal__title">${title}</h3>
          <div class="loot-modal__body">${body}</div>
          <div class="loot-modal__actions">
            ${showCancel ? `<button class="loot-modal__btn loot-modal__btn--cancel" data-modal-cancel>${cancelText}</button>` : ''}
            <button class="loot-modal__btn loot-modal__btn--confirm" data-modal-confirm>${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const panel = overlay.querySelector('.loot-modal__panel');
      if (panel && variant === 'reveal') {
        setTimeout(() => {
          panel.classList.add('loot-modal__panel--revealed');
        }, 420);
      }

      function close(answer) {
        overlay.remove();
        resolve(answer);
      }

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          close(false);
        }
      });

      const confirmBtn = overlay.querySelector('[data-modal-confirm]');
      const cancelBtn = overlay.querySelector('[data-modal-cancel]');

      if (confirmBtn) confirmBtn.addEventListener('click', () => close(true));
      if (cancelBtn) cancelBtn.addEventListener('click', () => close(false));
    });
  }

  async function openChest(chestId) {
    const chest = CHESTS[chestId];
    if (!chest) return;

    const seeds = window.GoHabit.getSeeds();
    if (seeds < chest.cost) {
      const missing = chest.cost - seeds;
      window.GoHabit.toast(`Te faltan ${missing} semillas para abrir ${chest.name}.`, 'bad', { icon: 'warning' });
      return;
    }

    const accepted = await showModal({
      title: `Comprar ${chest.name}`,
      body: `<p>¿Quieres gastar <strong>${chest.cost} semillas</strong> para abrir este cofre?</p>`,
      confirmText: 'Comprar y abrir',
      cancelText: 'Cancelar',
      showCancel: true,
    });

    if (!accepted) {
      return;
    }

    window.GoHabit.subSeeds(chest.cost);

    const dropped = pickRandomItem(chestId);
    if (!dropped) {
      window.GoHabit.toast('No se pudo obtener un objeto del cofre.', 'bad', { icon: 'warning' });
      return;
    }

    const unlocked = window.GoHabit.unlockCosmetic({ ...dropped, sourceChest: chestId });

    if (unlocked.added) {
      window.GoHabit.equipCosmetic(unlocked.item.id);
      window.GoHabit.toast(`¡Te tocó ${unlocked.item.name}! Equipado automáticamente.`, 'good', { icon: 'inventory_2' });
      renderResult(unlocked.item);
      await showModal({
        title: 'Cofre abierto',
        body: `<p>¡Te tocó <strong>${unlocked.item.name}</strong>!</p><p>Rareza: ${rarityLabel[unlocked.item.rarity] || 'Común'}</p>`,
        confirmText: 'Genial',
        showCancel: false,
        variant: 'reveal',
      });
    } else {
      // Si ya existe en inventario, lo equipamos y devolvemos una parte del coste.
      const refund = Math.floor(chest.cost * 0.35);
      window.GoHabit.addSeeds(refund);
      window.GoHabit.equipCosmetic(unlocked.item.id);
      window.GoHabit.toast(`Repetido: ${unlocked.item.name}. Te devolvemos ${refund} semillas.`, 'good', { icon: 'replay' });
      renderResult(unlocked.item);
      await showModal({
        title: 'Cofre abierto',
        body: `<p>Te salió repetido: <strong>${unlocked.item.name}</strong>.</p><p>Reembolso: ${refund} semillas.</p>`,
        confirmText: 'Entendido',
        showCancel: false,
        variant: 'reveal',
      });
    }

    const seedEls = document.querySelectorAll('[data-seeds]');
    seedEls.forEach((el) => {
      el.textContent = window.GoHabit.getSeeds().toLocaleString('es-ES');
    });
  }

  document.querySelectorAll('[data-open-chest]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const chestId = btn.getAttribute('data-open-chest');
      await openChest(chestId);
    });
  });
});
