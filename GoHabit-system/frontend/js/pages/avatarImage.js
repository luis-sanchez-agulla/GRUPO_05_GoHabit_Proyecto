// avatarImage.js
// Central place to map "nivel" -> imagen + nombre.
// 👉 Aquí es donde tú vas a cambiar las imágenes.

document.addEventListener('DOMContentLoaded', () => {
  if(!window.GoHabit) return;

  // 1) Pon tus imágenes en: front/assets/avatar/
  // 2) Cambia las rutas en esta lista (img)
  // 3) Ajusta los rangos de nivel si quieres
  const STAGES = [
    { min: 1,  name: 'Brote',       img: '../assets/avatar/lv1.png' },
    { min: 3,  name: 'Arbolito',    img: '../assets/avatar/lv3.png' },
    { min: 5,  name: 'Roble Joven', img: '../assets/avatar/lv5.png' },
    { min: 8,  name: 'Roble Fuerte',img: '../assets/avatar/lv8.png' },
    { min: 12, name: 'Roble Épico', img: '../assets/avatar/lv12.png' },
  ];

  const level = GoHabit.getLevel();

  // Pick the last stage where min <= level
  const stage = STAGES
    .slice()
    .sort((a,b) => a.min - b.min)
    .reduce((acc, s) => (level >= s.min ? s : acc), STAGES[0]);

  // Apply image
  document.querySelectorAll('[data-avatar-image]').forEach(el => {
    // If your images are local and you open with file://, some browsers may block.
    // Recomendación: usar Live Server (VSCode) para que carguen perfecto.
    el.style.backgroundImage = `url("${stage.img}")`;
  });

  // Update labels (if present)
  const levelLabel = document.querySelector('[data-avatar-level]');
  if(levelLabel) levelLabel.textContent = `Nivel ${level}`;

  const nameLabel = document.querySelector('[data-avatar-name]');
  if(nameLabel) nameLabel.textContent = stage.name;

  const levelNumber = document.querySelector('[data-avatar-level-number]');
  if(levelNumber) levelNumber.textContent = String(level);
});
