/* ============ CLIPPY ============ */
const Clippy = (() => {
    let interval = null;
    let visible = false;
    const MIN_DELAY = 45000;  // 45 seconds
    const MAX_DELAY = 90000;  // 90 seconds

    const jokes = [
        "It looks like you're viewing a portfolio!\nWould you like help with that? 📎",
        "Fun fact: This entire portfolio runs\non vanilla JS. No React needed! 😏",
        "Pro tip: Try typing 'secret' in the\nCommand Prompt! 🤫",
        "Did you know? 99% of developers\nprefer dark mode. The other 1%\nare lying. 🌙",
        "Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛",
        "I'd tell you a UDP joke, but\nyou might not get it. 📡",
        "A SQL query walks into a bar,\nsees two tables, and asks:\n'Can I JOIN you?' 🍺",
        "There are only 10 types of people:\nthose who understand binary\nand those who don't. 🔢",
        "Why was the JavaScript developer sad?\nBecause he didn't Node how to\nExpress himself. 😭",
        "What's a programmer's favorite\nhangout place? Foo Bar! 🍸",
        "Have you checked out the\nProjects folder yet? Some cool\nstuff in there! 📁",
        "Try right-clicking in Minesweeper\nto place flags! 🚩",
        "!false — It's funny because\nit's true. 😄",
        "['hip', 'hip']\n(hip hip array!) 🎉",
        "I see you're still here!\nMaybe explore the Start Menu? 🟢",
        "The best code is no code.\nThe second best is deleted code. 🗑️",
        "Roses are #FF0000,\nViolets are #0000FF,\nAll my base are\nbelong to you. 💐",
    ];

    function getRandomJoke() {
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    function show() {
        const container = document.getElementById('clippy-container');
        const text = document.getElementById('clippy-text');
        if (!container || !text) return;

        text.textContent = getRandomJoke();
        container.classList.remove('hidden', 'hiding');
        visible = true;
        Sounds.play('notify');
    }

    function hide() {
        const container = document.getElementById('clippy-container');
        if (!container) return;

        container.classList.add('hiding');
        setTimeout(() => {
            container.classList.add('hidden');
            container.classList.remove('hiding');
            visible = false;
        }, 300);
    }

    function scheduleNext() {
        const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
        interval = setTimeout(() => {
            show();
            // Auto-hide after 12 seconds
            setTimeout(() => {
                if (visible) hide();
                scheduleNext();
            }, 12000);
        }, delay);
    }

    return {
        init() {
            // Dismiss button
            const dismiss = document.getElementById('clippy-dismiss');
            if (dismiss) {
                dismiss.addEventListener('click', () => {
                    hide();
                });
            }

            // Click on clippy character
            const character = document.querySelector('.clippy-character');
            if (character) {
                character.addEventListener('click', () => {
                    const text = document.getElementById('clippy-text');
                    if (text) text.textContent = getRandomJoke();
                });
            }

            // Start showing
            scheduleNext();
        },

        show,
        hide,

        stop() {
            clearTimeout(interval);
            hide();
        }
    };
})();
