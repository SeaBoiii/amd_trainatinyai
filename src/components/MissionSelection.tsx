import { Mission } from "../types";

interface MissionSelectionProps {
  missions: Mission[];
  onSelect: (mission: Mission) => void;
  onBack: () => void;
}

export function MissionSelection({ missions, onSelect, onBack }: MissionSelectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold">Choose Your AI Mission</h2>
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {missions.map((mission) => (
          <button
            key={mission.id}
            onClick={() => onSelect(mission)}
            className="panel group p-5 text-left transition hover:border-ember-300 hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl">{mission.icon}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">{mission.name}</h3>
              </div>
              {mission.recommended ? (
                <span className="rounded-full border border-ember-200/50 bg-ember-500/10 px-2 py-1 text-xs text-ember-200">
                  Recommended for booth demo
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-sm text-white/75">{mission.description}</p>
            <p className="mt-3 text-sm text-ember-200">Labels: {mission.labels.join(", ")}</p>
            <p className="mt-2 text-xs text-white/70">Difficulty: {mission.difficulty} | Time: {mission.estTimeMinutes} minutes</p>
          </button>
        ))}
      </div>
    </section>
  );
}
