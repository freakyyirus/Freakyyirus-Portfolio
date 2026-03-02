/* ============ TERMINAL EMULATOR ============ */
const Terminal = (() => {
    let terminalEl = null;
    let outputEl = null;
    let inputEl = null;
    let history = [];
    let historyIndex = -1;

    function getHTML() {
        return `<div class="terminal" id="terminal-app">
      <div class="terminal-output" id="terminal-output">
        <div class="terminal-line">Microsoft Windows XP [Version 10.0.2026]</div>
        <div class="terminal-line">(C) Full-Stack AI/ML Developer Portfolio</div>
        <div class="terminal-line">&nbsp;</div>
        <div class="terminal-line">Type 'help' for available commands.</div>
        <div class="terminal-line">&nbsp;</div>
      </div>
      <div class="terminal-input-line">
        <span class="terminal-prompt">C:\\Developer&gt; </span>
        <input type="text" class="terminal-input" id="terminal-input" spellcheck="false" autocomplete="off" autocapitalize="off">
      </div>
    </div>`;
    }

    function init(win) {
        terminalEl = win.querySelector('#terminal-app');
        outputEl = win.querySelector('#terminal-output');
        inputEl = win.querySelector('#terminal-input');

        if (!inputEl) return;

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = inputEl.value.trim();
                if (cmd) {
                    history.unshift(cmd);
                    historyIndex = -1;
                    executeCommand(cmd);
                } else {
                    addLine(`C:\\Developer> `);
                }
                inputEl.value = '';
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    inputEl.value = history[historyIndex];
                }
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    inputEl.value = history[historyIndex];
                } else {
                    historyIndex = -1;
                    inputEl.value = '';
                }
            }
        });

        // Click to focus
        if (terminalEl) {
            terminalEl.addEventListener('click', () => inputEl.focus());
        }
        setTimeout(() => inputEl.focus(), 100);
    }

    function addLine(text) {
        if (!outputEl) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = text;
        outputEl.appendChild(line);
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    function executeCommand(cmd) {
        addLine(`<span class="terminal-prompt">C:\\Developer&gt;</span> ${escapeHTML(cmd)}`);

        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        switch (command) {
            case 'help':
                addLine('');
                addLine('Available commands:');
                addLine('');
                addLine('    help        - Show this help message');
                addLine('    dir / ls    - List project files');
                addLine('    whoami      - About the developer');
                addLine('    projects    - List projects with details');
                addLine('    skills      - List technical skills');
                addLine('    contact     - Show contact information');
                addLine('    resume      - Open resume');
                addLine('    achievements- Show competitive programming stats');
                addLine('    echo [msg]  - Echo a message');
                addLine('    clear / cls - Clear the terminal');
                addLine('    date        - Show current date and time');
                addLine('    ver         - Show system version');
                addLine('    secret      - ???');
                addLine('    bsod        - ???');
                addLine('    exit        - Close terminal');
                break;

            case 'dir':
            case 'ls':
                addLine('');
                addLine(' Volume in drive C has no label.');
                addLine(' Volume Serial Number is DEV-AI2026');
                addLine('');
                addLine(' Directory of C:\\Developer\\');
                addLine('');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          .');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          ..');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          AI-Projects');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          Full-Stack-Apps');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          Competitive-Programming');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          ML-Models');
                addLine(' 03/02/2026  11:30 PM    &lt;DIR&gt;          Open-Source');
                addLine(' 03/02/2026  10:00 PM         4,096      resume.pdf');
                addLine(' 03/02/2026  10:00 PM         2,048      skills.json');
                addLine(' 03/02/2026  10:00 PM         1,024      README.md');
                addLine('               3 File(s)         7,168 bytes');
                addLine('               7 Dir(s)    ∞ bytes free');
                break;

            case 'whoami':
                addLine('');
                addLine('  ═══════════════════════════════════════════');
                addLine('  ║  Full-Stack AI/ML Engineer              ║');
                addLine('  ═══════════════════════════════════════════');
                addLine('');
                addLine('  Passionate developer specializing in AI,');
                addLine('  Machine Learning, and scalable web systems.');
                addLine('');
                addLine('  » Building LLM-powered apps, ML pipelines,');
                addLine('    and production systems end-to-end.');
                addLine('  » Competitive programmer on Codeforces &');
                addLine('    LeetCode (1000+ problems solved).');
                addLine('  » B.Tech CS — AI/ML specialization.');
                addLine('');
                addLine('  Currently focused on: LLMs, Deep Learning,');
                addLine('  Computer Vision, and Full-Stack Development.');
                addLine('');
                addLine('  "The best code is no code. But when you');
                addLine('   must code — make it intelligent." 🤖');
                break;

            case 'projects':
                addLine('');
                addLine('  ┌──────────────────────────────────────────┐');
                addLine('  │  📊  CodeBoard                           │');
                addLine('  │  └─ CP dashboard: track Codeforces,      │');
                addLine('  │     LeetCode ratings + AI study roadmaps  │');
                addLine('  ├──────────────────────────────────────────┤');
                addLine('  │  🤖  AI Code Judge                       │');
                addLine('  │  └─ LLM-powered code review: complexity  │');
                addLine('  │     analysis, optimization suggestions    │');
                addLine('  ├──────────────────────────────────────────┤');
                addLine('  │  🖥️  Portfolio OS                        │');
                addLine('  │  └─ This Windows XP portfolio           │');
                addLine('  │     (HTML/CSS/JS, no frameworks!)         │');
                addLine('  ├──────────────────────────────────────────┤');
                addLine('  │  🐲  MonQuest                            │');
                addLine('  │  └─ Monster adventure game with AI       │');
                addLine('  │     opponents and multiplayer             │');
                addLine('  ├──────────────────────────────────────────┤');
                addLine('  │  👁️  Smart Vision                        │');
                addLine('  │  └─ Real-time object detection with      │');
                addLine('  │     YOLO and OpenCV, GPU-accelerated      │');
                addLine('  ├──────────────────────────────────────────┤');
                addLine('  │  💬  LLM Chatbot                         │');
                addLine('  │  └─ RAG chatbot: chat with any document  │');
                addLine('  │     using LangChain + vector embeddings   │');
                addLine('  └──────────────────────────────────────────┘');
                addLine('');
                addLine('  Type "open projects" in desktop to view details.');
                break;

            case 'skills':
                addLine('');
                addLine('  🤖 AI / ML / Deep Learning:');
                addLine('    ████████████████████░ TensorFlow / Keras');
                addLine('    ███████████████████░░ PyTorch');
                addLine('    ████████████████████░ LLMs / LangChain');
                addLine('    ██████████████████░░░ Computer Vision');
                addLine('    █████████████████████ scikit-learn / Pandas');
                addLine('');
                addLine('  🌐 Full-Stack Development:');
                addLine('    █████████████████████ React / Next.js');
                addLine('    ████████████████████░ Node.js / Express');
                addLine('    ████████████████████░ Python / FastAPI');
                addLine('    ████████████████████░ TypeScript');
                addLine('');
                addLine('  🗄️  Cloud & DevOps:');
                addLine('    ██████████████████░░░ AWS / Docker');
                addLine('    ███████████████████░░ PostgreSQL / MongoDB');
                addLine('    █████████████████████ Git / GitHub Actions');
                break;

            case 'contact':
                addLine('');
                addLine('  ╔══════════════════════════════════════════╗');
                addLine('  ║  📧 Email:    your.email@gmail.com       ║');
                addLine('  ║  🐙 GitHub:   github.com/freakyyirus      ║');
                addLine('  ║  💼 LinkedIn: linkedin.com/in/yourprofile  ║');
                addLine('  ║  🐦 Twitter:  @yourhandle                 ║');
                addLine('  ║  🌐 Website:  yourportfolio.dev            ║');
                addLine('  ╚══════════════════════════════════════════╝');
                addLine('');
                addLine('  Open for collaborations and opportunities!');
                break;

            case 'resume':
                addLine('');
                addLine('  Opening resume...');
                if (typeof openApp === 'function') openApp('resume');
                break;

            case 'achievements':
                addLine('');
                addLine('  🏆 Competitive Programming Stats:');
                addLine('  ─────────────────────────────────');
                addLine('  🔴 Codeforces   — Active rated contestant');
                addLine('  🟡 LeetCode     — 500+ problems solved');
                addLine('  🟤 CodeChef     — Active participant');
                addLine('  ⭐ HackerRank   — 5★ Problem Solving');
                addLine('');
                addLine('  Expertise: DP, Graphs, Binary Search,');
                addLine('  Segment Trees, Number Theory, Greedy');
                addLine('');
                addLine('  Total problems: 1000+ across all platforms');
                break;

            case 'echo':
                addLine(args || '');
                break;

            case 'clear':
            case 'cls':
                if (outputEl) outputEl.innerHTML = '';
                break;

            case 'date':
                addLine('');
                addLine(`  Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
                addLine(`  Current time: ${new Date().toLocaleTimeString()}`);
                break;

            case 'ver':
                addLine('');
                addLine('  Microsoft Windows XP [Portfolio Edition]');
                addLine('  Version 10.0.2026 — AI/ML Developer Build');
                addLine('  (c) Full-Stack Developer. All rights reserved.');
                break;

            case 'secret':
                addLine('');
                addLine('  🔓 SECRET UNLOCKED');
                addLine('  ─────────────────');
                addLine('  "The only way to do great work is to love');
                addLine('   what you do." — Steve Jobs');
                addLine('');
                addLine('  Here\'s what you won\'t find on my resume:');
                addLine('  → I\'ve debugged code at 3 AM more often');
                addLine('    than I care to admit');
                addLine('  → I trained my first neural net on a laptop');
                addLine('    without a GPU (never again)');
                addLine('  → I once solved a DP problem in my sleep');
                addLine('  → This entire portfolio is framework-free! 🎉');
                addLine('');
                addLine('  Try the Konami Code: ↑↑↓↓←→←→BA 🎮');
                break;

            case 'bsod':
                addLine('');
                addLine('  ⚠️  Initiating Blue Screen of Death...');
                setTimeout(() => { if (typeof triggerBSOD === 'function') triggerBSOD(); }, 800);
                break;

            case 'exit':
                addLine('');
                addLine('  Goodbye! 👋');
                setTimeout(() => {
                    WindowManager.close('terminal');
                }, 500);
                break;

            default:
                addLine('');
                addLine(`  '${escapeHTML(command)}' is not recognized as an internal`);
                addLine('  or external command, operable program or batch file.');
                addLine('');
                addLine('  Type "help" for available commands.');
                break;
        }
        addLine('');
    }

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    return { getHTML, init };
})();
