import type { HardwareConcept } from '../types';

/**
 * Beginner-friendly explanations of how different compute pieces help AI.
 * The raceFill values are conceptual illustrations for the "AI Workload Race"
 * visual only. They are NOT benchmarks or performance claims.
 */
export const HARDWARE_CONCEPTS: HardwareConcept[] = [
  {
    id: 'cpu',
    name: 'CPU',
    short: 'The all-rounder',
    emoji: '🧠',
    description:
      'The CPU handles general instructions and app logic. It is great at doing many different kinds of tasks, one careful step at a time.',
    raceRole: 'Good for general logic',
    raceFill: 55,
    color: '#FFA500',
  },
  {
    id: 'gpu',
    name: 'GPU',
    short: 'The parallel powerhouse',
    emoji: '🎮',
    description:
      'The GPU runs many calculations in parallel. AI often needs to crunch lots of numbers at once, and a GPU can do thousands of them together.',
    raceRole: 'Great for parallel calculations',
    raceFill: 92,
    color: '#ED1C24',
  },
  {
    id: 'npu',
    name: 'NPU',
    short: 'The efficient AI engine',
    emoji: '⚡',
    description:
      'The NPU (Neural Processing Unit) runs AI tasks efficiently while using less power. It is built specially for the kind of maths AI uses.',
    raceRole: 'Efficient for AI inference',
    raceFill: 78,
    color: '#FF6B00',
  },
  {
    id: 'memory',
    name: 'Memory',
    short: 'The fast workspace',
    emoji: '📦',
    description:
      'Memory (RAM) holds data while the AI works. The more examples and numbers the AI juggles, the more it relies on fast memory.',
    raceRole: 'Holds data while the AI thinks',
    raceFill: 60,
    color: '#22D3EE',
  },
  {
    id: 'storage',
    name: 'Storage',
    short: 'The long-term keeper',
    emoji: '💾',
    description:
      'Storage saves models and examples so they are still there after you turn the device off. Your trained AI can be loaded again later.',
    raceRole: 'Saves models and examples',
    raceFill: 40,
    color: '#A78BFA',
  },
];

/** Components shown in the "AI Workload Race" animated bars. */
export const RACE_CONCEPTS = HARDWARE_CONCEPTS.filter((c) =>
  ['cpu', 'gpu', 'npu'].includes(c.id),
);
