import { createFileRoute } from "@tanstack/react-router";
import { Camera, CheckCircle2, FileText, MapPin, Radio, Video } from "lucide-react";
import { PageShell, PageHeader } from "@/components/PageShell";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Verification — Atlas Sanctum" },
      { name: "description", content: "GPS, IoT, photo, video and field-report evidence powering every verification score." },
      { property: "og:title", content: "Atlas Sanctum · Impact Verification" },
      { property: "og:description", content: "GPS, IoT, photo, video and field-report evidence powering every verification score." },
    ],
  }),
  component: Impact,
});

const feed = [
  { icon: MapPin, type: "GPS", title: "Field team logged at Lodwar Well #4", meta: "2.341°N, 37.892°E", time: "2 min", color: "moss" },
  { icon: Radio, type: "IoT", title: "Soil hydration sensor: 92% (target 80%)", meta: "Chiapas Highlands", time: "14 min", color: "moss" },
  { icon: Camera, type: "PHOTO", title: "Solar pump install verified", meta: "Turkana · 12 images", time: "1 hr", color: "earth" },
  { icon: Video, type: "VIDEO", title: "Beneficiary testimony recorded", meta: "Omo Valley · 02:14", time: "3 hr", color: "earth" },
  { icon: FileText, type: "REPORT", title: "Independent audit completed", meta: "Cabo Delgado · KPMG", time: "Yesterday", color: "moss" },
  { icon: MapPin, type: "GPS", title: "Aid delivery confirmed at outpost", meta: "Tindouf Camp B", time: "Yesterday", color: "moss" },
];

const sources = [
  { label: "GPS Confirmations", value: 412, weight: 28 },
  { label: "Beneficiary Acknowledgements", value: 3104, weight: 26 },
  { label: "IoT Sensor Readings", value: 18920, weight: 22 },
  { label: "Independent Audits", value: 34, weight: 24 },
];

function Impact() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Verification Dashboard"
        title="Proof, not promises."
        description="A continuous feed of evidence from the field, weighted into a single project trust score."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Evidence feed */}
          <div className="rounded-2xl bg-card ring-1 ring-ink/5">
            <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                Evidence Stream · Live
              </p>
              <span className="flex items-center gap-2 font-mono text-[11px] text-moss">
                <span className="size-1.5 rounded-full bg-moss" />
                34 new today
              </span>
            </div>
            <ul className="divide-y divide-ink/5">
              {feed.map((e, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-5">
                  <div
                    className={`grid size-10 place-items-center rounded-xl ${
                      e.color === "moss" ? "bg-moss-soft text-moss" : "bg-earth-soft text-earth"
                    }`}
                  >
                    <e.icon className="size-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-semibold tracking-widest ${
                          e.color === "moss" ? "text-moss" : "text-earth"
                        }`}
                      >
                        {e.type}
                      </span>
                      <span className="text-sm font-medium">{e.title}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-ink/45">{e.meta}</p>
                  </div>
                  <span className="font-mono text-[11px] text-ink/40">{e.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust score */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-ink p-8 text-sand ring-1 ring-ink/5">
              <p className="font-mono text-xs uppercase tracking-widest text-sand/50">
                Project Trust Score
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="font-serif text-7xl font-medium tabular-nums">95</span>
                <span className="mb-3 font-mono text-sm text-moss">%</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-sand/70">
                <CheckCircle2 className="size-4 text-moss" />
                Verified across all evidence channels
              </div>
              <div className="my-6 h-px bg-sand/10" />
              <ul className="space-y-4">
                {sources.map((s) => (
                  <li key={s.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-sand/70">{s.label}</span>
                      <span className="font-mono text-[11px] text-sand/50">
                        weight {s.weight}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-sand/10">
                      <div
                        className="h-full rounded-full bg-moss"
                        style={{ width: `${s.weight * 3.5}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-sand/40">
                      {s.value.toLocaleString()} datapoints
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
