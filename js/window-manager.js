/* ============ WINDOW MANAGER ============ */
const WindowManager = (() => {
    const windows = new Map();
    let topZ = 100;
    let dragState = null;
    let resizeState = null;

    // Drag handling
    function onPointerDown(e) {
        const titlebar = e.target.closest('.window-titlebar');
        if (!titlebar) return;
        if (e.target.closest('.window-controls')) return;

        const win = titlebar.closest('.xp-window');
        if (!win || win.classList.contains('maximized')) return;

        e.preventDefault();
        WindowManager.focus(win.dataset.windowId);

        const rect = win.getBoundingClientRect();
        dragState = {
            win,
            startX: (e.clientX || e.touches?.[0]?.clientX) - rect.left,
            startY: (e.clientY || e.touches?.[0]?.clientY) - rect.top,
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
        if (dragState) {
            const x = (e.clientX || e.touches?.[0]?.clientX) - dragState.startX;
            const y = (e.clientY || e.touches?.[0]?.clientY) - dragState.startY;
            dragState.win.style.left = Math.max(0, x) + 'px';
            dragState.win.style.top = Math.max(0, y) + 'px';
        }
        if (resizeState) {
            const dx = (e.clientX || e.touches?.[0]?.clientX) - resizeState.startX;
            const dy = (e.clientY || e.touches?.[0]?.clientY) - resizeState.startY;
            const newW = Math.max(280, resizeState.startW + dx);
            const newH = Math.max(180, resizeState.startH + dy);
            resizeState.win.style.width = newW + 'px';
            resizeState.win.style.height = newH + 'px';
        }
    }

    function onPointerUp() {
        dragState = null;
        resizeState = null;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    }

    // Resize handling
    function onResizeDown(e) {
        const handle = e.target.closest('.window-resize-handle');
        if (!handle) return;

        const win = handle.closest('.xp-window');
        if (!win || win.classList.contains('maximized')) return;

        e.preventDefault();
        e.stopPropagation();
        WindowManager.focus(win.dataset.windowId);

        const rect = win.getBoundingClientRect();
        resizeState = {
            win,
            startX: e.clientX || e.touches?.[0]?.clientX,
            startY: e.clientY || e.touches?.[0]?.clientY,
            startW: rect.width,
            startH: rect.height,
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    // Bring to front on click
    function onWindowClick(e) {
        const win = e.target.closest('.xp-window');
        if (win) {
            WindowManager.focus(win.dataset.windowId);
        }
    }

    // Initialize event listeners
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerdown', onResizeDown);
    document.addEventListener('mousedown', onWindowClick);

    return {
        create({ id, title, icon, content, width = 600, height = 400, x, y, resizable = true, menubar, toolbar, addressbar, statusbar, onClose, onInit }) {
            // If window already exists, just focus it
            if (windows.has(id)) {
                const existing = windows.get(id);
                if (existing.minimized) {
                    WindowManager.restore(id);
                } else {
                    WindowManager.focus(id);
                }
                return existing.element;
            }

            const container = document.getElementById('windows-container');
            if (!container) return null;

            // Calculate position
            const openCount = windows.size;
            if (x === undefined) x = 60 + (openCount * 30) % 200;
            if (y === undefined) y = 40 + (openCount * 30) % 150;

            // Build window HTML
            const win = document.createElement('div');
            win.className = 'xp-window';
            win.dataset.windowId = id;
            win.style.left = x + 'px';
            win.style.top = y + 'px';
            win.style.width = width + 'px';
            win.style.height = height + 'px';
            win.style.zIndex = ++topZ;

            let iconHTML = '';
            if (icon) {
                iconHTML = `<div class="window-titlebar-icon">${icon}</div>`;
            }

            let menubarHTML = '';
            if (menubar) {
                menubarHTML = `<div class="window-menubar">${menubar.map(m => `<span class="window-menubar-item">${m}</span>`).join('')}</div>`;
            }

            let toolbarHTML = '';
            if (toolbar) {
                toolbarHTML = `<div class="window-toolbar">${toolbar}</div>`;
            }

            let addressbarHTML = '';
            if (addressbar) {
                addressbarHTML = `<div class="window-addressbar">
          <span class="addressbar-label">Address</span>
          <input class="addressbar-input" value="${addressbar}" readonly>
          <button class="addressbar-go">Go</button>
        </div>`;
            }

            let statusbarHTML = '';
            if (statusbar !== false) {
                statusbarHTML = `<div class="window-statusbar">${statusbar || 'Ready'}</div>`;
            }

            let resizeHTML = '';
            if (resizable) {
                resizeHTML = '<div class="window-resize-handle"></div>';
            }

            win.innerHTML = `
        <div class="window-titlebar">
          ${iconHTML}
          <span class="window-title">${title}</span>
          <div class="window-controls">
            <button class="window-btn window-btn-minimize" title="Minimize">─</button>
            <button class="window-btn window-btn-maximize" title="Maximize">☐</button>
            <button class="window-btn window-btn-close" title="Close">✕</button>
          </div>
        </div>
        ${menubarHTML}
        ${toolbarHTML}
        ${addressbarHTML}
        <div class="window-body">${content}</div>
        ${statusbarHTML}
        ${resizeHTML}
      `;

            container.appendChild(win);

            // Store window data
            const windowData = {
                id,
                title,
                icon,
                element: win,
                minimized: false,
                maximized: false,
                prevBounds: null,
                onClose,
            };
            windows.set(id, windowData);

            // Button event listeners
            win.querySelector('.window-btn-minimize').addEventListener('click', () => WindowManager.minimize(id));
            win.querySelector('.window-btn-maximize').addEventListener('click', () => WindowManager.toggleMaximize(id));
            win.querySelector('.window-btn-close').addEventListener('click', () => WindowManager.close(id));
            win.querySelector('.window-titlebar').addEventListener('dblclick', (e) => {
                if (!e.target.closest('.window-controls')) {
                    WindowManager.toggleMaximize(id);
                }
            });

            // Notify taskbar
            if (typeof Taskbar !== 'undefined') {
                Taskbar.addWindow(id, title, icon);
                Taskbar.setActive(id);
            }

            Sounds.play('open');

            // Call onInit callback after adding to DOM
            if (onInit) {
                setTimeout(() => onInit(win), 50);
            }

            return win;
        },

        close(id) {
            const data = windows.get(id);
            if (!data) return;

            Sounds.play('close');
            data.element.classList.add('closing');

            setTimeout(() => {
                data.element.remove();
                windows.delete(id);
                if (typeof Taskbar !== 'undefined') {
                    Taskbar.removeWindow(id);
                }
                if (data.onClose) data.onClose();
                // Focus the next topmost window
                WindowManager.focusTopWindow();
            }, 150);
        },

        minimize(id) {
            const data = windows.get(id);
            if (!data || data.minimized) return;

            Sounds.play('minimize');
            data.element.classList.add('minimizing');
            data.minimized = true;

            setTimeout(() => {
                data.element.style.display = 'none';
                data.element.classList.remove('minimizing');
            }, 280);

            if (typeof Taskbar !== 'undefined') {
                Taskbar.setMinimized(id, true);
            }
            WindowManager.focusTopWindow();
        },

        restore(id) {
            const data = windows.get(id);
            if (!data) return;

            if (data.minimized) {
                data.element.style.display = 'flex';
                data.element.classList.add('restoring');
                data.minimized = false;

                setTimeout(() => {
                    data.element.classList.remove('restoring');
                }, 250);

                if (typeof Taskbar !== 'undefined') {
                    Taskbar.setMinimized(id, false);
                }
            }
            WindowManager.focus(id);
        },

        toggleMaximize(id) {
            const data = windows.get(id);
            if (!data) return;

            if (data.maximized) {
                // Restore from maximize
                data.element.classList.remove('maximized');
                if (data.prevBounds) {
                    data.element.style.left = data.prevBounds.left;
                    data.element.style.top = data.prevBounds.top;
                    data.element.style.width = data.prevBounds.width;
                    data.element.style.height = data.prevBounds.height;
                }
                data.maximized = false;
            } else {
                // Maximize
                data.prevBounds = {
                    left: data.element.style.left,
                    top: data.element.style.top,
                    width: data.element.style.width,
                    height: data.element.style.height,
                };
                data.element.classList.add('maximized');
                data.maximized = true;
                Sounds.play('maximize');
            }
        },

        focus(id) {
            const data = windows.get(id);
            if (!data) return;

            // Remove active from all
            windows.forEach((w) => {
                w.element.classList.add('inactive');
            });

            // Set active
            data.element.classList.remove('inactive');
            data.element.style.zIndex = ++topZ;

            if (typeof Taskbar !== 'undefined') {
                Taskbar.setActive(id);
            }
        },

        focusTopWindow() {
            let topWin = null;
            let topZVal = 0;
            windows.forEach((w) => {
                if (!w.minimized && parseInt(w.element.style.zIndex) > topZVal) {
                    topZVal = parseInt(w.element.style.zIndex);
                    topWin = w;
                }
            });
            if (topWin) {
                WindowManager.focus(topWin.id);
            } else {
                // No windows open, clear taskbar active
                if (typeof Taskbar !== 'undefined') {
                    Taskbar.setActive(null);
                }
            }
        },

        toggleMinimize(id) {
            const data = windows.get(id);
            if (!data) return;

            if (data.minimized) {
                WindowManager.restore(id);
            } else {
                // Check if this window is the topmost active one
                const isActive = !data.element.classList.contains('inactive');
                if (isActive) {
                    WindowManager.minimize(id);
                } else {
                    WindowManager.focus(id);
                }
            }
        },

        get(id) {
            return windows.get(id);
        },

        has(id) {
            return windows.has(id);
        },

        getAll() {
            return windows;
        }
    };
})();
