/* ============ RECYCLE BIN ============ */
const RecycleBin = (() => {
    const deletedItems = [];

    function makeIconDraggable() {
        const icons = document.querySelectorAll('.desktop-icon:not([data-app="recycle-bin"])');
        const recycleBinIcon = document.getElementById('recycle-bin-icon');

        icons.forEach(icon => {
            icon.setAttribute('draggable', true);

            icon.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', icon.dataset.app);
                icon.classList.add('dragging');
            });

            icon.addEventListener('dragend', () => {
                icon.classList.remove('dragging');
            });
        });

        if (recycleBinIcon) {
            recycleBinIcon.addEventListener('dragover', (e) => {
                e.preventDefault();
                recycleBinIcon.classList.add('selected');
            });

            recycleBinIcon.addEventListener('dragleave', () => {
                recycleBinIcon.classList.remove('selected');
            });

            recycleBinIcon.addEventListener('drop', (e) => {
                e.preventDefault();
                recycleBinIcon.classList.remove('selected');
                const appId = e.dataTransfer.getData('text/plain');
                if (appId) {
                    deleteItem(appId);
                }
            });
        }
    }

    function deleteItem(appId) {
        const icon = document.querySelector(`.desktop-icon[data-app="${appId}"]`);
        if (!icon) return;

        // Animate deletion
        icon.style.transition = 'all 0.3s ease';
        icon.style.transform = 'scale(0.1)';
        icon.style.opacity = '0';

        Sounds.play('recycle');

        setTimeout(() => {
            const htmlContent = icon.outerHTML;
            icon.style.display = 'none';
            icon.style.transform = '';
            icon.style.opacity = '';
            icon.style.transition = '';

            deletedItems.push({
                appId,
                label: icon.querySelector('.icon-label')?.textContent || appId,
                html: htmlContent,
            });

            // Close window if open
            if (WindowManager.has(appId)) {
                WindowManager.close(appId);
            }
        }, 300);
    }

    function restoreItem(appId) {
        const idx = deletedItems.findIndex(i => i.appId === appId);
        if (idx === -1) return;

        const item = deletedItems.splice(idx, 1)[0];
        const icon = document.querySelector(`.desktop-icon[data-app="${item.appId}"]`);
        if (icon) {
            icon.style.display = '';
            icon.style.transform = 'scale(0.1)';
            icon.style.opacity = '0';

            requestAnimationFrame(() => {
                icon.style.transition = 'all 0.3s ease';
                icon.style.transform = 'scale(1)';
                icon.style.opacity = '1';

                setTimeout(() => {
                    icon.style.transition = '';
                }, 300);
            });
        }

        Sounds.play('open');
    }

    function emptyBin() {
        deletedItems.forEach(item => {
            const icon = document.querySelector(`.desktop-icon[data-app="${item.appId}"]`);
            if (icon) icon.remove();
        });
        deletedItems.length = 0;
        Sounds.play('recycle');
    }

    return {
        init() {
            makeIconDraggable();
        },

        getHTML() {
            if (deletedItems.length === 0) {
                return `<div class="recycle-bin-content">
          <div class="recycle-bin-empty">
            <div class="empty-icon">🗑️</div>
            <p>The Recycle Bin is empty.</p>
          </div>
        </div>`;
            }

            const items = deletedItems.map(item => `
        <div class="recycle-item" data-app="${item.appId}">
          <div class="recycle-item-icon">📄</div>
          <div class="recycle-item-name">${item.label}</div>
        </div>
      `).join('');

            return `<div class="recycle-bin-content">
        <div style="padding: 8px; display: flex; gap: 6px;">
          <button class="dialog-btn" id="restore-all-btn">Restore All</button>
          <button class="dialog-btn" id="empty-bin-btn">Empty Recycle Bin</button>
        </div>
        <div class="recycle-bin-items">${items}</div>
      </div>`;
        },

        initWindow(windowEl) {
            // Restore individual items
            windowEl.querySelectorAll('.recycle-item').forEach(item => {
                item.addEventListener('dblclick', () => {
                    restoreItem(item.dataset.app);
                    // Refresh window content
                    refreshRecycleBinWindow();
                });
            });

            // Restore all
            const restoreBtn = windowEl.querySelector('#restore-all-btn');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', () => {
                    [...deletedItems].forEach(item => restoreItem(item.appId));
                    refreshRecycleBinWindow();
                });
            }

            // Empty bin
            const emptyBtn = windowEl.querySelector('#empty-bin-btn');
            if (emptyBtn) {
                emptyBtn.addEventListener('click', () => {
                    emptyBin();
                    refreshRecycleBinWindow();
                });
            }
        },

        getCount() {
            return deletedItems.length;
        }
    };

    function refreshRecycleBinWindow() {
        const win = WindowManager.get('recycle-bin');
        if (win) {
            const body = win.element.querySelector('.window-body');
            if (body) {
                body.innerHTML = RecycleBin.getHTML();
                RecycleBin.initWindow(win.element);
            }
        }
    }
})();
