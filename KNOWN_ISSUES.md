# Known Issues — v0.1

Tracked limitations of the MVP. Not blockers for launch; logged here so they're not silently rediscovered.

## Input
- **No keyboard support.** All piece placement is pointer/touch only. Tab/arrow/enter do nothing. Adding keyboard nav is non-trivial because the drag-ghost positioning is tied to pointer coordinates.
- **No undo.** Placed pieces are committed. The RESET button restarts the whole puzzle.
- **No piece reordering.** Pieces in the queue must be played in fixed order.

## Accessibility
- No ARIA labels on board cells, tray pieces, or status counters.
- Color is the only signal for ghost-OK vs ghost-NO (green/red); no shape/icon fallback for colorblind players.
- Hint pulse animation has no `prefers-reduced-motion` guard.

## Mobile / touch
- Long-press to begin drag isn't implemented — drag starts on the first `pointerdown`, which can mis-fire when scrolling near the tray.
- No haptic feedback on placement or clear.

## Content / progression
- Only 16 puzzles. No archive, no daily rotation logic yet.
- Difficulty labels (1–3) are author-tagged, not validated against solve time or branch factor.

## Tooling
- `tools/validator.py` brute-forces placements with a "must clear ≥1 line" prune. For long queues (5+) on mostly-empty boards, runtime grows fast — fine for current puzzles, would need memoization for harder sets.
