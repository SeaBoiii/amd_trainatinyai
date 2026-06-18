import type { CareerMatch, SessionStats } from '../types';

export const CAREERS: Record<string, CareerMatch> = {
  ml_engineer: {
    id: 'ml_engineer',
    title: 'Machine Learning Engineer',
    emoji: '🛠️',
    blurb: 'You love feeding an AI lots of examples and building it up. That is exactly what ML engineers do.',
  },
  ai_researcher: {
    id: 'ai_researcher',
    title: 'AI Researcher',
    emoji: '🔬',
    blurb: 'You got your AI to be impressively accurate. Researchers explore how to make AI smarter.',
  },
  hardware_engineer: {
    id: 'hardware_engineer',
    title: 'AI Hardware Engineer',
    emoji: '⚙️',
    blurb: 'You dug into how chips power AI. Hardware engineers design the CPUs, GPUs, and AI engines that make it all run.',
  },
  data_scientist: {
    id: 'data_scientist',
    title: 'Data Scientist',
    emoji: '📊',
    blurb: 'You kept improving the AI by giving it better data. Data scientists turn data into smarter decisions.',
  },
  stem_innovator: {
    id: 'stem_innovator',
    title: 'STEM Innovator',
    emoji: '🚀',
    blurb: 'You explored lots of different missions. Innovators love trying many ideas to see what works.',
  },
};

/**
 * Picks a career based on how the visitor used the activity.
 * Priority order is chosen so the "most impressive" behaviour wins, while
 * always returning a friendly result.
 */
export function matchCareer(stats: SessionStats): CareerMatch {
  // Tried several missions -> innovator
  if (stats.missionsTried >= 2) {
    return CAREERS.stem_innovator;
  }
  // Used the improvement loop a lot -> data scientist
  if (stats.improvementsUsed >= 2) {
    return CAREERS.data_scientist;
  }
  // Explored hardware screen -> hardware engineer
  if (stats.exploredHardware) {
    return CAREERS.hardware_engineer;
  }
  // High accuracy with at least a few predictions -> researcher
  if (stats.accuracy >= 0.8 && stats.predictionsMade >= 2) {
    return CAREERS.ai_researcher;
  }
  // Default / lots of examples -> ML engineer
  return CAREERS.ml_engineer;
}
