import type { Mission } from '../types';

/**
 * Pre-built booth missions. "Shape Sorter" is the recommended default because
 * the shapes are visually distinct and easy to draw, which gives the KNN
 * classifier the best chance of a satisfying result in under a minute.
 */
export const MISSIONS: Mission[] = [
  {
    id: 'shapes',
    name: 'Shape Sorter',
    emoji: '🔺',
    description: 'Teach the AI to recognise simple hand-drawn shapes.',
    labels: [
      { id: 'circle', name: 'Circle', emoji: '⭕' },
      { id: 'triangle', name: 'Triangle', emoji: '🔺' },
      { id: 'square', name: 'Square', emoji: '⬛' },
      { id: 'star', name: 'Star', emoji: '⭐' },
    ],
    difficulty: 'Easy',
    estimatedTime: '2 min',
    recommended: true,
    accent: 'from-amd-red to-amd-orange',
    inputType: 'draw',
  },
  {
    id: 'color',
    name: 'Color Mixer Lab',
    emoji: '🎨',
    description: 'Mix red, green and blue light, then teach the AI colour families.',
    inputType: 'sliders',
    preview: 'color',
    features: [
      { id: 'red', name: 'Red light', emoji: '🔴', min: 0, max: 255, default: 128, lowLabel: 'None', highLabel: 'Max' },
      { id: 'green', name: 'Green light', emoji: '🟢', min: 0, max: 255, default: 128, lowLabel: 'None', highLabel: 'Max' },
      { id: 'blue', name: 'Blue light', emoji: '🔵', min: 0, max: 255, default: 128, lowLabel: 'None', highLabel: 'Max' },
    ],
    labels: [
      { id: 'reds', name: 'Reds', emoji: '🟥' },
      { id: 'greens', name: 'Greens', emoji: '🟩' },
      { id: 'blues', name: 'Blues', emoji: '🟦' },
      { id: 'yellows', name: 'Yellows', emoji: '🟨' },
    ],
    difficulty: 'Easy',
    estimatedTime: '2 min',
    accent: 'from-fuchsia-500 to-amd-orange',
  },
  {
    id: 'space',
    name: 'Space Signal Detector',
    emoji: '🚀',
    description: 'Train the AI to spot objects from a space mission.',
    labels: [
      { id: 'planet', name: 'Planet', emoji: '🪐' },
      { id: 'rocket', name: 'Rocket', emoji: '🚀' },
      { id: 'star', name: 'Star', emoji: '⭐' },
      { id: 'alien', name: 'Alien', emoji: '👽' },
    ],
    difficulty: 'Medium',
    estimatedTime: '3 min',
    accent: 'from-indigo-500 to-amd-orange',
    inputType: 'draw',
  },
  {
    id: 'recycle',
    name: 'Recycling Helper',
    emoji: '♻️',
    description: 'Help the AI learn which items go in which bin.',
    labels: [
      { id: 'bottle', name: 'Bottle', emoji: '🍾' },
      { id: 'can', name: 'Can', emoji: '🥫' },
      { id: 'paper', name: 'Paper', emoji: '📄' },
      { id: 'food', name: 'Food Waste', emoji: '🍎' },
    ],
    difficulty: 'Medium',
    estimatedTime: '3 min',
    accent: 'from-emerald-500 to-amd-amber',
    inputType: 'draw',
  },
  {
    id: 'fruit',
    name: 'Fruit Sorter',
    emoji: '🍓',
    description: 'Set each fruit’s size, sweetness and colour, then teach the AI to sort them.',
    inputType: 'sliders',
    preview: 'bars',
    features: [
      { id: 'size', name: 'Size', emoji: '📏', min: 0, max: 10, default: 5, lowLabel: 'Tiny', highLabel: 'Big' },
      { id: 'sweet', name: 'Sweetness', emoji: '🍯', min: 0, max: 10, default: 5, lowLabel: 'Sour', highLabel: 'Sweet' },
      { id: 'red', name: 'Colour', emoji: '🎨', min: 0, max: 10, default: 5, lowLabel: 'Green', highLabel: 'Red' },
    ],
    labels: [
      { id: 'apple', name: 'Apple', emoji: '🍎' },
      { id: 'banana', name: 'Banana', emoji: '🍌' },
      { id: 'strawberry', name: 'Strawberry', emoji: '🍓' },
      { id: 'lime', name: 'Lime', emoji: '🟢' },
    ],
    difficulty: 'Medium',
    estimatedTime: '3 min',
    accent: 'from-rose-500 to-amd-amber',
  },
  {
    id: 'emotion',
    name: 'Emotion Doodle AI',
    emoji: '🙂',
    description: 'Draw faces and teach the AI to read feelings.',
    labels: [
      { id: 'happy', name: 'Happy', emoji: '😀' },
      { id: 'sad', name: 'Sad', emoji: '😢' },
      { id: 'angry', name: 'Angry', emoji: '😠' },
      { id: 'surprised', name: 'Surprised', emoji: '😮' },
    ],
    difficulty: 'Hard',
    estimatedTime: '4 min',
    accent: 'from-pink-500 to-amd-red',
    inputType: 'draw',
  },
  {
    id: 'stem',
    name: 'STEM Symbol Detector',
    emoji: '🤖',
    description: 'Teach the AI to recognise fun tech symbols.',
    labels: [
      { id: 'chip', name: 'Chip', emoji: '🔲' },
      { id: 'robot', name: 'Robot', emoji: '🤖' },
      { id: 'lightning', name: 'Lightning', emoji: '⚡' },
      { id: 'code', name: 'Code', emoji: '💻' },
    ],
    difficulty: 'Medium',
    estimatedTime: '3 min',
    accent: 'from-cyan-500 to-amd-orange',
    inputType: 'draw',
  },
];

/** The default mission used for the booth demo. */
export const DEFAULT_MISSION_ID = 'shapes';

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}
