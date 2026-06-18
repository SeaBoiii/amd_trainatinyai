import { CareerMatch } from "../types";

export interface CareerSignals {
  examplesTaught: number;
  accuracy: number;
  viewedHardware: boolean;
  improvementCount: number;
  missionsTried: number;
}

export function getCareerMatch(signals: CareerSignals): CareerMatch {
  if (signals.missionsTried >= 2) {
    return "STEM Innovator";
  }

  if (signals.viewedHardware) {
    return "AI Hardware Engineer";
  }

  if (signals.improvementCount >= 2) {
    return "Data Scientist";
  }

  if (signals.accuracy >= 85) {
    return "AI Researcher";
  }

  if (signals.examplesTaught >= 16) {
    return "Machine Learning Engineer";
  }

  return "Machine Learning Engineer";
}
