const PUZZLES = [
  {
    id: 1,
    name: "First Clear",
    difficulty: 1,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11110111"
    ],
    queue: ["1x1"],
    optimalScore: 1
  },
  {
    id: 2,
    name: "Two Steps",
    difficulty: 1,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11111110",
      "01111111"
    ],
    queue: ["1x1", "1x1"],
    optimalScore: 2
  },
  {
    id: 3,
    name: "Three Lines",
    difficulty: 2,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11110001",
      "11000111",
      "00111111"
    ],
    queue: ["1x2", "1x3", "1x3"],
    optimalScore: 3
  },
  {
    id: 4,
    name: "Mega Clear",
    difficulty: 3,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "01111111",
      "01111111",
      "01111111",
      "01111111"
    ],
    queue: ["I"],
    optimalScore: 4
  },
  {
    id: 5,
    name: "Cascade",
    difficulty: 3,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11111100",
      "11111100",
      "00001111",
      "00001111"
    ],
    queue: ["O", "1x4", "1x4"],
    optimalScore: 4
  },
  {
    id: 6,
    name: "Twin Drop",
    difficulty: 1,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11111100",
      "11111100"
    ],
    queue: ["1x2", "1x2"],
    optimalScore: 2
  },
  {
    id: 7,
    name: "Triple Tower",
    difficulty: 1,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11110000",
      "00001111",
      "11110000"
    ],
    queue: ["1x4", "1x4", "1x4"],
    optimalScore: 3
  },
  {
    id: 8,
    name: "Double Down",
    difficulty: 2,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00111111",
      "00111111"
    ],
    queue: ["O"],
    optimalScore: 2
  },
  {
    id: 9,
    name: "Junction",
    difficulty: 2,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11000111",
      "11101111"
    ],
    queue: ["T"],
    optimalScore: 2
  },
  {
    id: 10,
    name: "Hook",
    difficulty: 2,
    startingBoard: [
      "10000000",
      "10000000",
      "10000000",
      "10000000",
      "10000000",
      "00000000",
      "00000000",
      "00111111"
    ],
    queue: ["L"],
    optimalScore: 2
  },
  {
    id: 11,
    name: "Twin Pillars",
    difficulty: 2,
    startingBoard: [
      "10000001",
      "10000001",
      "10000001",
      "10000001",
      "00000000",
      "00000000",
      "00000000",
      "00000000"
    ],
    queue: ["I", "I"],
    optimalScore: 2
  },
  {
    id: 12,
    name: "Crosshairs",
    difficulty: 3,
    startingBoard: [
      "00001000",
      "00001000",
      "00001000",
      "00001000",
      "00001000",
      "00001000",
      "00001000",
      "11110111"
    ],
    queue: ["1x1"],
    optimalScore: 2
  },
  {
    id: 13,
    name: "Quad Strike",
    difficulty: 3,
    startingBoard: [
      "00011000",
      "00011000",
      "00011000",
      "11100111",
      "11100111",
      "00011000",
      "00011000",
      "00011000"
    ],
    queue: ["O"],
    optimalScore: 4
  },
  {
    id: 14,
    name: "Cascade Triple",
    difficulty: 2,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11111100",
      "00111111",
      "11111100"
    ],
    queue: ["1x2", "1x2", "1x2"],
    optimalScore: 3
  },
  {
    id: 15,
    name: "Quad Row",
    difficulty: 2,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "11110000",
      "00001111",
      "11110000",
      "00001111"
    ],
    queue: ["1x4", "1x4", "1x4", "1x4"],
    optimalScore: 4
  },
  {
    id: 16,
    name: "Box Bridge",
    difficulty: 3,
    startingBoard: [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00001111",
      "00111111",
      "00111111"
    ],
    queue: ["O", "1x4"],
    optimalScore: 3
  }
];
