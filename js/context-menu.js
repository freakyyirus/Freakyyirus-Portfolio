/* ============ CONTEXT MENU + KEYBOARD SHORTCUTS ============ */
const ContextMenu = (() => {
    let menuEl = null;

    function init() {
        // Close on any click
        document.addEventListener('click', () => hide());
        document.addEventListener('contextmenu', handleContextMenu);
        initKeyboardShortcuts();
    }

    function handleContextMenu(e) {
        // Don't show context menu inside windows (let default behavior for inputs)
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (isInput) return;

        e.preventDefault();

        const icon = e.target.closest('.desktop-icon');
        const desktop = e.target.closest('#desktop');
        const taskbar = e.target.closest('#taskbar');

        if (icon) {
            showIconContextMenu(e.clientX, e.clientY, icon);
        } else if (desktop) {
            showDesktopContextMenu(e.clientX, e.clientY);
        }
    }

    function showDesktopContextMenu(x, y) {
        const items = [
            { icon: '🔄', label: 'Refresh', action: () => location.reload() },
            { separator: true },
            { icon: '📋', label: 'About Me', action: () => openApp('about-me') },
            { icon: '📁', label: 'My Projects', action: () => openApp('projects') },
            { icon: '⌨️', label: 'Open Terminal', action: () => openApp('terminal') },
            { separator: true },
            { icon: '📝', label: 'New → Notepad', action: () => openApp('notepad') },
            { icon: '🧮', label: 'New → Calculator', action: () => openApp('calculator') },
            { separator: true },
            { icon: '⚙️', label: 'Properties', action: () => openApp('about-me') },
        ];
        show(x, y, items);
    }

    function showIconContextMenu(x, y, icon) {
        const appId = icon.dataset.app;
        const label = icon.querySelector('.icon-label')?.textContent || 'App';
        const items = [
            { icon: '📂', label: `Open ${label}`, action: () => openApp(appId), bold: true },
            { separator: true },
            { icon: '📌', label: 'Pin to Start Menu', action: () => { }, disabled: true },
            {
                icon: '🗑️', label: 'Delete', action: () => {
                    if (appId !== 'recycle-bin') {
                        icon.style.transition = 'all 0.3s ease';
                        icon.style.transform = 'scale(0)';
                        icon.style.opacity = '0';
                        setTimeout(() => { icon.style.display = 'none'; }, 300);
                        Sounds.play('recycle');
                    }
                }
            },
            { separator: true },
            { icon: '📋', label: 'Properties', action: () => openApp(appId) },
        ];
        show(x, y, items);
    }

    function show(x, y, items) {
        hide();

        menuEl = document.createElement('div');
        menuEl.className = 'context-menu';

        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.className = 'context-menu-separator';
                menuEl.appendChild(sep);
                return;
            }

            const el = document.createElement('div');
            el.className = 'context-menu-item' + (item.disabled ? ' disabled' : '');
            el.innerHTML = `<span class="ctx-icon">${item.icon}</span>${item.label}`;
            if (item.bold) el.style.fontWeight = '600';
            if (!item.disabled) {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    hide();
                    item.action();
                });
            }
            menuEl.appendChild(el);
        });

        document.body.appendChild(menuEl);

        // Position: keep on screen
        const menuWidth = 180;
        const menuHeight = menuEl.offsetHeight || 200;
        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 4;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 4;

        menuEl.style.left = x + 'px';
        menuEl.style.top = y + 'px';
    }

    function hide() {
        if (menuEl) {
            menuEl.remove();
            menuEl = null;
        }
    }

    // ===== KEYBOARD SHORTCUTS =====
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const desktop = document.getElementById('desktop');
            if (!desktop || desktop.classList.contains('hidden')) return;

            // Ctrl+W — Close active window
            if (e.ctrlKey && e.key === 'w') {
                e.preventDefault();
                const windows = WindowManager.getAll();
                if (windows && windows.size > 0) {
                    // Close the topmost window
                    let topZ = -1, topId = null;
                    windows.forEach((data, id) => {
                        const z = parseInt(data.element.style.zIndex || '0');
                        if (z > topZ && !data.element.classList.contains('minimized')) {
                            topZ = z;
                            topId = id;
                        }
                    });
                    if (topId) WindowManager.close(topId);
                }
            }

            // F11 — Toggle fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }

            // Ctrl+D — Show desktop (minimize all)
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                const windows = WindowManager.getAll();
                if (windows) {
                    windows.forEach((data, id) => {
                        if (!data.element.classList.contains('minimized')) {
                            WindowManager.minimize(id);
                        }
                    });
                }
            }

            // Ctrl+N — Open Notepad
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                openApp('notepad');
            }

            // Escape — Close start menu
            if (e.key === 'Escape') {
                const startMenu = document.getElementById('start-menu');
                if (startMenu && !startMenu.classList.contains('hidden')) {
                    startMenu.classList.add('hidden');
                }
            }
        });
    }

    return { init };
})();
