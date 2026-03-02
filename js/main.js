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
    const skipBtn = document.getElementById('skip-login');

    // Auto-advance focus
    digits.forEach((digit, i) => {
      digit.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val && i < digits.length - 1) {
          digits[i + 1].focus();
        }
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

    // Skip login button
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        Sounds.play('click');
        startBoot();
      });
    }

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
        errorEl.style.animation = 'none';
        requestAnimationFrame(() => { errorEl.style.animation = ''; });
      }

      digits.forEach(d => { d.value = ''; });
      digits[0]?.focus();
    }
  }

  // ===== BSOD =====
  window.triggerBSOD = function () {
    Sounds.play('bsod');
    showScreen('bsod-screen');

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
      icon.addEventListener('click', (e) => {
        const now = Date.now();
        const isMobile = window.matchMedia('(hover: none)').matches;

        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');

        if (isMobile) {
          openApp(icon.dataset.app);
        } else if (now - lastClick.time < 400 && lastClick.target === icon) {
          openApp(icon.dataset.app);
          lastClick = { time: 0, target: null };
        } else {
          lastClick = { time: now, target: icon };
        }
      });
    });

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
      case 'my-computer': openMyComputer(); break;
      case 'about-me': openAboutMe(); break;
      case 'projects': openProjects(); break;
      case 'terminal': openTerminal(); break;
      case 'minesweeper': openMinesweeper(); break;
      case 'internet-explorer': openIE(); break;
      case 'recycle-bin': openRecycleBin(); break;
      case 'resume': openResume(); break;
      case 'contact': openContact(); break;
      case 'competitions': openCompetitions(); break;
    }
  };

  // ===== MY COMPUTER =====
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
          <div class="mc-sidebar-item" onclick="openApp('resume')">📄 My Resume</div>
          <h3>Other Places</h3>
          <div class="mc-sidebar-item" onclick="openApp('terminal')">⌨️ Command Prompt</div>
          <div class="mc-sidebar-item" onclick="openApp('competitions')">🏆 Competitions</div>
          <div class="mc-sidebar-item" onclick="openApp('recycle-bin')">🗑️ Recycle Bin</div>
        </div>
        <div class="mc-main-content">
          <h3 style="font-size:12px;color:#003399;margin-bottom:12px;">Hard Disk Drives</h3>
          <div class="mc-drives">
            <div class="mc-drive" onclick="openApp('projects')">
              <div class="mc-drive-icon">💾</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">Projects (C:)</div>
                <div class="mc-drive-detail">AI/ML & Web Apps</div>
                <div class="mc-drive-bar"><div class="mc-drive-bar-fill" style="width:65%"></div></div>
              </div>
            </div>
            <div class="mc-drive" onclick="openApp('about-me')">
              <div class="mc-drive-icon">💿</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">Skills (D:)</div>
                <div class="mc-drive-detail">AI · ML · Full-Stack</div>
                <div class="mc-drive-bar"><div class="mc-drive-bar-fill" style="width:90%"></div></div>
              </div>
            </div>
            <div class="mc-drive" onclick="openApp('competitions')">
              <div class="mc-drive-icon">📀</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">Achievements (E:)</div>
                <div class="mc-drive-detail">Competitive Programming</div>
                <div class="mc-drive-bar"><div class="mc-drive-bar-fill" style="width:75%"></div></div>
              </div>
            </div>
          </div>
          <h3 style="font-size:12px;color:#003399;margin:16px 0 12px;">Network Locations</h3>
          <div class="mc-drives">
            <div class="mc-drive" onclick="window.open('https://github.com/freakyyirus','_blank')">
              <div class="mc-drive-icon">🐙</div>
              <div class="mc-drive-info">
                <div class="mc-drive-name">GitHub (F:)</div>
                <div class="mc-drive-detail">Code repos & open source</div>
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

  // ===== ABOUT ME =====
  function openAboutMe() {
    WindowManager.create({
      id: 'about-me',
      title: 'System Properties — About Me',
      icon: '📋',
      width: 520,
      height: 540,
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
                <h3>Full-Stack Engineer</h3>
                <p>Specializing in AI/ML Development</p>
                <p>Building scalable, production-ready solutions</p>
              </div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">System Specifications</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Processor (CPU):</span><span class="sp-spec-value">Full-Stack Developer v10.0 — AI/ML Specialized</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">GPU (Co-processor):</span><span class="sp-spec-value">Deep Learning · LLMs · Computer Vision</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">RAM:</span><span class="sp-spec-value">4+ Years of Experience</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Hard Drive:</span><span class="sp-spec-value">20+ Projects Shipped (1TB)</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Graphics:</span><span class="sp-spec-value">UI/UX Design — Responsive & Accessible</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Network:</span><span class="sp-spec-value">REST APIs · GraphQL · WebSockets · Microservices</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Operating System:</span><span class="sp-spec-value">B.Tech Computer Science & Engineering</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">BIOS:</span><span class="sp-spec-value">Competitive Programmer — Codeforces · LeetCode</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Serial Number:</span><span class="sp-spec-value">PASSIONATE-ABOUT-AI-AND-CODE</span></div>
            </div>
          </div>

          <!-- Skills Tab -->
          <div class="sp-tab-content" data-tab="skills" style="display:none;">
            <div class="sp-section">
              <div class="sp-section-title">🤖 AI / ML / Deep Learning</div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">TensorFlow / Keras</span><span class="skill-bar-value">90%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:90%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">PyTorch</span><span class="skill-bar-value">85%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:85%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">LLMs / NLP (GPT, BERT, LangChain)</span><span class="skill-bar-value">88%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:88%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Computer Vision (OpenCV, YOLO)</span><span class="skill-bar-value">82%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:82%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">scikit-learn / Pandas / NumPy</span><span class="skill-bar-value">92%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:92%"></div></div></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">🌐 Full-Stack Development</div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">React / Next.js</span><span class="skill-bar-value">93%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:93%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Node.js / Express</span><span class="skill-bar-value">90%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:90%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Python / FastAPI / Django</span><span class="skill-bar-value">88%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:88%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">TypeScript</span><span class="skill-bar-value">90%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:90%"></div></div></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">🗄️ Databases & Cloud</div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">PostgreSQL / MongoDB / Supabase</span><span class="skill-bar-value">87%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:87%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">AWS / Docker / CI-CD</span><span class="skill-bar-value">80%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:80%"></div></div></div>
              <div class="skill-bar-container"><div class="skill-bar-label"><span class="skill-bar-name">Git / GitHub Actions</span><span class="skill-bar-value">92%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:92%"></div></div></div>
            </div>
          </div>

          <!-- Experience Tab -->
          <div class="sp-tab-content" data-tab="experience" style="display:none;">
            <div class="sp-section">
              <div class="sp-section-title">Professional Experience</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Current Role:</span><span class="sp-spec-value">Full-Stack AI/ML Engineer</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Focus Areas:</span><span class="sp-spec-value">AI-powered Apps, LLM Integration, Web Systems</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Approach:</span><span class="sp-spec-value">End-to-end: model training → API → production</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Key Achievements</div>
              <div class="sp-spec-row"><span class="sp-spec-label">AI Projects:</span><span class="sp-spec-value">Built & deployed ML models serving 10K+ predictions/day</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Full-Stack:</span><span class="sp-spec-value">20+ production applications shipped</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Performance:</span><span class="sp-spec-value">Optimized inference latency by 70%</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Scale:</span><span class="sp-spec-value">Designed systems handling 100K+ concurrent users</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Competitions:</span><span class="sp-spec-value">Active competitive programmer on Codeforces & LeetCode</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Open Source & Community</div>
              <div class="sp-spec-row"><span class="sp-spec-label">GitHub:</span><span class="sp-spec-value">Active contributor with starred repositories</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Mentoring:</span><span class="sp-spec-value">Helped 5+ developers grow in AI/ML</span></div>
            </div>
          </div>

          <!-- Education Tab -->
          <div class="sp-tab-content" data-tab="education" style="display:none;">
            <div class="sp-section">
              <div class="sp-section-title">Formal Education</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Degree:</span><span class="sp-spec-value">B.Tech — Computer Science & Engineering</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Specialization:</span><span class="sp-spec-value">AI & Machine Learning</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Status:</span><span class="sp-spec-value">Ongoing / Graduated</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Certifications & Courses</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Deep Learning:</span><span class="sp-spec-value">DeepLearning.AI Specialization</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">AWS:</span><span class="sp-spec-value">Cloud Practitioner</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">ML:</span><span class="sp-spec-value">Stanford ML (Coursera) · fast.ai</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Web Dev:</span><span class="sp-spec-value">Meta Front-End Developer Professional</span></div>
            </div>
            <div class="sp-section">
              <div class="sp-section-title">Competitive Programming</div>
              <div class="sp-spec-row"><span class="sp-spec-label">Codeforces:</span><span class="sp-spec-value">Active rated participant</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">LeetCode:</span><span class="sp-spec-value">500+ problems solved</span></div>
              <div class="sp-spec-row"><span class="sp-spec-label">Focus:</span><span class="sp-spec-value">Algorithms, Data Structures, Dynamic Programming</span></div>
            </div>
          </div>
        </div>
      </div>`,
      onInit: (win) => {
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

  // ===== PROJECTS =====
  function openProjects() {
    const projects = [
      { id: 'codeboard', name: 'CodeBoard', icon: '📊', desc: 'A competitive programming dashboard tracking progress across Codeforces, LeetCode, and CodeChef. Features rating progression charts, problem analytics, growth metrics, and AI-powered study roadmaps.', tech: ['React', 'Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Chart.js'], demo: '#', github: 'https://github.com/freakyyirus' },
      { id: 'ai-judge', name: 'AI Code Judge', icon: '🤖', desc: 'An AI-powered code review system using LLMs to analyze competitive programming solutions. Provides feedback on time/space complexity, suggests optimizations, detects edge cases, and gives a performance rating with detailed explanations.', tech: ['Python', 'OpenAI API', 'LangChain', 'FastAPI', 'React', 'PostgreSQL'], demo: '#', github: 'https://github.com/freakyyirus' },
      { id: 'portfolio-os', name: 'Portfolio OS', icon: '🖥️', desc: 'This very portfolio! A Windows XP-themed interactive experience built entirely with vanilla HTML, CSS, and JavaScript. Features draggable windows, a working terminal, playable Minesweeper, Clippy, and nostalgic easter eggs.', tech: ['HTML', 'CSS', 'JavaScript', 'Web Audio API', 'SVG'], demo: '#', github: 'https://github.com/freakyyirus/Freakyyirus-Portfolio' },
      { id: 'monquest', name: 'MonQuest', icon: '🐲', desc: 'A monster collection adventure game with turn-based combat, procedural generation, and AI-driven opponent behavior. Features leveling system, item crafting, and multiplayer battles via WebSockets.', tech: ['JavaScript', 'Canvas API', 'Node.js', 'Socket.io', 'MongoDB'], demo: '#', github: 'https://github.com/freakyyirus' },
      { id: 'smart-vision', name: 'Smart Vision', icon: '👁️', desc: 'A real-time computer vision application using YOLO and OpenCV for object detection, pose estimation, and scene understanding. Deployed as a web service with GPU-accelerated inference pipeline.', tech: ['Python', 'PyTorch', 'OpenCV', 'YOLO', 'FastAPI', 'Docker'], demo: '#', github: 'https://github.com/freakyyirus' },
      { id: 'llm-chatbot', name: 'LLM Chatbot', icon: '💬', desc: 'A custom RAG-based chatbot that can answer questions about any uploaded document. Uses LangChain for retrieval-augmented generation with vector embeddings and OpenAI/local LLM backends.', tech: ['Python', 'LangChain', 'OpenAI', 'ChromaDB', 'Streamlit', 'HuggingFace'], demo: '#', github: 'https://github.com/freakyyirus' },
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
      width: 700,
      height: 480,
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
      height: 440,
      content: `<div class="project-detail window-body-padded">
        <div class="project-detail-header">
          <div class="project-detail-icon">${proj.icon}</div>
          <div class="project-detail-title">
            <h3>${proj.name}</h3>
            <p>Type: Application</p>
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

  // ===== TERMINAL =====
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

  // ===== MINESWEEPER =====
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

  // ===== INTERNET EXPLORER =====
  function openIE() {
    WindowManager.create({
      id: 'internet-explorer',
      title: 'Internet Explorer',
      icon: '🌐',
      width: 700,
      height: 500,
      addressbar: 'https://github.com/freakyyirus',
      toolbar: `<span class="toolbar-btn" onclick="window.open('https://github.com/freakyyirus','_blank')">🔙 Back</span>
                <span class="toolbar-btn">🔜 Forward</span>
                <span class="toolbar-btn" onclick="window.open('https://github.com/freakyyirus','_blank')">🔄 Refresh</span>
                <span class="toolbar-btn" onclick="window.open('https://github.com/freakyyirus','_blank')">🏠 Home</span>`,
      content: `<div class="ie-content">
        <div class="ie-fallback">
          <h2 style="font-size:24px;margin-bottom:8px;">🌐</h2>
          <h2>Internet Explorer</h2>
          <p>Due to browser security policies, external pages cannot be embedded.<br>Click the links below to visit:</p>
          <div class="ie-fallback-links">
            <a href="https://github.com/freakyyirus" target="_blank" class="ie-fallback-link">🐙 GitHub — freakyyirus</a>
            <a href="https://linkedin.com" target="_blank" class="ie-fallback-link">💼 LinkedIn Profile</a>
            <a href="https://codeforces.com" target="_blank" class="ie-fallback-link">🏆 Codeforces Profile</a>
            <a href="https://leetcode.com" target="_blank" class="ie-fallback-link">💻 LeetCode Profile</a>
            <a href="mailto:dev@portfolio.com" class="ie-fallback-link">📧 Send Email</a>
          </div>
        </div>
      </div>`,
    });
  }

  // ===== RECYCLE BIN =====
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

  // ===== RESUME =====
  function openResume() {
    WindowManager.create({
      id: 'resume',
      title: 'My Resume — Document Viewer',
      icon: '📄',
      width: 550,
      height: 500,
      content: `<div class="window-body-padded" style="text-align:center;">
        <div style="font-size:64px;margin:20px 0;">📄</div>
        <h2 style="font-size:16px;color:#003399;margin-bottom:8px;">My Resume / CV</h2>
        <p style="font-size:11px;color:#666;margin-bottom:20px;line-height:1.6;">
          Full-Stack AI/ML Engineer<br>
          Specializing in Deep Learning, LLMs, and scalable web systems
        </p>
        <div style="background:#F5F5F5;border:1px solid #DDD;border-radius:4px;padding:20px;margin:16px 0;text-align:left;font-size:11px;line-height:1.8;">
          <strong style="color:#003399;">Summary:</strong><br>
          Passionate Full-Stack Engineer with expertise in AI/ML, building production-ready
          applications that bridge cutting-edge machine learning with intuitive user interfaces.
          Strong competitive programming background with deep knowledge of algorithms and data structures.
          <br><br>
          <strong style="color:#003399;">Core Competencies:</strong><br>
          • AI/ML: TensorFlow, PyTorch, LangChain, OpenAI, HuggingFace, scikit-learn<br>
          • Frontend: React, Next.js, TypeScript, HTML/CSS, Tailwind<br>
          • Backend: Node.js, Python, FastAPI, Django, Express<br>
          • Cloud: AWS, Docker, Vercel, GitHub Actions<br>
          • Data: PostgreSQL, MongoDB, Supabase, Redis, ChromaDB
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <a href="#" class="project-link-btn" onclick="alert('Replace # with your actual resume PDF URL!');return false;">📥 Download PDF</a>
          <a href="https://linkedin.com" target="_blank" class="project-link-btn">💼 LinkedIn</a>
          <a href="https://github.com/freakyyirus" target="_blank" class="project-link-btn">🐙 GitHub</a>
        </div>
        <p style="font-size:9px;color:#999;margin-top:16px;">💡 Replace the download link with your actual resume PDF URL</p>
      </div>`,
    });
  }

  // ===== CONTACT =====
  function openContact() {
    WindowManager.create({
      id: 'contact',
      title: 'Contact Me — New Message',
      icon: '📧',
      width: 480,
      height: 440,
      content: `<div class="window-body-padded">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #E0E0E0;">
          <span style="font-size:36px;">📧</span>
          <div>
            <h3 style="font-size:14px;color:#003399;margin-bottom:2px;">Get in Touch</h3>
            <p style="font-size:10px;color:#666;">Let's build something amazing together</p>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <div class="sp-section-title">📬 Contact Information</div>
          <div class="sp-spec-row"><span class="sp-spec-label">📧 Email:</span><span class="sp-spec-value"><a href="mailto:your.email@gmail.com" style="color:#003399;text-decoration:underline;">your.email@gmail.com</a></span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">🐙 GitHub:</span><span class="sp-spec-value"><a href="https://github.com/freakyyirus" target="_blank" style="color:#003399;text-decoration:underline;">github.com/freakyyirus</a></span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">💼 LinkedIn:</span><span class="sp-spec-value"><a href="https://linkedin.com" target="_blank" style="color:#003399;text-decoration:underline;">linkedin.com/in/yourprofile</a></span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">🐦 Twitter:</span><span class="sp-spec-value"><a href="https://twitter.com" target="_blank" style="color:#003399;text-decoration:underline;">@yourhandle</a></span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">🌐 Website:</span><span class="sp-spec-value"><a href="#" style="color:#003399;text-decoration:underline;">yourportfolio.dev</a></span></div>
        </div>

        <div style="margin-bottom:16px;">
          <div class="sp-section-title">✉️ Quick Message</div>
          <p style="font-size:11px;color:#666;margin-bottom:12px;">Open for collaborations, freelance projects, job opportunities, or just a friendly chat about AI and code!</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="mailto:your.email@gmail.com?subject=Let's%20collaborate!" class="project-link-btn">📧 Send Email</a>
            <a href="https://linkedin.com" target="_blank" class="project-link-btn">💼 Connect on LinkedIn</a>
            <a href="https://github.com/freakyyirus" target="_blank" class="project-link-btn">🐙 Follow on GitHub</a>
          </div>
        </div>

        <div style="background:#FFFFCC;border:1px solid #E6E6AA;border-radius:4px;padding:10px;font-size:10px;color:#666;">
          💡 <strong>Tip:</strong> You can also type <code style="background:#EEE;padding:1px 4px;border-radius:2px;">contact</code> in the Command Prompt to see my contact info!
        </div>
      </div>`,
    });
  }

  // ===== COMPETITIVE PROGRAMMING =====
  function openCompetitions() {
    WindowManager.create({
      id: 'competitions',
      title: 'Competitive Programming — Achievements',
      icon: '🏆',
      width: 520,
      height: 480,
      content: `<div class="window-body-padded">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #E0E0E0;">
          <span style="font-size:42px;">🏆</span>
          <div>
            <h3 style="font-size:14px;color:#003399;margin-bottom:2px;">Competitive Programming</h3>
            <p style="font-size:10px;color:#666;">Algorithms · Data Structures · Problem Solving</p>
          </div>
        </div>

        <div class="sp-section">
          <div class="sp-section-title">🌐 Profiles & Ratings</div>
          <div class="sp-spec-row"><span class="sp-spec-label">Codeforces:</span><span class="sp-spec-value"><a href="https://codeforces.com" target="_blank" style="color:#003399;text-decoration:underline;">Rated Participant</a> — Active Contestant</span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">LeetCode:</span><span class="sp-spec-value"><a href="https://leetcode.com" target="_blank" style="color:#003399;text-decoration:underline;">500+ Problems Solved</a></span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">CodeChef:</span><span class="sp-spec-value">Active rated participant</span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">HackerRank:</span><span class="sp-spec-value">5★ in Problem Solving</span></div>
        </div>

        <div class="sp-section">
          <div class="sp-section-title">🎯 Expertise Areas</div>
          <div class="tech-tags" style="margin-bottom:12px;">
            <span class="tech-tag">Dynamic Programming</span>
            <span class="tech-tag">Graph Theory</span>
            <span class="tech-tag">Binary Search</span>
            <span class="tech-tag">Greedy</span>
            <span class="tech-tag">Segment Trees</span>
            <span class="tech-tag">Number Theory</span>
            <span class="tech-tag">String Algorithms</span>
            <span class="tech-tag">Bit Manipulation</span>
            <span class="tech-tag">DFS / BFS</span>
            <span class="tech-tag">Divide & Conquer</span>
          </div>
        </div>

        <div class="sp-section">
          <div class="sp-section-title">🏅 Highlights</div>
          <div class="sp-spec-row"><span class="sp-spec-label">Problems:</span><span class="sp-spec-value">1000+ problems solved across all platforms</span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">Contests:</span><span class="sp-spec-value">Regular participant in Div 2/3 contests</span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">Streaks:</span><span class="sp-spec-value">Consistent daily practice schedule</span></div>
          <div class="sp-spec-row"><span class="sp-spec-label">Languages:</span><span class="sp-spec-value">C++ (primary), Python, Java</span></div>
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          <a href="https://codeforces.com" target="_blank" class="project-link-btn">🔴 Codeforces</a>
          <a href="https://leetcode.com" target="_blank" class="project-link-btn">🟡 LeetCode</a>
          <a href="https://codechef.com" target="_blank" class="project-link-btn">🟤 CodeChef</a>
        </div>
      </div>`,
    });
  }

  // ===== LOG OFF =====
  window.logoff = function () {
    WindowManager.getAll().forEach((data, id) => {
      data.element.remove();
    });
    WindowManager.getAll().clear();

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
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => { document.body.style.filter = 'hue-rotate(90deg)'; }, 500);
    setTimeout(() => { document.body.style.filter = ''; }, 1500);

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
