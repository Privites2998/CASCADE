// Piece cells are [row, col] offsets from the piece's top-left anchor.
// Pieces never rotate — orientation is fixed.

const PIECES = {
  "1x1": {
    name: "1x1",
    cells: [[0, 0]]
  },
  "1x2": {
    name: "1x2",
    cells: [[0, 0], [0, 1]]
  },
  "1x3": {
    name: "1x3",
    cells: [[0, 0], [0, 1], [0, 2]]
  },
  "1x4": {
    name: "1x4",
    cells: [[0, 0], [0, 1], [0, 2], [0, 3]]
  },
  "O": {
    name: "O",
    cells: [[0, 0], [0, 1], [1, 0], [1, 1]]
  },
  "T": {
    name: "T",
    cells: [[0, 0], [0, 1], [0, 2], [1, 1]]
  },
  "L": {
    name: "L",
    cells: [[0, 0], [1, 0], [2, 0], [2, 1]]
  },
  "I": {
    name: "I",
    cells: [[0, 0], [1, 0], [2, 0], [3, 0]]
  }
};

function pieceWidth(piece) {
  return Math.max(...piece.cells.map(c => c[1])) + 1;
}

function pieceHeight(piece) {
  return Math.max(...piece.cells.map(c => c[0])) + 1;
}
