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

  const PET_BONUS_LABELS = {
    common: '+5% Semillas al completar hábitos',
    rare:   '+10% XP al completar hábitos',
    epic:   '+15% Semillas y XP al completar hábitos',
  };

  function getSellValue(item) {
    const cost = (window.GoHabit.CHEST_COSTS || {})[item.sourceChest] || 80;
    return Math.floor(cost * 0.20);
  }

  function renderEquippedOnAvatar() {
    const container = document.querySelector('.avatar-tree-container');
    if (!container) return;

    container.querySelectorAll('.avatar-cosmetic').forEach((el) => el.remove());

    const companionSlot = document.getElementById('avatar-companion-slot');
    if (companionSlot) {
      companionSlot.querySelectorAll('.avatar-companion-slot__img, .avatar-companion-slot__icon').forEach((el) => el.remove());
    }

    const equipped = window.GoHabit.getCosmeticsEquipped();
    const inventory = window.GoHabit.getCosmeticsInventory();
    const map = inventory.reduce((acc, item) => {
      acc[String(item.id)] = item;
      return acc;
    }, {});

    Object.keys(equipped).forEach((slot) => {
      const itemId = equipped[slot];
      const item = map[String(itemId)];
      if (!item) return;

      if (item.slot === 'companion' && companionSlot) {
        const emptyIcon = companionSlot.querySelector('.avatar-companion-slot__empty');
        if (emptyIcon) emptyIcon.style.display = 'none';

        if (item.image) {
          const img = document.createElement('img');
          img.src = item.image;
          img.className = 'avatar-companion-slot__img';
          img.alt = item.name;
          companionSlot.appendChild(img);
        } else {
          const icon = document.createElement('span');
          icon.className = `material-symbols-outlined avatar-companion-slot__icon avatar-cosmetic--${item.rarity || 'common'}`;
          icon.textContent = item.icon || 'pets';
          icon.title = item.name || 'Mascota';
          companionSlot.appendChild(icon);
        }
      } else {
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
      }
    });

    if (companionSlot && !equipped['companion']) {
      const emptyIcon = companionSlot.querySelector('.avatar-companion-slot__empty');
      if (emptyIcon) emptyIcon.style.display = '';
    }
  }

  function renderInventoryPanel() {
    const main = document.querySelector('.avatar-main');
    if (!main) return;

    let panel = document.querySelector('.avatar-inventory');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'avatar-inventory';
      main.appendChild(panel);
    }

    const inventory = window.GoHabit.getCosmeticsInventory();
    const equipped  = window.GoHabit.getCosmeticsEquipped();
    const activeBonus = window.GoHabit.getEquippedCompanionBonus();

    const bonusBanner = activeBonus ? `
      <div class="avatar-bonus-banner">
        <span class="material-symbols-outlined avatar-bonus-banner__icon">auto_awesome</span>
        <span><strong>${activeBonus.companion.name}</strong>: ${activeBonus.label}</span>
      </div>
    ` : '';

    panel.innerHTML = `
      <h2 class="avatar-inventory__title">Objetos del Muñeco</h2>
      ${bonusBanner}
      <div class="avatar-inventory__list" data-avatar-inventory></div>
    `;

    const list = panel.querySelector('[data-avatar-inventory]');

    if (!inventory.length) {
      list.innerHTML = '<p class="avatar-inventory__empty">Abre cofres en la tienda para conseguir objetos.</p>';
      return;
    }

    list.innerHTML = inventory.map((item) => {
      const isEquipped   = equipped[item.slot] === item.id;
      const isCompanion  = item.slot === 'companion';
      const bonusLabel   = PET_BONUS_LABELS[item.rarity] || PET_BONUS_LABELS.common;
      const sellVal      = getSellValue(item);

      return `
        <article class="avatar-item avatar-item--${item.rarity || 'common'}">
          ${item.image
            ? `<img src="${item.image}" class="avatar-item__icon" style="width:40px;height:40px;object-fit:contain;background:none;line-height:0;">`
            : `<span class="material-symbols-outlined avatar-item__icon">${item.icon}</span>`
          }
          <div class="avatar-item__meta">
            <p class="avatar-item__name">${item.name}</p>
            <p class="avatar-item__rarity">${rarityLabel[item.rarity] || 'Común'} · Mascota</p>
            ${isCompanion ? `<p class="avatar-item__bonus">${bonusLabel}</p>` : ''}
          </div>
          <div class="avatar-item__actions">
            <button class="avatar-item__btn" data-equip-item="${item.id}">${isEquipped ? 'Quitar' : 'Equipar'}</button>
            <button class="avatar-item__sell-btn" data-sell-item="${item.id}" title="Vender por ${sellVal} semillas">Vender · ${sellVal}🌱</button>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('[data-equip-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-equip-item');
        const inv    = window.GoHabit.getCosmeticsInventory();
        const item   = inv.find((i) => String(i.id) === String(itemId));
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

    list.querySelectorAll('[data-sell-item]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const itemId = btn.getAttribute('data-sell-item');
        const inv    = window.GoHabit.getCosmeticsInventory();
        const item   = inv.find((i) => String(i.id) === String(itemId));
        if (!item) return;

        const sellVal   = getSellValue(item);
        const confirmed = await window.GoHabit.confirmModal(
          `Vender ${item.name}`,
          `¿Seguro? Recibirás <strong>${sellVal} semillas</strong>. Esta acción no se puede deshacer.`
        );
        if (!confirmed) return;

        const result = window.GoHabit.sellCosmetic(itemId);
        if (result) {
          window.GoHabit.toast(`Vendiste ${result.item.name} por ${result.sellValue} semillas.`, 'good', { icon: 'sell' });
          document.querySelectorAll('[data-seeds]').forEach((el) => {
            el.textContent = window.GoHabit.getSeeds().toLocaleString('es-ES');
          });
          renderEquippedOnAvatar();
          renderInventoryPanel();
        }
      });
    });
  }

  window.GoHabit.renderEquippedOnAvatar('.avatar-tree-container');
  renderInventoryPanel();
});
