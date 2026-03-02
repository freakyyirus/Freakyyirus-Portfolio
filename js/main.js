/* ============ MAIN ORCHESTRATOR ============ */
(() => {
    // ===== PIN LOGIN =====
    let pin = '';
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    function generatePIN() {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        attempts = 0;
        console.log(`%c🔑 PIN: ${pin}`, 'color: #FFD700; font-size: 16px; font-weight: bold;');
    }

    function initLogin() {
        generatePIN();

        const digits = document.querySelectorAll('.pin-digit');
        const submitBtn = document.getElementById('pin-submit');
        const errorEl = document.getElementById('pin-error');
        const attemptsEl = document.getElementById('attempts-left');
        const hintBtn = document.getElementById('pin-hint');
        const hintDisplay = document.getElementById('pin-hint-display');

        // Auto-advance focus
        digits.forEach((digit, i) => {
            digit.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val && i < digits.length - 1) {
                    digits[i + 1].focus();
                }
                // Auto-submit if all filled
                if (val && i === digits.length - 1) {
                    setTimeout(() => checkPIN(), 100);
                }
            });

            digit.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !digit.value && i > 0) {
                    digits[i - 1].focus();
                }
                if (e.key === 'Enter') {
                    checkPIN();
                }
            });

            // Allow only numbers
            digit.addEventListener('keypress', (e) => {
                if (!/\d/.test(e.key)) e.preventDefault();
            });
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', checkPIN);
        }

        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                if (hintDisplay) {
                    hintDisplay.classList.toggle('hidden');
                    hintDisplay.textContent = pin;
                }
            });
        }

        // Focus first digit
        setTimeout(() => digits[0]?.focus(), 300);
    }

    function checkPIN() {
        const digits = document.querySelectorAll('.pin-digit');
        const entered = Array.from(digits).map(d => d.value).join('');
        const errorEl = document.getElementById('pin-error');
        const attemptsEl = document.getElementById('attempts-left');

        if (entered.length < 4) {
            Sounds.play('error');
            return;
        }

        if (entered === pin) {
            Sounds.play('click');
            startBoot();
        } else {
            attempts++;
            Sounds.play('error');

            if (attempts >= MAX_ATTEMPTS) {
                triggerBSOD();
                return;
            }

            const remaining = MAX_ATTEMPTS - attempts;
            if (errorEl) {
                errorEl.classList.remove('hidden');
                if (attemptsEl) attemptsEl.textContent = remaining;
                // Re-trigger shake animation
                errorEl.style.animation = 'none';
                requestAnimationFrame(() => { errorEl.style.animation = ''; });
            }

            // Clear digits
            digits.forEach(d => { d.value = ''; });
            digits[0]?.focus();
        }
    }

    // ===== BSOD =====
    window.triggerBSOD = function () {
        Sounds.play('bsod');
        showScreen('bsod-screen');

        // Press any key to restart
        const handler = () => {
            document.removeEventListener('keydown', handler);
            document.removeEventListener('click', handler);
            resetToLogin();
        };
        setTimeout(() => {
            document.addEventListener('keydown', handler);
            document.addEventListener('click', handler);
        }, 1000);
    };

    function resetToLogin() {
        showScreen('login-screen');
        generatePIN();
        const digits = document.querySelectorAll('.pin-digit');
        const errorEl = document.getElementById('pin-error');
        const hintDisplay = document.getElementById('pin-hint-display');

        digits.forEach(d => { d.value = ''; });
        if (errorEl) errorEl.classList.add('hidden');
        if (hintDisplay) hintDisplay.classList.add('hidden');

        setTimeout(() => digits[0]?.focus(), 300);

        // Hide desktop & taskbar
        document.getElementById('desktop')?.classList.add('hidden');
        document.getElementById('taskbar')?.classList.add('hidden');
        document.getElementById('start-menu')?.classList.add('hidden');
        Clippy.stop();
    }

    // ===== BOOT SEQUENCE =====
    function startBoot() {
        showScreen('boot-screen');

        setTimeout(() => {
            const bootScreen = document.getElementById('boot-screen');
            if (bootScreen) {
                bootScreen.classList.add('fade-out');
            }
            setTimeout(() => {
                bootScreen?.classList.add('hidden');
                bootScreen?.classList.remove('fade-out');
                startDesktop();
            }, 800);
        }, 3000);
    }

    // ===== DESKTOP =====
    function startDesktop() {
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.classList.remove('hidden');
            desktop.classList.add('fade-in');
        }
        document.getElementById('taskbar')?.classList.remove('hidden');

        Sounds.play('startup');
        Taskbar.init();
        RecycleBin.init();
        Clippy.init();
        initDesktopIcons();
        initKonamiCode();

        setTimeout(() => {
            desktop?.classList.remove('fade-in');
        }, 1000);
    }

    // ===== SCREEN MANAGEMENT =====
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
        }
    }

    // ===== DESKTOP ICONS =====
    function initDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        let lastClick = { time: 0, target: null };

        icons.forEach(icon => {
            // Handle double-click (and single tap on mobile)
            icon.addEventListener('click', (e) => {
                const now = Date.now();
                const isMobile = window.matchMedia('(hover: none)').matches;

                // Select on click
                icons.forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');

                if (isMobile) {
                    // Single tap opens on mobile
                    openApp(icon.dataset.app);
                } else if (now - lastClick.time < 400 && lastClick.target === icon) {
                    openApp(icon.dataset.app);
                    lastClick = { time: 0, target: null };
                } else {
                    lastClick = { time: now, target: icon };
                }
            });
        });

        // Click on desktop to deselect
        document.getElementById('desktop')?.addEventListener('click', (e) => {
            if (e.target.id === 'desktop' || e.target.id === 'desktop-icons') {
                icons.forEach(i => i.classList.remove('selected'));
            }
        });
    }

    // ===== OPEN APP =====
    window.openApp = function (appId) {
        Sounds.play('click');

        switch (appId) {
            case 'my-computer':
                openMyComputer();
                break;
            case 'about-me':
                openAboutMe();
                break;
            case 'projects':
                openProjects();
                break;
            case 'terminal':
                openTerminal();
                break;
            case 'minesweeper':
                openMinesweeper();
                break;
            case 'internet-explorer':
                openIE();
                break;
            case 'recycle-bin':
                openRecycleBin();
                break;
        }
    };

    function openMyComputer() {
        WindowManager.create({
            id: 'my-computer',
            title: 'My Computer',
            icon: '🖥️',
            width: 650,
            height: 420,
            menubar: ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'],
            content: `<div class="my-computer-sidebar">
        <div class="mc-sidebar">
          <h3>System Tasks</h3>
          <div class="mc-sidebar-item" onclick="openApp('about-me')">📋 View system info</div>
          <div class="mc-sidebar-item" onclick="openApp('projects')">📁 My Projects</div>
          <h3>Other Places</h3>
          <div class="mc-sidebar-item" onclick="openApp('terminal')">⌨️ Command Prompt</div>
          <div class="mc-sidebar-item" onclick="openApp('recycle-bin')">🗑️ Recycle Bin</div>
        </div>
        <div class="mc-main-content">
          <h3 style="font-size:12px;color:#003399;margin-bottom:12px;">Hard Disk Drives</h3>
          <div class="mc-drives">
            <div class="mc-drive" onclick="openApp('projects')">
              <div class="mc-drive-icon">💾</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">Projects (C:)</div>
                <div class="mc-drive-detail">4 projects stored</div>
                <div class="mc-drive-bar"><div class="mc-drive-bar-fill" style="width:60%"></div></div>
              </div>
            </div>
            <div class="mc-drive" onclick="openApp('about-me')">
              <div class="mc-drive-icon">💿</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">Skills (D:)</div>
                <div class="mc-drive-detail">Always expanding</div>
                <div class="mc-drive-bar"><div class="mc-drive-bar-fill" style="width:85%"></div></div>
              </div>
            </div>
            <div class="mc-drive">
              <div class="mc-drive-icon">📀</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">Experience (E:)</div>
                <div class="mc-drive-detail">Years of coding</div>
                <div class="mc-drive-bar"><div class="mc-drive-bar-fill" style="width:70%"></div></div>
              </div>
            </div>
          </div>
          <h3 style="font-size:12px;color:#003399;margin:16px 0 12px;">Devices with Removable Storage</h3>
          <div class="mc-drives">
            <div class="mc-drive" onclick="window.open('https://github.com','_blank')">
              <div class="mc-drive-icon">🐙</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">GitHub (F:)</div>
                <div class="mc-drive-detail">Code repositories</div>
              </div>
            </div>
            <div class="mc-drive" onclick="window.open('https://linkedin.com','_blank')">
              <div class="mc-drive-icon">💼</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">LinkedIn (G:)</div>
                <div class="mc-drive-detail">Professional network</div>
              </div>
            </div>
          </div>
        </div>
      </div>`,
        });
    }

    function openAboutMe() {
        WindowManager.create({
            id: 'about-me',
            title: 'System Properties',
            icon: '📋',
            width: 480,
            height: 500,
            content: `<div class="system-properties">
        <div class="sp-tabs">
          <button class="sp-tab active" data-tab="general">General</button>
          <button class="sp-tab" data-tab="skills">Skills</button>
          <button class="sp-tab" data-tab="experience">Experience</button>
          <button class="sp-tab" data-tab="education">Education</button>
        </div>
        <div class="sp-content">
          <!-- General Tab -->
          <div class="sp-tab-content" data-tab="general">
            <div class="sp-logo-section">
              <div class="sp-logo">
                <svg viewBox="0 0 48 48" width="48" height="48">
                  <rect x="2" y="2" width="20" height="20" rx="2" fill="#FF0000"/>
                  <rect x="26" y="2" width="20" height="20" rx="2" fill="#00B300"/>
                  <rect x="2" y="26" width="20" height="20" rx="2" fill="#0052CC"/>
                  <rect x="26" y="26" width="20" height="20" rx="2" fill="#FFB700"/>
                </svg>
              </div>
              <div class="sp-logo-text">
                <h3>Microsoft Windows XP</h3>
                <p>Portfolio Edition — Version 2026</p>
                <p>Registered to: Developer</p>
              </div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">System Specifications</div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Processor (CPU):</span>
                <span class="sp-spec-value">Full-Stack Developer v10.0 @ 128-bit</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">RAM:</span>
                <span class="sp-spec-value">4+ Years of Experience</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Hard Drive:</span>
                <span class="sp-spec-value">20+ Projects Completed (1TB)</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Graphics:</span>
                <span class="sp-spec-value">UI/UX Design — 4K Resolution</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Network:</span>
                <span class="sp-spec-value">REST APIs, GraphQL, WebSockets</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Operating System:</span>
                <span class="sp-spec-value">B.Tech Computer Science</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Manufacturer:</span>
                <span class="sp-spec-value">Self-Taught + University</span>
              </div>
              <div class="sp-spec-row">
                <span class="sp-spec-label">Serial Number:</span>
                <span class="sp-spec-value">PASSIONATE-ABOUT-CODE-42</span>
              </div>
            </div>
          </div>
          <!-- Skills Tab -->
          <div class="sp-tab-content" data-tab="skills" style="display:none;">
            <div class="sp-section">
              <div class="sp-section-title">Programming Languages</div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">JavaScript / TypeScript</span><span class="skill-bar-value">95%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:95%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Python</span><span class="skill-bar-value">88%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:88%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Java</span><span class="skill-bar-value">80%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:80%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">C++</span><span class="skill-bar-value">75%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:75%"></div></div></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Frameworks & Libraries</div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">React / Next.js</span><span class="skill-bar-value">92%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:92%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Node.js / Express</span><span class="skill-bar-value">90%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:90%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Vue.js</span><span class="skill-bar-value">78%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:78%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Django / FastAPI</span><span class="skill-bar-value">82%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:82%"></div></div></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Databases & DevOps</div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">PostgreSQL / MongoDB</span><span class="skill-bar-value">85%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:85%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Docker / AWS</span><span class="skill-bar-value">76%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:76%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Git / CI-CD</span><span class="skill-bar-value">90%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:90%"></div></div></div>
            </div>
          </div>
          <!-- Experience Tab -->
          <div class="sp-tab-content" data-tab="experience" style="display:none;">
            <div class="sp-section">
              <div class="sp-section-title">Work Experience</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Current Role:</span><span class="sp-spec-value">Software Engineer</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Duration:</span><span class="sp-spec-value">2+ Years</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Focus Areas:</span><span class="sp-spec-value">Full-Stack Web Development, API Design, System Architecture</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Key Achievements</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Projects Shipped:</span><span class="sp-spec-value">20+ production applications</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Code Quality:</span><span class="sp-spec-value">Maintained 90%+ test coverage</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Performance:</span><span class="sp-spec-value">Reduced load times by 60%</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Team Impact:</span><span class="sp-spec-value">Mentored 5+ junior developers</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Open Source</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Contributions:</span><span class="sp-spec-value">Active contributor to multiple open source projects</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Own Projects:</span><span class="sp-spec-value">Multiple starred repositories on GitHub</span></div>
            </div>
          </div>
          <!-- Education Tab -->
          <div class="sp-tab-content" data-tab="education" style="display:none;">
            <div class="sp-section">
              <div class="sp-section-title">Formal Education</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Degree:</span><span class="sp-spec-value">B.Tech in Computer Science</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">University:</span><span class="sp-spec-value">Your University Name</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Year:</span><span class="sp-spec-value">2020 - 2024</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">GPA:</span><span class="sp-spec-value">3.8 / 4.0</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Certifications</div>
              <div class="sp-spec-row"><span class="sp-spec-label">AWS:</span><span class="sp-spec-value">Cloud Practitioner Certified</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Meta:</span><span class="sp-spec-value">Front-End Developer Professional</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Google:</span><span class="sp-spec-value">Data Analytics Professional</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Continuous Learning</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Platforms:</span><span class="sp-spec-value">Coursera, Udemy, freeCodeCamp, LeetCode</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Focus:</span><span class="sp-spec-value">System Design, AI/ML, Competitive Programming</span></div>
            </div>
          </div>
        </div>
      </div>`,
            onInit: (win) => {
                // Tab switching
                win.querySelectorAll('.sp-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabName = tab.dataset.tab;
                        win.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        win.querySelectorAll('.sp-tab-content').forEach(c => {
                            c.style.display = c.dataset.tab === tabName ? 'block' : 'none';
                        });
                    });
                });
            },
        });
    }

    function openProjects() {
        const projects = [
            { id: 'codeboard', name: 'CodeBoard', icon: '📊', desc: 'A competitive programming dashboard that tracks your progress across platforms like Codeforces, LeetCode, and CodeChef. Features rating progression charts, problem analytics, and personalized study roadmaps.', tech: ['React', 'Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'], demo: '#', github: '#' },
            { id: 'portfolio-os', name: 'Portfolio OS', icon: '🖥️', desc: 'This very portfolio! A Windows XP-themed interactive experience built entirely with vanilla HTML, CSS, and JavaScript. Features draggable windows, a working terminal, playable Minesweeper, and nostalgic easter eggs.', tech: ['HTML', 'CSS', 'JavaScript', 'Web Audio API'], demo: '#', github: '#' },
            { id: 'ai-judge', name: 'AI Code Judge', icon: '🤖', desc: 'An AI-powered code review system that analyzes competitive programming solutions, provides feedback on time/space complexity, suggests optimizations, and gives a performance rating.', tech: ['Python', 'OpenAI', 'FastAPI', 'React', 'PostgreSQL'], demo: '#', github: '#' },
            { id: 'monquest', name: 'MonQuest', icon: '🐲', desc: 'A monster collection adventure game where players explore, battle, and collect creatures. Features turn-based combat, leveling system, and procedurally generated encounters.', tech: ['JavaScript', 'Canvas API', 'Node.js', 'Socket.io'], demo: '#', github: '#' },
        ];

        const projectGrid = projects.map(p => `
      <div class="project-file" data-project="${p.id}">
        <div class="project-file-icon">${p.icon}</div>
        <div class="project-file-name">${p.name}</div>
      </div>
    `).join('');

        WindowManager.create({
            id: 'projects',
            title: 'My Projects',
            icon: '📁',
            width: 650,
            height: 460,
            menubar: ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'],
            content: `<div id="projects-main">
        <div class="projects-grid">${projectGrid}</div>
      </div>`,
            onInit: (win) => {
                win.querySelectorAll('.project-file').forEach(file => {
                    file.addEventListener('dblclick', () => {
                        const pid = file.dataset.project;
                        const proj = projects.find(p => p.id === pid);
                        if (proj) openProjectDetail(proj);
                    });

                    // Mobile: single click
                    file.addEventListener('click', () => {
                        win.querySelectorAll('.project-file').forEach(f => f.classList.remove('selected'));
                        file.classList.add('selected');

                        if (window.matchMedia('(hover: none)').matches) {
                            const pid = file.dataset.project;
                            const proj = projects.find(p => p.id === pid);
                            if (proj) openProjectDetail(proj);
                        }
                    });
                });
            },
        });
    }

    function openProjectDetail(proj) {
        const techTags = proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

        WindowManager.create({
            id: `project-${proj.id}`,
            title: `${proj.name} — Properties`,
            icon: proj.icon,
            width: 500,
            height: 420,
            content: `<div class="project-detail window-body-padded">
        <div class="project-detail-header">
          <div class="project-detail-icon">${proj.icon}</div>
          <div class="project-detail-title">
            <h3>${proj.name}</h3>
            <p>Type: Web Application</p>
          </div>
        </div>
        <div class="project-detail-section">
          <h4>Description</h4>
          <p>${proj.desc}</p>
        </div>
        <div class="project-detail-section">
          <h4>Technology Stack</h4>
          <div class="tech-tags">${techTags}</div>
        </div>
        <div class="project-links">
          <a href="${proj.demo}" target="_blank" class="project-link-btn">🌐 Live Demo</a>
          <a href="${proj.github}" target="_blank" class="project-link-btn">🐙 GitHub</a>
        </div>
      </div>`,
        });
    }

    function openTerminal() {
        WindowManager.create({
            id: 'terminal',
            title: 'Command Prompt',
            icon: '⌨️',
            width: 680,
            height: 440,
            content: Terminal.getHTML(),
            statusbar: false,
            onInit: (win) => Terminal.init(win),
        });
    }

    function openMinesweeper() {
        WindowManager.create({
            id: 'minesweeper',
            title: 'Minesweeper',
            icon: '💣',
            width: 340,
            height: 440,
            resizable: false,
            content: Minesweeper.getHTML(),
            menubar: ['Game', 'Help'],
            statusbar: false,
            onInit: (win) => Minesweeper.init(win),
        });
    }

    function openIE() {
        WindowManager.create({
            id: 'internet-explorer',
            title: 'Internet Explorer',
            icon: '🌐',
            width: 700,
            height: 500,
            addressbar: 'https://github.com',
            toolbar: `<span class="toolbar-btn" onclick="window.open('https://github.com','_blank')">🔙 Back</span>
                <span class="toolbar-btn">🔜 Forward</span>
                <span class="toolbar-btn" onclick="window.open('https://github.com','_blank')">🔄 Refresh</span>
                <span class="toolbar-btn" onclick="window.open('https://github.com','_blank')">🏠 Home</span>`,
            content: `<div class="ie-content">
        <div class="ie-fallback">
          <h2 style="font-size:24px;margin-bottom:8px;">🌐</h2>
          <h2>Internet Explorer</h2>
          <p>Due to browser security policies, external pages cannot be embedded directly.<br>Click the links below to visit:</p>
          <div class="ie-fallback-links">
            <a href="https://github.com" target="_blank" class="ie-fallback-link">🐙 GitHub Profile</a>
            <a href="https://linkedin.com" target="_blank" class="ie-fallback-link">💼 LinkedIn Profile</a>
            <a href="mailto:dev@portfolio.com" class="ie-fallback-link">📧 Send Email</a>
          </div>
        </div>
      </div>`,
        });
    }

    function openRecycleBin() {
        WindowManager.create({
            id: 'recycle-bin',
            title: 'Recycle Bin',
            icon: '🗑️',
            width: 450,
            height: 350,
            menubar: ['File', 'Edit', 'View', 'Help'],
            content: RecycleBin.getHTML(),
            onInit: (win) => RecycleBin.initWindow(win),
        });
    }

    // ===== LOG OFF =====
    window.logoff = function () {
        // Close all windows
        WindowManager.getAll().forEach((data, id) => {
            data.element.remove();
        });
        WindowManager.getAll().clear();

        // Clear taskbar windows
        const tbContainer = document.getElementById('taskbar-windows');
        if (tbContainer) tbContainer.innerHTML = '';

        Clippy.stop();
        resetToLogin();
    };

    // ===== KONAMI CODE =====
    function initKonamiCode() {
        const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let position = 0;

        document.addEventListener('keydown', (e) => {
            if (e.key === code[position]) {
                position++;
                if (position === code.length) {
                    position = 0;
                    activateKonamiEasterEgg();
                }
            } else {
                position = 0;
            }
        });
    }

    function activateKonamiEasterEgg() {
        Sounds.play('startup');

        // Create a fun visual effect - invert colors briefly
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'hue-rotate(90deg)';
        }, 500);
        setTimeout(() => {
            document.body.style.filter = '';
        }, 1500);

        // Show Clippy with special message
        const text = document.getElementById('clippy-text');
        const container = document.getElementById('clippy-container');
        if (text && container) {
            text.textContent = "🎮 KONAMI CODE ACTIVATED!\n\nYou're a true gamer AND developer.\nRespect. 🫡\n\n+30 lives granted!";
            container.classList.remove('hidden', 'hiding');
        }
    }

    // ===== INITIALIZE =====
    document.addEventListener('DOMContentLoaded', () => {
        initLogin();
    });
})();
