/* ============ TERMINAL ============ */
const Terminal = (() => {
    const COMMANDS = {
        help: () => `Available commands:
  help        - Show this help message
  dir         - List project files
  ls          - Alias for dir
  whoami      - About the developer
  projects    - List projects with details
  skills      - List technical skills
  contact     - Show contact information
  echo [msg]  - Echo a message
  clear / cls - Clear the terminal
  date        - Show current date and time
  ver         - Show system version
  secret      - ???
  bsod        - ???
  exit        - Close terminal`,

        dir: () => `
 Volume in drive C has no label.
 Volume Serial Number is 1337-CAFE

 Directory of C:\\Developer\\Portfolio

03/02/2026  11:00 PM    <DIR>          .
03/02/2026  11:00 PM    <DIR>          ..
03/02/2026  10:30 PM    <DIR>          Projects
03/02/2026  10:30 PM    <DIR>          Skills
03/02/2026  10:30 PM         4,096     about.txt
03/02/2026  10:30 PM         2,048     contact.txt
03/02/2026  10:30 PM         8,192     resume.pdf
               3 File(s)         14,336 bytes
               4 Dir(s)     999,999,999 bytes free`,

        ls: () => COMMANDS.dir(),

        whoami: () => `
╔════════════════════════════════════════╗
║          DEVELOPER PROFILE            ║
╠════════════════════════════════════════╣
║  Name:     Full Stack Developer       ║
║  Role:     Software Engineer          ║
║  Level:    Senior                     ║
║  OS:       Windows XP (Portfolio Ed.) ║
║  Uptime:   Passionate since day one   ║
╚════════════════════════════════════════╝

Building beautiful, functional web
applications with modern technologies.
Passionate about clean code, great UX,
and pushing the boundaries of what's
possible on the web.`,

        projects: () => `
┌─────────────────────────────────────────┐
│            MY PROJECTS                  │
├─────────────────────────────────────────┤
│                                         │
│  [1] CodeBoard                          │
│      Competitive programming dashboard  │
│      Tech: React, Next.js, Supabase     │
│                                         │
│  [2] Portfolio OS                        │
│      Windows XP themed portfolio        │
│      Tech: HTML, CSS, JavaScript        │
│                                         │
│  [3] AI Code Judge                      │
│      AI-powered code review system      │
│      Tech: Python, OpenAI, FastAPI      │
│                                         │
│  [4] MonQuest                           │
│      Monster collection adventure game  │
│      Tech: JavaScript, Canvas, Node.js  │
│                                         │
│  Type 'projects' in the Projects folder │
│  for more details and live demos.       │
└─────────────────────────────────────────┘`,

        skills: () => `
Technical Skills:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Languages:   JavaScript, TypeScript, Python, Java, C++
  Frontend:    React, Next.js, Vue.js, HTML/CSS, Tailwind
  Backend:     Node.js, Express, FastAPI, Django
  Database:    PostgreSQL, MongoDB, Supabase, Firebase
  DevOps:      Docker, AWS, Vercel, GitHub Actions
  Tools:       Git, VS Code, Figma, Linux
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,

        contact: () => `
╔══════════════════════════════════════╗
║          CONTACT INFO                ║
╠══════════════════════════════════════╣
║  📧 Email:    dev@portfolio.com      ║
║  🐙 GitHub:   github.com/developer   ║
║  💼 LinkedIn: linkedin.com/in/dev    ║
║  🌐 Website:  portfolio.dev          ║
║  🐦 Twitter:  @developer             ║
╚══════════════════════════════════════╝

Feel free to reach out for collaborations,
job opportunities, or just to chat!`,

        date: () => {
            const now = new Date();
            return `Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Current Time: ${now.toLocaleTimeString('en-US')}`;
        },

        ver: () => `
Microsoft Windows XP [Version 10.0.2026]
Portfolio Edition - Custom Build
(c) Developer. All rights reserved.`,

        secret: () => `
🎉 You found a secret!

"Any sufficiently advanced CSS is
 indistinguishable from magic."
    - Arthur C. Clarke (probably)

Try the Konami Code for another surprise!
↑ ↑ ↓ ↓ ← → ← → B A`,

        bsod: () => {
            setTimeout(() => {
                if (typeof triggerBSOD === 'function') triggerBSOD();
            }, 500);
            return 'FATAL ERROR: System crash imminent...';
        },

        echo: (args) => args.join(' ') || '',

        exit: () => {
            setTimeout(() => WindowManager.close('terminal'), 100);
            return 'Closing terminal...';
        },
    };

    function processCommand(cmd) {
        const trimmed = cmd.trim();
        if (!trimmed) return '';

        const parts = trimmed.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (command === 'clear' || command === 'cls') {
            return '__CLEAR__';
        }

        if (COMMANDS[command]) {
            if (typeof COMMANDS[command] === 'function') {
                return COMMANDS[command](args);
            }
            return COMMANDS[command];
        }

        return `'${parts[0]}' is not recognized as an internal or external command,
operable program or batch file. Type 'help' for available commands.`;
    }

    return {
        getHTML() {
            return `<div class="terminal-container" id="terminal-body">
        <div class="terminal-output" id="terminal-output">
          <div class="terminal-line info">Microsoft Windows XP [Version 10.0.2026]</div>
          <div class="terminal-line info">(c) Developer Portfolio. All rights reserved.</div>
          <div class="terminal-line info">Type 'help' for available commands.</div>
          <div class="terminal-line">&nbsp;</div>
        </div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">C:\\Developer&gt; </span>
          <input type="text" class="terminal-input" id="terminal-input" autocomplete="off" spellcheck="false" autofocus>
        </div>
      </div>`;
        },

        init(windowEl) {
            const input = windowEl.querySelector('#terminal-input');
            const output = windowEl.querySelector('#terminal-output');
            const container = windowEl.querySelector('#terminal-body');

            if (!input || !output) return;

            const history = [];
            let historyIndex = -1;

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = input.value;

                    // Add command to output
                    const cmdLine = document.createElement('div');
                    cmdLine.className = 'terminal-line command';
                    cmdLine.textContent = `C:\\Developer> ${cmd}`;
                    output.appendChild(cmdLine);

                    // Process command
                    const result = processCommand(cmd);

                    if (result === '__CLEAR__') {
                        output.innerHTML = '';
                    } else if (result) {
                        const resultLine = document.createElement('div');
                        resultLine.className = 'terminal-line response';
                        resultLine.textContent = result;
                        output.appendChild(resultLine);
                    }

                    // Add blank line
                    const blank = document.createElement('div');
                    blank.className = 'terminal-line';
                    blank.innerHTML = '&nbsp;';
                    output.appendChild(blank);

                    // History
                    if (cmd.trim()) {
                        history.unshift(cmd);
                    }
                    historyIndex = -1;

                    input.value = '';
                    container.scrollTop = container.scrollHeight;
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        input.value = history[historyIndex];
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIndex > 0) {
                        historyIndex--;
                        input.value = history[historyIndex];
                    } else {
                        historyIndex = -1;
                        input.value = '';
                    }
                }
            });

            // Focus input when clicking terminal
            container.addEventListener('click', () => {
                input.focus();
            });

            // Auto-focus
            setTimeout(() => input.focus(), 100);
        }
    };
})();
