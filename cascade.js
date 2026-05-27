const BOARD_SIZE = 8;
const COLORS = ['c1', 'c2', 'c3', 'c4', 'c5'];
const EPOCH = new Date('2026-05-25T00:00:00');
const HINT_COST = 1;

let puzzle = null;
let state = null;
let drag = null;

// ── Init ──────────────────────────────────────────────────────────────────────

function todayString() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function getDayIndex() {
  const ms = new Date() - EPOCH;
  return Math.max(0, Math.floor(ms / 86400000));
}

function parseStartingBoard(rows) {
  return rows.map(r => r.split('').map(c => c === '1' ? 1 : 0));
}

function init() {
  const dateStr = todayString();
  const idx = getDayIndex() % PUZZLES.length;
  puzzle = PUZZLES[idx];

  const saved = localStorage.getItem(`cascade-${dateStr}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.puzzleId === puzzle.id) state = parsed;
    } catch (_) {}
  }

  if (!state) resetState();

  document.getElementById('puzzle-number').textContent =
    `#${String(puzzle.id).padStart(3, '0')}`;
  document.getElementById('puzzle-name').textContent = puzzle.name;

  buildBoard();
  renderAll();
}

function resetState() {
  state = {
    puzzleId: puzzle.id,
    date: todayString(),
    pieceIndex: 0,
    board: parseStartingBoard(puzzle.startingBoard),
    cellColors: parseStartingBoard(puzzle.startingBoard).map(row =>
      row.map(c => c ? 0 : null)
    ),
    placements: [],
    totalCleared: 0,
    hintsUsed: 0,
    solved: false,
    gaveUp: false,
  };
  save();
}

// ── Board ─────────────────────────────────────────────────────────────────────

function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      board.appendChild(cell);
    }
  }
}

function renderBoard() {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = getCell(r, c);
      cell.classList.remove('filled', 'ghost-ok', 'ghost-no', 'hint-pulse');
      cell.style.removeProperty('--fill');
      if (state.board[r][c] === 1) {
        cell.classList.add('filled');
        const colorIdx = state.cellColors[r][c] ?? 0;
        cell.style.setProperty('--fill', `var(--${COLORS[colorIdx]})`);
      }
    }
  }
}

function getCell(r, c) {
  return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

// ── Tray ──────────────────────────────────────────────────────────────────────

function renderTray() {
  const tray = document.getElementById('tray');
  tray.innerHTML = '';

  puzzle.queue.forEach((pieceName, i) => {
    const piece = PIECES[pieceName];
    const el = buildPieceEl(piece, i);
    if (i < state.pieceIndex) el.classList.add('placed');
    else if (i === state.pieceIndex) el.classList.add('current');
    else el.classList.add('upcoming');
    el.dataset.queueIdx = i;
    tray.appendChild(el);
  });
}

function buildPieceEl(piece, queueIdx) {
  const w = pieceWidth(piece);
  const h = pieceHeight(piece);
  const el = document.createElement('div');
  el.className = 'tray-piece';
  el.style.gridTemplateColumns = `repeat(${w}, auto)`;
  el.style.gridTemplateRows = `repeat(${h}, auto)`;

  const colorVar = COLORS[queueIdx % COLORS.length];
  const cellMap = new Set(piece.cells.map(c => `${c[0]},${c[1]}`));

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = document.createElement('div');
      cell.className = 'tray-cell';
      if (!cellMap.has(`${r},${c}`)) {
        cell.classList.add('empty');
      } else {
        cell.style.setProperty('--fill', `var(--${colorVar})`);
      }
      el.appendChild(cell);
    }
  }
  return el;
}

// ── Drag ──────────────────────────────────────────────────────────────────────

function attachDragHandlers() {
  const tray = document.getElementById('tray');
  tray.addEventListener('pointerdown', e => {
    const pieceEl = e.target.closest('.tray-piece.current');
    if (!pieceEl) return;
    if (state.solved || state.gaveUp) return;
    e.preventDefault();
    beginDrag(pieceEl, e);
  });
}

function beginDrag(pieceEl, e) {
  const piece = PIECES[puzzle.queue[state.pieceIndex]];
  const w = pieceWidth(piece);
  const h = pieceHeight(piece);

  pieceEl.classList.add('dragging');

  const ghost = document.createElement('div');
  ghost.id = 'drag-ghost';
  const cellSize = getBoardCellSize();
  ghost.style.gridTemplateColumns = `repeat(${w}, ${cellSize}px)`;
  ghost.style.gridTemplateRows = `repeat(${h}, ${cellSize}px)`;

  const colorVar = COLORS[state.pieceIndex % COLORS.length];
  const cellMap = new Set(piece.cells.map(c => `${c[0]},${c[1]}`));
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = document.createElement('div');
      if (cellMap.has(`${r},${c}`)) {
        cell.className = 'drag-cell';
        cell.style.setProperty('--fill', `var(--${colorVar})`);
        cell.style.width = cellSize + 'px';
        cell.style.height = cellSize + 'px';
      }
      ghost.appendChild(cell);
    }
  }

  document.body.appendChild(ghost);

  drag = {
    piece,
    pieceEl,
    ghost,
    cellSize,
    anchorOffset: [Math.floor(h / 2), Math.floor(w / 2)],
    targetRow: null,
    targetCol: null,
    legal: false,
  };

  positionGhost(e.clientX, e.clientY);
  updateBoardPreview(e.clientX, e.clientY);

  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragEnd);
  document.addEventListener('pointercancel', onDragEnd);
}

function positionGhost(x, y) {
  if (!drag) return;
  const { ghost, piece, cellSize, anchorOffset } = drag;
  const w = pieceWidth(piece);
  const h = pieceHeight(piece);
  const gap = 3;
  const totalW = w * cellSize + (w - 1) * gap;
  const totalH = h * cellSize + (h - 1) * gap;
  const anchorX = anchorOffset[1] * (cellSize + gap) + cellSize / 2;
  const anchorY = anchorOffset[0] * (cellSize + gap) + cellSize / 2;
  ghost.style.left = (x - anchorX) + 'px';
  ghost.style.top  = (y - anchorY) + 'px';
}

function updateBoardPreview(x, y) {
  if (!drag) return;
  clearGhostCells();

  const target = boardCellAt(x, y);
  if (!target) {
    drag.targetRow = null;
    drag.targetCol = null;
    drag.legal = false;
    return;
  }

  const { piece, anchorOffset } = drag;
  const topLeftRow = target.r - anchorOffset[0];
  const topLeftCol = target.c - anchorOffset[1];

  const fits = canPlace(state.board, piece, topLeftRow, topLeftCol);
  const clears = fits ? wouldClearLines(state.board, piece, topLeftRow, topLeftCol) : 0;
  const legal = fits && clears > 0;

  drag.targetRow = topLeftRow;
  drag.targetCol = topLeftCol;
  drag.legal = legal;

  const cls = legal ? 'ghost-ok' : (fits ? 'ghost-no' : null);
  if (!cls) return;
  for (const [dr, dc] of piece.cells) {
    const r = topLeftRow + dr;
    const c = topLeftCol + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
    const cell = getCell(r, c);
    if (cell && !cell.classList.contains('filled')) {
      cell.classList.add(cls);
    }
  }
}

function clearGhostCells() {
  document.querySelectorAll('.cell.ghost-ok, .cell.ghost-no').forEach(c => {
    c.classList.remove('ghost-ok', 'ghost-no');
  });
}

function boardCellAt(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el || !el.classList.contains('cell')) return null;
  return { r: parseInt(el.dataset.r), c: parseInt(el.dataset.c) };
}

function getBoardCellSize() {
  const cell = document.querySelector('.cell');
  return cell ? cell.getBoundingClientRect().width : 40;
}

function onDragMove(e) {
  if (!drag) return;
  positionGhost(e.clientX, e.clientY);
  updateBoardPreview(e.clientX, e.clientY);
}

function onDragEnd(e) {
  if (!drag) return;
  const { piece, pieceEl, ghost, targetRow, targetCol, legal } = drag;

  document.removeEventListener('pointermove', onDragMove);
  document.removeEventListener('pointerup', onDragEnd);
  document.removeEventListener('pointercancel', onDragEnd);

  clearGhostCells();
  ghost.remove();

  if (legal && targetRow !== null) {
    pieceEl.classList.remove('dragging');
    applyPlacement(piece, targetRow, targetCol);
  } else {
    pieceEl.classList.remove('dragging');
    pieceEl.classList.add('snap-back');
    setTimeout(() => pieceEl.classList.remove('snap-back'), 400);
  }

  drag = null;
}

// ── Placement / Validation ────────────────────────────────────────────────────

function canPlace(board, piece, row, col) {
  for (const [dr, dc] of piece.cells) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] === 1) return false;
  }
  return true;
}

function wouldClearLines(board, piece, row, col) {
  const sim = board.map(r => [...r]);
  for (const [dr, dc] of piece.cells) sim[row + dr][col + dc] = 1;

  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (sim[r].every(v => v === 1)) count++;
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (sim.every(row => row[c] === 1)) count++;
  }
  return count;
}

function findFullLines(board) {
  const rows = [];
  const cols = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(v => v === 1)) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every(row => row[c] === 1)) cols.push(c);
  }
  return { rows, cols };
}

function applyPlacement(piece, row, col) {
  const colorIdx = state.pieceIndex % COLORS.length;
  for (const [dr, dc] of piece.cells) {
    state.board[row + dr][col + dc] = 1;
    state.cellColors[row + dr][col + dc] = colorIdx;
  }

  state.placements.push({
    piece: piece.name,
    row, col,
    pieceIdx: state.pieceIndex,
  });

  renderBoard();

  const { rows, cols } = findFullLines(state.board);
  const cellsToClear = new Set();
  rows.forEach(r => { for (let c = 0; c < BOARD_SIZE; c++) cellsToClear.add(`${r},${c}`); });
  cols.forEach(c => { for (let r = 0; r < BOARD_SIZE; r++) cellsToClear.add(`${r},${c}`); });

  cellsToClear.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    const cell = getCell(r, c);
    if (cell) cell.classList.add('clearing');
  });

  state.totalCleared += rows.length + cols.length;
  state.pieceIndex++;

  setTimeout(() => {
    cellsToClear.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      state.board[r][c] = 0;
      state.cellColors[r][c] = null;
    });

    checkEndState();
    renderBoard();
    renderTray();
    renderStatus();
    save();

    if (state.solved) {
      renderEndPanel();
    } else if (state.pieceIndex >= puzzle.queue.length) {
      state.gaveUp = true;
      save();
      renderEndPanel();
    }
  }, 450);
}

function checkEndState() {
  if (state.pieceIndex < puzzle.queue.length) return;
  const isEmpty = state.board.every(row => row.every(v => v === 0));
  if (isEmpty) state.solved = true;
}

// ── Hint ──────────────────────────────────────────────────────────────────────

function useHint() {
  if (state.solved || state.gaveUp) return;
  if (state.pieceIndex >= puzzle.queue.length) return;

  const piece = PIECES[puzzle.queue[state.pieceIndex]];
  const spot = findValidSpot(state.board, piece);
  if (!spot) return;

  state.hintsUsed++;
  save();
  renderStatus();

  for (const [dr, dc] of piece.cells) {
    const r = spot.row + dr;
    const c = spot.col + dc;
    const cell = getCell(r, c);
    if (cell) cell.classList.add('hint-pulse');
  }
  setTimeout(() => {
    document.querySelectorAll('.hint-pulse').forEach(c => c.classList.remove('hint-pulse'));
  }, 3300);
}

function findValidSpot(board, piece) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, piece, r, c) && wouldClearLines(board, piece, r, c) > 0) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderAll() {
  renderBoard();
  renderTray();
  renderStatus();

  if (state.solved || state.gaveUp) renderEndPanel();
}

function renderStatus() {
  document.getElementById('cleared-count').textContent = state.totalCleared;
  document.getElementById('piece-progress').textContent =
    `${Math.min(state.pieceIndex, puzzle.queue.length)} / ${puzzle.queue.length}`;
  document.getElementById('score-count').textContent = computeScore();

  document.getElementById('hint-btn').disabled =
    state.solved || state.gaveUp || state.pieceIndex >= puzzle.queue.length;
}

function computeScore() {
  return state.totalCleared - state.hintsUsed * HINT_COST;
}

function renderEndPanel() {
  document.getElementById('end-panel').classList.remove('hidden');
  const result = document.getElementById('end-result');
  const score = computeScore();
  const hintNote = state.hintsUsed
    ? ` (−${state.hintsUsed} hint${state.hintsUsed !== 1 ? 's' : ''})`
    : '';

  if (state.solved) {
    result.innerHTML =
      `🎯 Board cleared<br>` +
      `<strong>${score} pts</strong>` +
      `<br><span style="font-size:0.75rem;color:var(--muted)">` +
      `${state.totalCleared} lines${hintNote}</span>`;
  } else {
    result.innerHTML =
      `Out of pieces<br>` +
      `<strong>${score} pts</strong>` +
      `<br><span style="font-size:0.75rem;color:var(--muted)">` +
      `${state.totalCleared} lines${hintNote}</span>`;
  }
  document.getElementById('play-again-btn').classList.remove('hidden');
}

// ── Share ─────────────────────────────────────────────────────────────────────

function buildShareText() {
  const header = `CASCADE #${String(puzzle.id).padStart(3, '0')}`;
  const score = computeScore();
  const hintNote = state.hintsUsed
    ? ` (−${state.hintsUsed} hint${state.hintsUsed !== 1 ? 's' : ''})`
    : '';
  const status = state.solved
    ? `🧱 ${state.totalCleared} lines${hintNote} = ${score} pts\n🎯 Board cleared`
    : `🧱 ${state.totalCleared} lines${hintNote} = ${score} pts`;

  const rows = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    let row = '';
    for (let c = 0; c < BOARD_SIZE; c++) {
      row += state.board[r][c] === 1 ? '🟦' : '⬜';
    }
    rows.push(row);
  }
  return [header, status, '', ...rows].join('\n');
}

// ── Persistence ───────────────────────────────────────────────────────────────

function save() {
  localStorage.setItem(`cascade-${state.date}`, JSON.stringify(state));
}

// ── Events ────────────────────────────────────────────────────────────────────

document.getElementById('hint-btn').addEventListener('click', useHint);

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Reset this puzzle?')) return;
  resetState();
  document.getElementById('end-panel').classList.add('hidden');
  document.getElementById('play-again-btn').classList.add('hidden');
  renderAll();
});

document.getElementById('share-btn').addEventListener('click', () => {
  const text = buildShareText();
  const msg = document.getElementById('copied-msg');
  const show = () => {
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2400);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(show).catch(() => fallbackCopy(text, show));
  } else {
    fallbackCopy(text, show);
  }
});

document.getElementById('play-again-btn').addEventListener('click', () => {
  resetState();
  document.getElementById('end-panel').classList.add('hidden');
  document.getElementById('play-again-btn').classList.add('hidden');
  renderAll();
});

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (_) {}
  document.body.removeChild(ta);
}

// ── Go ────────────────────────────────────────────────────────────────────────

init();
attachDragHandlers();
