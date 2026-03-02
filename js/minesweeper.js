/* ============ MINESWEEPER ============ */
const Minesweeper = (() => {
    let grid = [];
    let rows = 9;
    let cols = 9;
    let mines = 10;
    let flagCount = 0;
    let revealed = 0;
    let gameOver = false;
    let firstClick = true;
    let timer = 0;
    let timerInterval = null;
    let containerEl = null;

    function createGrid(safeR, safeC) {
        grid = [];
        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                grid[r][c] = { mine: false, revealed: false, flagged: false, number: 0 };
            }
        }
        // Place mines
        let placed = 0;
        while (placed < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (!grid[r][c].mine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
                grid[r][c].mine = true;
                placed++;
            }
        }
        // Calculate numbers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].mine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) {
                            count++;
                        }
                    }
                }
                grid[r][c].number = count;
            }
        }
    }

    function reveal(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        const cell = grid[r][c];
        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;
        revealed++;
        updateCell(r, c);

        if (cell.mine) {
            gameOver = true;
            clearInterval(timerInterval);
            revealAllMines(r, c);
            updateFace('😵');
            Sounds.play('error');
            return;
        }

        if (cell.number === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    reveal(r + dr, c + dc);
                }
            }
        }

        checkWin();
    }

    function checkWin() {
        if (revealed === rows * cols - mines) {
            gameOver = true;
            clearInterval(timerInterval);
            updateFace('😎');
            Sounds.play('notify');
            // Flag remaining mines
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r][c].mine && !grid[r][c].flagged) {
                        grid[r][c].flagged = true;
                        updateCell(r, c);
                    }
                }
            }
            updateCounter();
        }
    }

    function revealAllMines(explR, explC) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].mine) {
                    grid[r][c].revealed = true;
                    updateCell(r, c);
                    if (r === explR && c === explC) {
                        const cellEl = getCellEl(r, c);
                        if (cellEl) cellEl.classList.add('mine-exploded');
                    }
                }
            }
        }
    }

    function getCellEl(r, c) {
        if (!containerEl) return null;
        return containerEl.querySelector(`.ms-cell[data-r="${r}"][data-c="${c}"]`);
    }

    function updateCell(r, c) {
        const cellEl = getCellEl(r, c);
        if (!cellEl) return;
        const cell = grid[r][c];

        cellEl.className = 'ms-cell';

        if (cell.revealed) {
            cellEl.classList.add('revealed');
            if (cell.mine) {
                cellEl.textContent = '💣';
            } else if (cell.number > 0) {
                cellEl.textContent = cell.number;
                cellEl.dataset.number = cell.number;
            } else {
                cellEl.textContent = '';
            }
        } else if (cell.flagged) {
            cellEl.classList.add('flagged');
            cellEl.textContent = '🚩';
        } else {
            cellEl.textContent = '';
        }
    }

    function updateCounter() {
        const counter = containerEl?.querySelector('.ms-counter');
        if (counter) {
            const val = Math.max(0, mines - flagCount);
            counter.textContent = val.toString().padStart(3, '0');
        }
    }

    function updateTimer() {
        const timerEl = containerEl?.querySelector('.ms-timer');
        if (timerEl) {
            timerEl.textContent = Math.min(999, timer).toString().padStart(3, '0');
        }
    }

    function updateFace(emoji) {
        const face = containerEl?.querySelector('.ms-face-btn');
        if (face) face.textContent = emoji;
    }

    function resetGame() {
        grid = [];
        flagCount = 0;
        revealed = 0;
        gameOver = false;
        firstClick = true;
        timer = 0;
        clearInterval(timerInterval);
        timerInterval = null;
        render();
    }

    function render() {
        if (!containerEl) return;

        const gridEl = containerEl.querySelector('.ms-grid');
        if (!gridEl) return;

        gridEl.style.gridTemplateColumns = `repeat(${cols}, 28px)`;
        gridEl.innerHTML = '';

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'ms-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;

                cell.addEventListener('click', (e) => {
                    if (gameOver) return;
                    if (firstClick) {
                        createGrid(r, c);
                        firstClick = false;
                        timerInterval = setInterval(() => { timer++; updateTimer(); }, 1000);
                    }
                    reveal(r, c);
                });

                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (gameOver || !grid[r]?.[c]) return;
                    const g = grid[r][c];
                    if (g.revealed) return;
                    g.flagged = !g.flagged;
                    flagCount += g.flagged ? 1 : -1;
                    updateCell(r, c);
                    updateCounter();
                    Sounds.play('click');
                });

                gridEl.appendChild(cell);
            }
        }

        updateCounter();
        updateTimer();
        updateFace('😊');
    }

    return {
        getHTML() {
            return `<div class="minesweeper-container">
        <div class="ms-header">
          <div class="ms-counter">010</div>
          <button class="ms-face-btn">😊</button>
          <div class="ms-timer">000</div>
        </div>
        <div class="ms-grid"></div>
        <div class="ms-difficulty">
          <button class="ms-diff-btn active" data-rows="9" data-cols="9" data-mines="10">Beginner</button>
          <button class="ms-diff-btn" data-rows="16" data-cols="16" data-mines="40">Intermediate</button>
          <button class="ms-diff-btn" data-rows="16" data-cols="30" data-mines="99">Expert</button>
        </div>
      </div>`;
        },

        init(windowEl) {
            containerEl = windowEl.querySelector('.minesweeper-container');
            if (!containerEl) return;

            // Face reset button
            const faceBtn = containerEl.querySelector('.ms-face-btn');
            if (faceBtn) {
                faceBtn.addEventListener('click', resetGame);
            }

            // Difficulty buttons
            containerEl.querySelectorAll('.ms-diff-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    containerEl.querySelectorAll('.ms-diff-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    rows = parseInt(btn.dataset.rows);
                    cols = parseInt(btn.dataset.cols);
                    mines = parseInt(btn.dataset.mines);

                    // Update grid cell sizes for larger grids
                    const gridEl = containerEl.querySelector('.ms-grid');
                    if (gridEl) {
                        const cellSize = cols > 16 ? 22 : 28;
                        gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
                        // Update the CSS for cells
                        containerEl.querySelectorAll('.ms-cell').forEach(c => {
                            c.style.width = cellSize + 'px';
                            c.style.height = cellSize + 'px';
                            c.style.fontSize = (cellSize > 24 ? 14 : 11) + 'px';
                        });
                    }

                    resetGame();
                });
            });

            render();
        }
    };
})();
