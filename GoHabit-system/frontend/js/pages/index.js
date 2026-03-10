document.addEventListener('DOMContentLoaded', () => {
  // seeds counter
  GoHabit.bindSeeds('[data-seeds]');

  // Habit quick complete (demo habit id 1)
  const btn = document.querySelector('[data-habit-toggle]');
  if(!btn) return;

  const habitId = parseInt(btn.getAttribute('data-habit-toggle'), 10);

  function paint(done){
    const icon = btn.querySelector('.material-symbols-outlined');
    if(done){
      btn.classList.add('is-done');
      btn.style.background = '#728764';
      btn.style.color = 'white';
      if(icon) icon.textContent = 'check';
    }else{
      btn.classList.remove('is-done');
      btn.style.background = '';
      btn.style.color = '';
      if(icon) icon.textContent = 'radio_button_unchecked';
    }
  }

  paint(GoHabit.getHabitDone(habitId));

  btn.addEventListener('click', () => {
    const {done} = GoHabit.toggleHabit(habitId, { reward: 10 });
    paint(done);
    GoHabit.bindSeeds('[data-seeds]')();
  });
});
