document.addEventListener('DOMContentLoaded', () => {
  if (!window.GoHabit) return;

  const SLOT_CLASS = {
    head: 'avatar-cosmetic--head',
    face: 'avatar-cosmetic--face',
    aura: 'avatar-cosmetic--aura',
    companion: 'avatar-cosmetic--companion',
  };

  const rarityLabel = {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
  };

  function getInventoryMap() {
    const inventory = window.GoHabit.getCosmeticsInventory();
    return inventory.reduce((acc, item) => {
      acc[String(item.id)] = item;
      return acc;
    }, {});
  }

  function renderEquippedOnAvatar() {
    const container = document.querySelector('.avatar-tree-container');
    if (!container) return;

    container.querySelectorAll('.avatar-cosmetic').forEach((el) => el.remove());

    const equipped = window.GoHabit.getCosmeticsEquipped();
    const map = getInventoryMap();

    Object.keys(equipped).forEach((slot) => {
      const itemId = equipped[slot];
      const item = map[String(itemId)];
      if (!item) return;

      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.className = `avatar-cosmetic ${SLOT_CLASS[item.slot] || ''}`;
        img.style.width = '64px';
        img.style.height = '64px';
        img.style.objectFit = 'contain';
        img.alt = item.name;
        container.appendChild(img);
      } else {
        const icon = document.createElement('span');
        icon.className = `material-symbols-outlined avatar-cosmetic ${SLOT_CLASS[item.slot] || ''} avatar-cosmetic--${item.rarity || 'common'}`;
        icon.textContent = item.icon || 'star';
        icon.title = item.name || 'Objeto';
        container.appendChild(icon);
      }
    });
  }

  function renderInventoryPanel() {
    const main = document.querySelector('.avatar-main');
    if (!main) return;

    let panel = document.querySelector('.avatar-inventory');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'avatar-inventory';
      panel.innerHTML = `
        <h2 class="avatar-inventory__title">Objetos del Muñeco</h2>
        <div class="avatar-inventory__list" data-avatar-inventory></div>
      `;
      main.appendChild(panel);
    }

    const list = panel.querySelector('[data-avatar-inventory]');
    const inventory = window.GoHabit.getCosmeticsInventory();
    const equipped = window.GoHabit.getCosmeticsEquipped();

    if (!inventory.length) {
      list.innerHTML = '<p class="avatar-inventory__empty">Abre cofres en la tienda para conseguir objetos.</p>';
      return;
    }

    list.innerHTML = inventory.map((item) => {
      const isEquipped = equipped[item.slot] === item.id;
      return `
        <article class="avatar-item avatar-item--${item.rarity || 'common'}">
          ${item.image ? `<img src="${item.image}" class="avatar-item__icon" style="width:40px;height:40px;object-fit:contain;background:none;line-height:0;">` : `<span class="material-symbols-outlined avatar-item__icon">${item.icon}</span>`}
          <div class="avatar-item__meta">
            <p class="avatar-item__name">${item.name}</p>
            <p class="avatar-item__rarity">${rarityLabel[item.rarity] || 'Común'} · ${item.slot}</p>
          </div>
          <button class="avatar-item__btn" data-equip-item="${item.id}">${isEquipped ? 'Quitar' : 'Equipar'}</button>
        </article>
      `;
    }).join('');

    list.querySelectorAll('[data-equip-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-equip-item');
        const currentMap = getInventoryMap();
        const item = currentMap[String(itemId)];
        if (!item) return;

        const current = window.GoHabit.getCosmeticsEquipped();
        if (current[item.slot] === item.id) {
          window.GoHabit.unequipCosmetic(item.slot);
          window.GoHabit.toast(`Quitaste ${item.name}.`, 'good', { icon: 'visibility_off' });
        } else {
          window.GoHabit.equipCosmetic(item.id);
          window.GoHabit.toast(`Equipaste ${item.name}.`, 'good', { icon: 'check_circle' });
        }

        renderEquippedOnAvatar();
        renderInventoryPanel();
      });
    });
  }

  window.GoHabit.renderEquippedOnAvatar('.avatar-tree-container');
  renderInventoryPanel();
});
