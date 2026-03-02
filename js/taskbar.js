/* ============ TASKBAR ============ */
const Taskbar = (() => {
    let clockInterval = null;

    function updateClock() {
        const clock = document.getElementById('clock');
        if (!clock) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        clock.textContent = `${hours}:${minutes} ${ampm}`;
    }

    return {
        init() {
            updateClock();
            clockInterval = setInterval(updateClock, 10000);

            // Start button
            const startBtn = document.getElementById('start-button');
            const startMenu = document.getElementById('start-menu');

            if (startBtn && startMenu) {
                startBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = !startMenu.classList.contains('hidden');
                    if (isOpen) {
                        Taskbar.closeStartMenu();
                    } else {
                        Taskbar.openStartMenu();
                    }
                });

                // Close start menu when clicking elsewhere
                document.addEventListener('click', (e) => {
                    if (!startMenu.classList.contains('hidden') &&
                        !startMenu.contains(e.target) &&
                        !startBtn.contains(e.target)) {
                        Taskbar.closeStartMenu();
                    }
                });

                // Start menu items
                startMenu.querySelectorAll('.start-menu-item[data-app]').forEach(item => {
                    item.addEventListener('click', () => {
                        const app = item.dataset.app;
                        Taskbar.closeStartMenu();
                        if (typeof openApp === 'function') {
                            openApp(app);
                        }
                    });
                });

                startMenu.querySelectorAll('.start-menu-item[data-link]').forEach(item => {
                    item.addEventListener('click', () => {
                        Taskbar.closeStartMenu();
                        window.open(item.dataset.link, '_blank');
                    });
                });

                // Log off / Shutdown
                const logoffBtn = document.getElementById('start-menu-logoff');
                const shutdownBtn = document.getElementById('start-menu-shutdown');

                if (logoffBtn) {
                    logoffBtn.addEventListener('click', () => {
                        Taskbar.closeStartMenu();
                        if (typeof logoff === 'function') logoff();
                    });
                }

                if (shutdownBtn) {
                    shutdownBtn.addEventListener('click', () => {
                        Taskbar.closeStartMenu();
                        if (typeof logoff === 'function') logoff();
                    });
                }
            }

            // Sound toggle
            const soundToggle = document.getElementById('sound-toggle');
            if (soundToggle) {
                soundToggle.addEventListener('click', () => {
                    Sounds.toggle();
                });
            }

            // CRT toggle
            const crtToggle = document.getElementById('crt-toggle');
            if (crtToggle) {
                crtToggle.addEventListener('click', () => {
                    const overlay = document.getElementById('crt-overlay');
                    if (overlay) {
                        overlay.classList.toggle('crt-active');
                    }
                });
            }
        },

        openStartMenu() {
            const startMenu = document.getElementById('start-menu');
            const startBtn = document.getElementById('start-button');
            if (startMenu) startMenu.classList.remove('hidden');
            if (startBtn) startBtn.classList.add('active');
            Sounds.play('click');
        },

        closeStartMenu() {
            const startMenu = document.getElementById('start-menu');
            const startBtn = document.getElementById('start-button');
            if (startMenu) startMenu.classList.add('hidden');
            if (startBtn) startBtn.classList.remove('active');
        },

        addWindow(id, title, icon) {
            const container = document.getElementById('taskbar-windows');
            if (!container) return;

            const item = document.createElement('div');
            item.className = 'taskbar-item';
            item.dataset.windowId = id;

            let iconHTML = '';
            if (icon) {
                iconHTML = `<span class="taskbar-item-icon">${icon}</span>`;
            }

            item.innerHTML = `${iconHTML}<span class="taskbar-item-title">${title}</span>`;

            item.addEventListener('click', () => {
                WindowManager.toggleMinimize(id);
            });

            container.appendChild(item);
        },

        removeWindow(id) {
            const container = document.getElementById('taskbar-windows');
            if (!container) return;
            const item = container.querySelector(`.taskbar-item[data-window-id="${id}"]`);
            if (item) item.remove();
        },

        setActive(id) {
            const container = document.getElementById('taskbar-windows');
            if (!container) return;

            container.querySelectorAll('.taskbar-item').forEach(item => {
                item.classList.toggle('active', item.dataset.windowId === id);
            });
        },

        setMinimized(id, minimized) {
            const container = document.getElementById('taskbar-windows');
            if (!container) return;
            const item = container.querySelector(`.taskbar-item[data-window-id="${id}"]`);
            if (item) {
                item.classList.toggle('minimized', minimized);
                if (minimized) item.classList.remove('active');
            }
        },

        show() {
            const taskbar = document.getElementById('taskbar');
            if (taskbar) taskbar.classList.remove('hidden');
        },

        hide() {
            const taskbar = document.getElementById('taskbar');
            if (taskbar) taskbar.classList.add('hidden');
        }
    };
})();
