// avatarImage.js
// Central place to map "nivel" -> imagen + nombre.
// 👉 Aquí es donde tú vas a cambiar las imágenes.

document.addEventListener('DOMContentLoaded', () => {
  if(!window.GoHabit) return;

  // Evoluciones reales disponibles en assets/avatar (lv1...lv8).
  const STAGES = [
    { min: 1, name: 'Brote', img: '../assets/avatar/lv1.png' },
    { min: 2, name: 'Evolucion II', img: '../assets/avatar/lv2.png' },
    { min: 3, name: 'Evolucion III', img: '../assets/avatar/lv3.png' },
    { min: 4, name: 'Evolucion IV', img: '../assets/avatar/lv4.png' },
    { min: 5, name: 'Evolucion V', img: '../assets/avatar/lv5.png' },
    { min: 6, name: 'Evolucion VI', img: '../assets/avatar/lv6.png' },
    { min: 7, name: 'Evolucion VII', img: '../assets/avatar/lv7.png' },
    { min: 8, name: 'Evolucion VIII', img: '../assets/avatar/lv8.png' },
  ];

  const FALLBACK_IMG = '../assets/logo.png';

  function getStageForLevel(level){
    // Pick the last stage where min <= level (capped at lv8 image).
    return STAGES
      .slice()
      .sort((a,b) => a.min - b.min)
      .reduce((acc, s) => (level >= s.min ? s : acc), STAGES[0]);
  }

  function preload(src){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });
  }

  function updateAvatarEvolution(){
    const level = GoHabit.getLevel();
    const stage = getStageForLevel(level);

    Promise.resolve()
      .then(() => preload(stage.img))
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

    const levelLabel = document.querySelector('[data-avatar-level]');
    if(levelLabel) levelLabel.textContent = `Nivel ${level}`;

    const nameLabel = document.querySelector('[data-avatar-name]');
    if(nameLabel) nameLabel.textContent = stage.name;

    const levelNumber = document.querySelector('[data-avatar-level-number]');
    if(levelNumber) levelNumber.textContent = String(level);
  }

  updateAvatarEvolution();
  window.addEventListener('gohabit:progress-changed', updateAvatarEvolution);
  window.addEventListener('storage', updateAvatarEvolution);
});
