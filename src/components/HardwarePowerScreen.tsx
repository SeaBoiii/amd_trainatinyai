import { HardwareConcept } from "../types";

interface HardwarePowerScreenProps {
  concepts: HardwareConcept[];
  onContinue: () => void;
}

export function HardwarePowerScreen({ concepts, onContinue }: HardwarePowerScreenProps) {
  const race = [
    { label: "CPU", width: "55%", note: "Good for general logic" },
    { label: "GPU", width: "86%", note: "Great for parallel calculations" },
    { label: "NPU", width: "78%", note: "Efficient for AI inference" }
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-3xl font-bold">AI Needs Hardware</h2>
        <button className="btn-primary" onClick={onContinue}>
          Generate Result Card
        </button>
      </div>

      <div className="panel p-5">
        <p className="text-lg text-white/90">
          Powered by Compute: Modern AI systems rely on CPUs, GPUs, memory, storage, and dedicated AI engines.
        </p>
        <p className="mt-2 text-sm text-white/75">
          This is an AMD-inspired compute demo. Modern AMD technologies combine CPUs, GPUs, and AI engines to help AI applications run faster and more efficiently.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {concepts.map((concept) => (
          <div key={concept.key} className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-ember-200">{concept.title}</p>
            <p className="mt-2 text-lg font-semibold">{concept.summary}</p>
            <p className="mt-2 text-sm text-white/75">{concept.role}</p>
          </div>
        ))}
      </div>

      <div className="panel p-5">
        <h3 className="font-display text-2xl font-semibold">AI Workload Race</h3>
        <p className="mt-1 text-sm text-white/70">
          Conceptual demo only. No exact performance claims.
        </p>
        <div className="mt-4 space-y-3">
          {race.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-white/70">{item.note}</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div className="h-3 rounded-full bg-gradient-to-r from-ember-500 via-orange-300 to-yellow-200" style={{ width: item.width }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ember-100">
          When you tested your drawing, the AI compared many numbers. GPUs and NPUs are useful because AI often needs lots of calculations at once.
        </p>
      </div>
    </section>
  );
}
