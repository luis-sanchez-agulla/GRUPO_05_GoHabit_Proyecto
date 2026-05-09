// avatarImage.js
// Central place to map "nivel" -> imagen + nombre + posición de mascota.
// 👉 Aquí es donde tú vas a cambiar las imágenes y las coordenadas de la mascota.

document.addEventListener('DOMContentLoaded', () => {
  if(!window.GoHabit) return;

  // 1) Pon tus imágenes en: front/assets/avatar/
  // 2) Cambia las rutas en esta lista (img)
  // 3) Ajusta los rangos de nivel si quieres
  const STAGES = {
    1: {
        name: 'Semilla',
        img: '../assets/avatar/lvl1.jpeg',
        img_night: '../assets/avatar/lvl1_noche.jpeg'
    },
    2: {
        name: 'Brote',
        img: '../assets/avatar/lv2.png',
        img_night: '../assets/avatar/lv2_noche.png'
    },
    3: {
        name: 'Tallo',
        img: '../assets/avatar/lv3.png',
        img_night: '../assets/avatar/lv3_noche.png'
    },
    4: {
        name: 'Planta Joven',
        img: '../assets/avatar/lv4.png',
        img_night: '../assets/avatar/lv4_noche.png'
    },
    5: {
        name: 'Árbol Pequeño',
        img: '../assets/avatar/lv5.png',
        img_night: '../assets/avatar/lv5_noche.png'
    },
    6: {
        name: 'Árbol Mediano',
        img: '../assets/avatar/lv6.png',
        img_night: '../assets/avatar/lv6_noche.png'
    },
    7: {
        name: 'Gran Árbol',
        img: '../assets/avatar/lv7.png',
        img_night: '../assets/avatar/lv7_noche.png'
    },
    8: {
        name: 'Árbol Sabio',
        img: '../assets/avatar/lv8.png',
        img_night: '../assets/avatar/lv8_noche.png'
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COORDENADAS DE LA MASCOTA — Edita aquí desde VSCode para cada nivel.
  //
  // Propiedades disponibles:
  //   bottom  : distancia desde el borde inferior del avatar (ej. '20%', '80px')
  //   right   : distancia desde el borde derecho            (ej. '8%',  '40px')
  //   left    : distancia desde el borde izquierdo          (usa esto en lugar de right)
  //   size    : tamaño de la mascota en píxeles             (número, ej. 65)
  //
  // Tip: abre las DevTools del navegador, inspecciona .index-tree-container
  // y ajusta los valores hasta que quede en el lugar correcto para cada nivel.
  // ─────────────────────────────────────────────────────────────────────────
  const COMPANION_POSITIONS = {
    1: { bottom: '10%', right: '30%',  size: 70 },
    2: { bottom: '28%', right: '22%',  size: 90 },
    3: { bottom: '12%', right: '25%',  size: 120 },
    4: { bottom: '18%', right: '30%',  size: 110 },
    5: { bottom: '12%', right: '18%',  size: 110 },
    6: { bottom: '12%', right: '30%',  size: 120 },
    7: { bottom: '15%', right: '20%',  size: 120 },
    8: { bottom: '8%',  right: '20%',  size: 120 },
  };

  const FALLBACK_IMG = '../assets/logo.png';

  const level = GoHabit.getLevel();
  // Exponer la posición de mascota del nivel actual para que renderEquippedOnAvatar la lea
  window.GoHabitPetConfig = COMPANION_POSITIONS[level] || COMPANION_POSITIONS[1];
  const hours = new Date().getHours();
  const isNight = hours >= 20 || hours < 7;

  // Pick the stage. If level is higher than 8, stay at 8 (Gran Árbol Sabio).
  const stage = STAGES[level] || (level > 8 ? STAGES[8] : STAGES[1]);
  let chosenImg = isNight && stage.img_night ? stage.img_night : stage.img;

  function preload(src){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Apply image with fallback so avatar is always visible.
  Promise.resolve()
    .then(() => preload(chosenImg))
    .then((src) => {
      document.querySelectorAll('[data-avatar-image]').forEach(el => {
        el.style.backgroundImage = `url("${src}")`;
        el.classList.add('gh-avatar-live');
      });
    })
    .catch(() => {
      document.querySelectorAll('[data-avatar-image]').forEach(el => {
        el.style.backgroundImage = `url("${FALLBACK_IMG}")`;
        el.classList.add('gh-avatar-live');
      });
    });

  // Update labels (if present)
  const levelLabel = document.querySelector('[data-avatar-level]');
  if(levelLabel) levelLabel.textContent = `Nivel ${level}`;

  const nameLabel = document.querySelector('[data-avatar-name]');
  if(nameLabel) nameLabel.textContent = stage.name;

  const levelNumber = document.querySelector('[data-avatar-level-number]');
  if(levelNumber) levelNumber.textContent = String(level);

  // Evolución (Popup)
  const lastLevelKey = 'gohabit_last_level_' + (GoHabit.getUser()?.id || 'anon');
  let lastSeenLevel = localStorage.getItem(lastLevelKey);
  
  if (lastSeenLevel === null) {
      localStorage.setItem(lastLevelKey, String(level));
      lastSeenLevel = level;
  } else {
      lastSeenLevel = parseInt(lastSeenLevel, 10);
  }

  if (level > lastSeenLevel) {
    localStorage.setItem(lastLevelKey, String(level));

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.color = '#fff';

    overlay.innerHTML = `
      <h2 style="font-size: 2.5rem; margin-bottom: 20px; text-shadow: 0 0 10px rgba(76, 175, 80, 0.8);">¡Tu Árbol ha evolucionado!</h2>
      <div style="width:200px; height:200px; background-image: url('${chosenImg}'); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 0 20px #4caf50);"></div>
      <p style="margin-top: 20px; font-size: 1.5rem;">Nuevo estado: <strong>${stage.name}</strong></p>
      <button style="margin-top: 30px; padding: 10px 30px; font-size: 1.2rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer;">¡Genial!</button>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('button').addEventListener('click', () => {
      overlay.remove();
    });
  } else {
    // Si no evoucionó igual guardamos el actual para estar seguros
    sessionStorage.setItem(lastLevelKey, String(level));
    localStorage.setItem(lastLevelKey, String(level));
  }

  // Render pets/cosmetics
  GoHabit.renderEquippedOnAvatar('.index-tree-container');
});
