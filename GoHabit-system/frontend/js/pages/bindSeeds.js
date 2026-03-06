document.addEventListener('DOMContentLoaded', () => {
  if (typeof GoHabit === 'undefined') return;
  if (document.querySelector('[data-seeds]')) {
    GoHabit.bindSeeds('[data-seeds]');
  }
});
