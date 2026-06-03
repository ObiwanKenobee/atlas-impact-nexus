import solar from "@/assets/project-solar-water.jpg";
import coffee from "@/assets/project-coffee.jpg";
import education from "@/assets/project-education.jpg";

const map: Record<string, string> = { solar, coffee, education };

export function projectImage(key: string | null | undefined): string {
  if (!key) return solar;
  return map[key] ?? solar;
}
