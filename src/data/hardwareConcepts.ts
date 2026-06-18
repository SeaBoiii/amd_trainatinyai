import { HardwareConcept } from "../types";

export const hardwareConcepts: HardwareConcept[] = [
  {
    key: "CPU",
    title: "CPU",
    summary: "General-purpose brain of the app",
    role: "Runs user input, app logic, and coordinates AI steps."
  },
  {
    key: "GPU",
    title: "GPU",
    summary: "Parallel math specialist",
    role: "Great for many calculations at the same time, useful for training and graphics."
  },
  {
    key: "NPU",
    title: "NPU",
    summary: "Efficient AI engine",
    role: "Designed for AI inference tasks with lower power use."
  },
  {
    key: "Memory",
    title: "Memory",
    summary: "Fast working space",
    role: "Stores active data vectors and intermediate values while AI compares patterns."
  },
  {
    key: "Storage",
    title: "Storage",
    summary: "Long-term save zone",
    role: "Keeps models, examples, and result logs available between sessions."
  }
];
