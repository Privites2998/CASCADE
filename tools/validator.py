#!/usr/bin/env python3
"""
CASCADE puzzle validator.

Brute-forces every legal placement sequence for each puzzle in ../puzzles.js
and reports:
  - whether the puzzle is solvable (any sequence empties the board)
  - the optimal (maximum) total lines cleared = the best score achievable
  - whether the declared optimalScore matches the computed one

The "every placement must clear at least one line" constraint is enforced at
each recursion step, which prunes the search tree heavily — without it, brute
force would be 64^8 ≈ 280 trillion placements; with it, the 5 MVP puzzles
finish in milliseconds.

Usage:
  python tools/validator.py             # validate all puzzles
  python tools/validator.py <puzzle_id> # validate one puzzle by id

Exit code 0 if all good, 1 if any puzzle is unsolvable or has a mismatched
optimalScore. Useful for CI.
"""

import json
import subprocess
import sys
from pathlib import Path

# Windows consoles default to cp1252 — force UTF-8 so the ✓/✗/⚠ glyphs print.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, Exception):
    pass

# Piece definitions mirror pieces.js. Cells are (row, col) offsets from the
# piece's top-left anchor. Pieces never rotate.
PIECES = {
    "1x1": [(0, 0)],
    "1x2": [(0, 0), (0, 1)],
    "1x3": [(0, 0), (0, 1), (0, 2)],
    "1x4": [(0, 0), (0, 1), (0, 2), (0, 3)],
    "O":   [(0, 0), (0, 1), (1, 0), (1, 1)],
    "T":   [(0, 0), (0, 1), (0, 2), (1, 1)],
    "L":   [(0, 0), (1, 0), (2, 0), (2, 1)],
    "I":   [(0, 0), (1, 0), (2, 0), (3, 0)],
}

BOARD_SIZE = 8


def piece_dims(cells):
    h = max(r for r, _ in cells) + 1
    w = max(c for _, c in cells) + 1
    return h, w


def load_puzzles():
    """Read puzzles.js by piping it through Node and dumping JSON."""
    puzzles_path = Path(__file__).resolve().parent.parent / "puzzles.js"
    js = puzzles_path.read_text(encoding="utf-8")
    proc = subprocess.run(
        ["node", "-e", js + "; process.stdout.write(JSON.stringify(PUZZLES));"],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        print("Failed to load puzzles.js via Node:", proc.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(proc.stdout)


def parse_board(rows):
    return [[1 if ch == "1" else 0 for ch in row] for row in rows]


def can_place(board, cells, row, col):
    for dr, dc in cells:
        r, c = row + dr, col + dc
        if r < 0 or r >= BOARD_SIZE or c < 0 or c >= BOARD_SIZE:
            return False
        if board[r][c] == 1:
            return False
    return True


def apply_and_clear(board, cells, row, col):
    """Return (new_board, lines_cleared)."""
    new_board = [r[:] for r in board]
    for dr, dc in cells:
        new_board[row + dr][col + dc] = 1

    cleared_rows = [
        r for r in range(BOARD_SIZE) if all(v == 1 for v in new_board[r])
    ]
    cleared_cols = [
        c for c in range(BOARD_SIZE)
        if all(new_board[r][c] == 1 for r in range(BOARD_SIZE))
    ]

    for r in cleared_rows:
        for c in range(BOARD_SIZE):
            new_board[r][c] = 0
    for c in cleared_cols:
        for r in range(BOARD_SIZE):
            new_board[r][c] = 0

    return new_board, len(cleared_rows) + len(cleared_cols)


def board_is_empty(board):
    return all(v == 0 for row in board for v in row)


def solve(board, queue, piece_idx=0, score=0):
    """
    Returns the maximum total lines cleared across all legal placement
    sequences that end with an empty board, or None if no such sequence exists.
    """
    if piece_idx >= len(queue):
        return score if board_is_empty(board) else None

    cells = PIECES[queue[piece_idx]]
    h, w = piece_dims(cells)

    best = None
    for row in range(BOARD_SIZE - h + 1):
        for col in range(BOARD_SIZE - w + 1):
            if not can_place(board, cells, row, col):
                continue
            new_board, cleared = apply_and_clear(board, cells, row, col)
            if cleared == 0:
                # Legality constraint: every placement must clear ≥1 line.
                continue
            result = solve(new_board, queue, piece_idx + 1, score + cleared)
            if result is not None and (best is None or result > best):
                best = result

    return best


def validate_puzzle(puzzle):
    board = parse_board(puzzle["startingBoard"])
    queue = puzzle["queue"]
    declared = puzzle.get("optimalScore")
    optimal = solve(board, queue)
    return {
        "id": puzzle["id"],
        "name": puzzle["name"],
        "pieces": len(queue),
        "solvable": optimal is not None,
        "optimal": optimal,
        "declared": declared,
        "matches": optimal == declared,
    }


def fmt(r):
    if not r["solvable"]:
        return f"  ✗ #{r['id']:>3}  {r['name']!r:<22} {r['pieces']} piece(s) — UNSOLVABLE"
    mark = "✓" if r["matches"] else "⚠"
    suffix = ""
    if not r["matches"]:
        suffix = f"  (declared optimalScore={r['declared']}, computed={r['optimal']})"
    return f"  {mark} #{r['id']:>3}  {r['name']!r:<22} {r['pieces']} piece(s)  optimal={r['optimal']}{suffix}"


def main():
    puzzles = load_puzzles()

    filter_id = None
    if len(sys.argv) > 1:
        try:
            filter_id = int(sys.argv[1])
        except ValueError:
            print(f"Invalid puzzle id: {sys.argv[1]}", file=sys.stderr)
            sys.exit(2)

    targets = (
        [p for p in puzzles if p["id"] == filter_id]
        if filter_id is not None else puzzles
    )
    if not targets:
        print(f"No puzzle found with id {filter_id}.", file=sys.stderr)
        sys.exit(2)

    print(f"Validating {len(targets)} CASCADE puzzle(s)...\n")

    results = [validate_puzzle(p) for p in targets]
    for r in results:
        print(fmt(r))

    unsolvable = [r for r in results if not r["solvable"]]
    mismatched = [r for r in results if r["solvable"] and not r["matches"]]

    print()
    if not unsolvable and not mismatched:
        print(f"All {len(results)} puzzle(s) validated successfully.")
        sys.exit(0)

    if unsolvable:
        print(f"⚠ {len(unsolvable)} unsolvable puzzle(s).")
    if mismatched:
        print(f"⚠ {len(mismatched)} puzzle(s) with mismatched optimalScore.")
    sys.exit(1)


if __name__ == "__main__":
    main()
