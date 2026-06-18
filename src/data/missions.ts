import { Mission } from "../types";

export const missions: Mission[] = [
  {
    id: "shape-sorter",
    name: "Shape Sorter",
    icon: "🔺",
    description: "Teach the AI to recognise simple hand-drawn shapes.",
    labels: ["Circle", "Triangle", "Square", "Star"],
    difficulty: "Easy",
    estTimeMinutes: 2,
    recommended: true
  },
  {
    id: "space-signal",
    name: "Space Signal Detector",
    icon: "🚀",
    description: "Train your model to identify interstellar sketch signals.",
    labels: ["Planet", "Rocket", "Star", "Alien"],
    difficulty: "Medium",
    estTimeMinutes: 3
  },
  {
    id: "recycling-helper",
    name: "Recycling Helper",
    icon: "♻️",
    description: "Help an eco-AI sort doodles into waste categories.",
    labels: ["Bottle", "Can", "Paper", "Food Waste"],
    difficulty: "Medium",
    estTimeMinutes: 3
  },
  {
    id: "emotion-doodle",
    name: "Emotion Doodle AI",
    icon: "😊",
    description: "Teach emotional expression from quick face doodles.",
    labels: ["Happy", "Sad", "Angry", "Surprised"],
    difficulty: "Challenging",
    estTimeMinutes: 4
  },
  {
    id: "stem-symbol",
    name: "STEM Symbol Detector",
    icon: "⚙️",
    description: "Classify symbols from engineering and coding sketches.",
    labels: ["Chip", "Robot", "Lightning", "Code"],
    difficulty: "Medium",
    estTimeMinutes: 3
  }
];
