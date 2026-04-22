/**
 * social.js - Lógica de la red social de GoHabit (v2.0 Luxury)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar Tabs
    initTabs();

    // 2. Cargar Badge de Solicitudes
    await updateRequestsBadge();

    // 3. Cargar Amigos - Esperamos a que la sesión esté lista si es necesario
    const waitForToken = async (retries = 10) => {
        for (let i = 0; i < retries; i++) {
            if (window.GoHabitAPI?.getToken()) return true;
            await new Promise(r => setTimeout(r, 200));
        }
        return false;
    };

    await waitForToken();
    await loadFriends();

    // 4. Configurar Buscador
    initSearch();
});

function initTabs() {
    const tabs = document.querySelectorAll('.social-tab');
    const contents = document.querySelectorAll('.social-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            const target = tab.getAttribute('data-tab');

            // Actualizar UI de tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Actualizar contenido
            contents.forEach(c => c.classList.remove('active'));
            const targetContent = document.getElementById(`tab-${target}`);
            if (targetContent) targetContent.classList.add('active');

            // Cargar datos específicos
            if (target === 'friends') await loadFriends();
            if (target === 'requests') await loadPendingRequests();
        });
    });
}

function createActivityCard(item) {
    const div = document.createElement('div');
    div.className = 'activity-card gh-card';

    const fecha = item.completedAt
        ? new Date(item.completedAt).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })
        : '';

    let imgSrc = item.imageUrl;
    if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
        imgSrc = `data:image/jpeg;base64,${imgSrc}`;
    }

    const badgeColor = item.habitColor || '#728764';
    const isOwn = item._own;

    div.innerHTML = `
        <div class="activity-card__header">
            <div class="activity-card__user-meta">
                <div class="activity-card__avatar">
                    ${item.friendAvatar
                        ? `<img src="${item.friendAvatar}" alt="${item.friendUsername}">`
                        : '<span class="material-symbols-outlined">account_circle</span>'}
                </div>
                <div class="activity-card__user-info">
                    <p class="activity-card__username">${isOwn ? 'Tú' : item.friendUsername}</p>
                    <p class="activity-card__time">${fecha}</p>
                </div>
            </div>
            <div class="activity-card__badge-ia">
                <span class="material-symbols-outlined">verified</span>
                <span>IA VERIFIED</span>
            </div>
        </div>

        <div class="activity-card__content">
            <div class="activity-card__habit-info">
                <span class="activity-card__habit-icon" style="background:${badgeColor}20; color:${badgeColor}">
                    <span class="material-symbols-outlined">${item.habitIcon || 'task_alt'}</span>
                </span>
                <p>Completó <strong>${item.habitTitle}</strong></p>
            </div>

            ${imgSrc ? `
            <div class="activity-card__visual">
                <img src="${imgSrc}" class="activity-card__img" alt="Foto del hábito" loading="lazy">
                <div class="activity-card__img-overlay">
                    <span class="material-symbols-outlined">zoom_in</span>
                </div>
            </div>
            ` : `
            <div class="activity-card__no-image">
                <span class="material-symbols-outlined">image_not_supported</span>
                <span>Sin evidencia visual</span>
            </div>
            `}

            ${item.note ? `<div class="activity-card__caption">"${item.note}"</div>` : ''}
        </div>
    `;

    // Click en imagen para ampliar
    const imgEl = div.querySelector('.activity-card__img');
    if (imgEl) {
        imgEl.addEventListener('click', () => openImageLightbox(imgSrc, item.friendUsername, item.habitTitle));
    }

    return div;
}

/**
 * Abre la imagen en un lightbox simple
 */
function openImageLightbox(src, username, habitTitle) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:9999;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        padding:1rem; cursor:zoom-out; animation: ghSlideIn .2s ease;
    `;
    overlay.innerHTML = `
        <p style="color:white; font-weight:700; margin-bottom:.75rem; font-size:.9rem; opacity:.8">
            ${username} · ${habitTitle}
        </p>
        <img src="${src}" style="max-width:100%; max-height:85vh; border-radius:16px; object-fit:contain; box-shadow:0 30px 80px rgba(0,0,0,.6)">
        <p style="color:white; opacity:.4; font-size:.75rem; margin-top:.75rem">Toca para cerrar</p>
    `;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
}

/**
 * Carga la lista de amigos actuales
 */
async function loadFriends() {
    const container = document.getElementById('friends-list-container');
    if (!container) return;

    try {
        container.innerHTML = '<div class="social-loader">Buscando amigos...</div>';
        const response = await GoHabitAPI.get('/friends');
        const friends = response?.data || [];

        if (friends.length === 0) {
            container.innerHTML = `
                <div class="social-empty-state">
                    <p>Aún no tienes amigos agregados. ¡Usa el buscador para conectar!</p>
                </div>
            `;
            return;
        }

        friends.forEach(friend => {
            const div = document.createElement('div');
            div.className = 'friend-item gh-card';
            
            // Calculamos una barra de progreso ficticia o real si tuviéramos meta
            const progressPercent = Math.min((friend.points % 1000) / 10, 100); 

            div.innerHTML = `
                <div class="friend-item__profile">
                    <div class="activity-card__avatar">
                        ${friend.avatarUrl ? `<img src="${friend.avatarUrl}" alt="${friend.username}">` : '<span class="material-symbols-outlined">person</span>'}
                    </div>
                    <div class="friend-item__info">
                        <p class="friend-item__name">${friend.username}</p>
                        <div class="friend-item__stats">
                            <span class="friend-item__badge">Niv. ${friend.level || 1}</span>
                            <span class="friend-item__xp">${friend.points || 0} XP</span>
                        </div>
                        <div class="friend-item__progress-bar">
                            <div class="friend-item__progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
                <button class="friend-item__action remove-friend-btn" data-id="${friend.id}" aria-label="Eliminar amigo">
                    <span class="material-symbols-outlined">person_remove</span>
                </button>
            `;
            container.appendChild(div);
        });

        // Listeners para eliminar
        container.querySelectorAll('.remove-friend-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if(confirm('¿Seguro que quieres eliminar a este amigo?')) {
                    const id = btn.getAttribute('data-id');
                    try {
                        await GoHabitAPI.delete(`/friends/${id}`);
                        GoHabit.toast('Amigo eliminado', 'good');
                        await loadFriends();
                    } catch(e) { GoHabit.toast('Error al eliminar', 'bad'); }
                }
            });
        });

    } catch (err) {
        console.error("Error loading friends:", err);
    }
}

/**
 * Carga las solicitudes de amistad pendientes
 */
async function loadPendingRequests() {
    const container = document.getElementById('requests-list-container');
    if (!container) return;

    try {
        container.innerHTML = '<div class="social-loader">Buscando solicitudes...</div>';
        const response = await GoHabitAPI.get('/friends/requests');
        const requests = response?.data || [];

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="social-empty-state">
                    <span class="material-symbols-outlined">mail</span>
                    <p>No tienes solicitudes de amistad pendientes.</p>
                </div>
            `;
            updateRequestsBadge();
            return;
        }

        container.innerHTML = '';
        requests.forEach(req => {
            const div = document.createElement('div');
            div.className = 'friend-item gh-card';
            div.innerHTML = `
                <div class="friend-item__profile">
                    <div class="activity-card__avatar">
                        ${req.avatar_url ? `<img src="${req.avatar_url}" alt="${req.sender_username}">` : '<span class="material-symbols-outlined">person</span>'}
                    </div>
                    <div class="friend-item__info">
                        <p class="friend-item__name">${req.sender_username}</p>
                        <p class="friend-item__level">Quiere ser tu amigo</p>
                    </div>
                </div>
                <div class="friend-item__actions">
                    <button class="gh-icon-btn accept-btn" data-id="${req.id}" style="color:var(--primary)">
                        <span class="material-symbols-outlined">check_circle</span>
                    </button>
                    <button class="gh-icon-btn reject-btn" data-id="${req.id}" style="color:var(--accent)">
                        <span class="material-symbols-outlined">cancel</span>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });

        // Event listeners para aceptar/rechazar
        container.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                try {
                    await GoHabitAPI.post(`/friends/requests/${id}/accept`, {});
                    GoHabit.toast('¡Solicitud aceptada!', 'good');
                    await loadPendingRequests();
                    await updateRequestsBadge();
                } catch(e) { GoHabit.toast('Error al aceptar', 'bad'); }
            });
        });

        container.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                try {
                    await GoHabitAPI.post(`/friends/requests/${id}/reject`, {});
                    GoHabit.toast('Solicitud rechazada', 'good');
                    await loadPendingRequests();
                    await updateRequestsBadge();
                } catch(e) { GoHabit.toast('Error al rechazar', 'bad'); }
            });
        });

    } catch (err) {
        console.error("Error loading requests:", err);
    }
}

/**
 * Buscador de nuevos amigos
 */
function initSearch() {
    const btn = document.getElementById('friend-search-btn');
    const input = document.getElementById('friend-search-input');
    const container = document.getElementById('search-results-container');

    if (!btn || !input) return;

    const performSearch = async () => {
        const query = input.value.trim();
        if (!query) return;

        try {
            container.innerHTML = '<div class="social-loader">Rastreando el mundo...</div>';
            const response = await GoHabitAPI.get(`/users/search?q=${encodeURIComponent(query)}`);
            const users = response?.data || [];

            if (users.length === 0) {
                container.innerHTML = '<p class="social-empty-state">No se encontraron usuarios con ese nombre.</p>';
                return;
            }

            container.innerHTML = '';
            users.forEach(user => {
                const div = document.createElement('div');
                div.className = 'friend-item gh-card';
                div.innerHTML = `
                    <div class="friend-item__profile">
                        <div class="activity-card__avatar">
                            ${user.avatar_url ? `<img src="${user.avatar_url}" alt="${user.username}">` : '<span class="material-symbols-outlined">person</span>'}
                        </div>
                        <div class="friend-item__info">
                            <p class="friend-item__name">${user.username}</p>
                            <div class="friend-item__stats">
                                <span class="friend-item__badge">Niv. ${user.level || 1}</span>
                                <span class="friend-item__xp">${user.points || 0} XP</span>
                            </div>
                        </div>
                    </div>
                    <button class="gh-primary-btn add-friend-btn" data-id="${user.id}" style="padding: 8px 16px; font-size: 0.85rem;">
                        <span class="material-symbols-outlined" style="font-size:18px">person_add</span>
                        Conectar
                    </button>
                `;
                container.appendChild(div);
            });

            // Botones de añadir
            container.querySelectorAll('.add-friend-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    try {
                        await GoHabitAPI.post('/friends', { receiverId: id });
                        btn.innerHTML = '<span class="material-symbols-outlined">schedule</span> Enviada';
                        btn.disabled = true;
                        btn.style.opacity = '0.6';
                        GoHabit.toast('Petición de amistad enviada', 'good');
                    } catch (err) {
                        GoHabit.toast('Ya existe una relación o petición', 'bad');
                    }
                });
            });

        } catch (err) {
            GoHabit.toast('Error en la búsqueda', 'bad');
        }
    };

    btn.addEventListener('click', performSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

/**
 * Carga el conteo de solicitudes pendientes y actualiza el badge en la UI
 */
async function updateRequestsBadge() {
    const badge = document.getElementById('requests-badge');
    if (!badge) return;
    try {
        const response = await GoHabitAPI.get('/friends/requests');
        const count = response?.data?.length || 0;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (err) {
        console.warn("Could not fetch requests badge", err);
    }
}
