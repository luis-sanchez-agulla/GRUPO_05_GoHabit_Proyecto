/* perfil.js – Lógica de subida de foto de perfil */

document.addEventListener('DOMContentLoaded', () => {
  const avatarEl      = document.getElementById('perfilAvatarEl');
  const placeholder   = document.getElementById('perfilAvatarPlaceholder');
  const editBtn       = document.getElementById('perfilAvatarEdit');
  const fileInput     = document.getElementById('perfilImageInput');

  if (!avatarEl || !editBtn || !fileInput) return;

  // Load saved avatar if exists
  const savedAvatar = localStorage.getItem('gohabit_avatar_url');
  if (savedAvatar) applyAvatar(savedAvatar);

  // Open file picker on click
  editBtn.addEventListener('click', () => fileInput.click());
  avatarEl.style.cursor = 'pointer';
  avatarEl.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    // Show loading ring
    editBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite">refresh</span>';

    try {
      const base64 = await compressImage(file, 240, 0.7);
      applyAvatar(base64);

      // Persist locally asap
      localStorage.setItem('gohabit_avatar_url', base64);

      // Try to save to backend too (non-blocking)
      if (window.GoHabitAPI?.put) {
        window.GoHabitAPI.put('/users/profile', { avatarUrl: base64 })
          .then(() => showToast('✅ Foto guardada'))
          .catch(() => showToast('⚠️ Guardado solo localmente'));

        // Also update session so the navbar picks it up
        const session = window.GoHabitAPI.getSessionUser?.();
        if (session) {
          window.GoHabitAPI.setSession?.(window.GoHabitAPI.getToken?.(), { ...session, avatarUrl: base64 });
        }
      } else {
        showToast('✅ Foto actualizada');
      }
    } catch (err) {
      console.error('Error al procesar la imagen:', err);
      showToast('❌ Error al procesar la imagen');
    } finally {
      editBtn.innerHTML = '<span class="material-symbols-outlined perfil-avatar-edit__icon">photo_camera</span>';
      fileInput.value = '';
    }
  });

  function applyAvatar(src) {
    avatarEl.style.backgroundImage = `url("${src}")`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    if (placeholder) placeholder.style.display = 'none';
  }

  function compressImage(file, maxPx, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxPx || h > maxPx) {
            if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
            else        { w = Math.round(w * maxPx / h); h = maxPx; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function showToast(msg) {
    if (window.GoHabit?.toast) {
      window.GoHabit.toast(msg, 'good');
      return;
    }
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:0.6rem 1.2rem;border-radius:12px;font-size:0.9rem;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,0.2)';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
});

/* CSS spin keyframe */
const _style = document.createElement('style');
_style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(_style);
