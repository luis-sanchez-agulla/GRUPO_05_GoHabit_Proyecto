document.addEventListener('DOMContentLoaded', () => {
  GoHabit.bindSeeds('[data-seeds]');

  // Wire all checkboxes that declare a habit id
  document.querySelectorAll('[data-habit-id]').forEach(wrapper => {
    const habitId = parseInt(wrapper.getAttribute('data-habit-id'), 10);
    const input = wrapper.querySelector('input[type="checkbox"]');
    if(!input || !Number.isFinite(habitId)) return;

    // init from storage
    input.checked = GoHabit.getHabitDone(habitId);

    input.addEventListener('change', () => {
      // keep storage consistent
      const checked = input.checked;
      GoHabit.setHabitDone(habitId, checked);
      const reward = parseInt(wrapper.getAttribute('data-reward') || '10', 10);
      const total = checked ? GoHabit.addSeeds(reward) : GoHabit.subSeeds(reward);
      GoHabit.toast(checked ? `+${reward} semillas 🌱` : `-${reward} semillas`, checked ? 'good' : 'bad');
      GoHabit.bindSeeds('[data-seeds]')();
      console.log('Seeds:', total);
    });
  });
});
