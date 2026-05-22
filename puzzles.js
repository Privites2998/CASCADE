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
  }
];
