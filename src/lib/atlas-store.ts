import { useSyncExternalStore } from "react";
import solarWater from "@/assets/project-solar-water.jpg";
import coffee from "@/assets/project-coffee.jpg";
import education from "@/assets/project-education.jpg";

export type EvidenceKind = "GPS" | "IoT" | "PHOTO" | "VIDEO" | "REPORT" | "BENEFICIARY";

export type Evidence = {
  id: string;
  kind: EvidenceKind;
  title: string;
  meta: string;
  projectId: string;
  communityId: string;
  time: string;
  weight: number; // 0-1 contribution to trust score
};

export type Beneficiary = {
  id: string;
  name: string;
  age: number;
  household: number;
  projectId: string;
  registered: string;
  acknowledged: boolean;
};

export type Project = {
  id: string;
  slug: string;
  image: string;
  category: string;
  title: string;
  location: string;
  communityId: string;
  desc: string;
  longDesc: string;
  raised: number;
  goal: number;
  verified: number; // 0-100
  beneficiaries: number;
  donors: number;
  startedAt: string;
};

export type Community = {
  id: string;
  slug: string;
  name: string;
  region: string;
  population: number;
  projects: number;
  score: number;
  needs: string;
  overview: string;
  economy: { livelihoods: string; medianIncome: number; cooperatives: number };
  environment: { climate: string; risks: string[]; mitigation: string };
  reports: { id: string; date: string; title: string; author: string }[];
};

type State = {
  projects: Project[];
  communities: Community[];
  evidence: Evidence[];
  beneficiaries: Beneficiary[];
};

const initialCommunities: Community[] = [
  {
    id: "c-lodwar",
    slug: "lodwar-basin",
    name: "Lodwar Basin",
    region: "Turkana, Kenya",
    population: 12400,
    projects: 4,
    score: 92,
    needs: "Water · Healthcare",
    overview:
      "A semi-arid basin community of pastoralists adapting to drought cycles. Atlas Sanctum has co-funded four water and health projects since 2024 alongside the Turkana County Council.",
    economy: { livelihoods: "Livestock · Fishing · Crafts", medianIncome: 1240, cooperatives: 6 },
    environment: { climate: "Arid · drought-prone", risks: ["Drought", "Borehole salinity"], mitigation: "Solar pumps, rain harvesting, salt-tolerant fodder" },
    reports: [
      { id: "r-lodwar-1", date: "2026-05-12", title: "Q2 verification audit", author: "KPMG East Africa" },
      { id: "r-lodwar-2", date: "2026-04-02", title: "Water yield assessment", author: "Field team" },
    ],
  },
  {
    id: "c-amani",
    slug: "amani-highlands",
    name: "Amani Highlands",
    region: "Chiapas, Mexico",
    population: 3200,
    projects: 2,
    score: 88,
    needs: "Trade · Education",
    overview:
      "An indigenous Tzotzil coffee-growing community working through a direct-trade cooperative. Focus areas are price stability and bilingual education.",
    economy: { livelihoods: "Coffee · Honey · Weaving", medianIncome: 2980, cooperatives: 3 },
    environment: { climate: "Tropical highland", risks: ["Coffee rust", "Soil erosion"], mitigation: "Shade-grown rotation, terracing" },
    reports: [{ id: "r-amani-1", date: "2026-05-20", title: "Harvest yield report", author: "Cooperativa Amani" }],
  },
  {
    id: "c-omo",
    slug: "omo-valley",
    name: "Omo Valley",
    region: "South Ethiopia",
    population: 8700,
    projects: 5,
    score: 81,
    needs: "Education · Food",
    overview: "Twelve agro-pastoralist villages along the Omo River. Education access has grown 34% since the Lumina classrooms opened.",
    economy: { livelihoods: "Sorghum · Cattle · Tourism", medianIncome: 1580, cooperatives: 4 },
    environment: { climate: "Semi-arid", risks: ["Flooding", "Dam-flow disruption"], mitigation: "Floodplain calendar, seed bank" },
    reports: [{ id: "r-omo-1", date: "2026-05-05", title: "Education outcomes Q2", author: "Lumina Initiative" }],
  },
  {
    id: "c-sundarbans",
    slug: "sundarbans-delta",
    name: "Sundarbans Delta",
    region: "West Bengal, India",
    population: 21500,
    projects: 6,
    score: 76,
    needs: "Climate · Health",
    overview: "A mangrove delta community on the front line of sea-level rise. Mangrove restoration buffers 40 hectares of coastline.",
    economy: { livelihoods: "Fishing · Honey · Aquaculture", medianIncome: 1820, cooperatives: 5 },
    environment: { climate: "Tropical coastal", risks: ["Cyclones", "Salinity intrusion"], mitigation: "Mangrove buffer, raised wells" },
    reports: [{ id: "r-sund-1", date: "2026-04-18", title: "Mangrove growth survey", author: "Field team" }],
  },
  {
    id: "c-tindouf",
    slug: "tindouf-camp",
    name: "Tindouf Camp",
    region: "Western Sahara",
    population: 14200,
    projects: 3,
    score: 84,
    needs: "Food · Shelter",
    overview: "Sahrawi refugee camps served by mobile maternal-care outposts. Atlas funds two outposts covering six camps.",
    economy: { livelihoods: "Aid · Crafts · Small trade", medianIncome: 720, cooperatives: 2 },
    environment: { climate: "Hyper-arid desert", risks: ["Heatwaves", "Water rationing"], mitigation: "Shaded outposts, solar cold-chain" },
    reports: [{ id: "r-tindouf-1", date: "2026-05-29", title: "Maternal care outcomes", author: "UNHCR liaison" }],
  },
  {
    id: "c-cabo",
    slug: "cabo-delgado",
    name: "Cabo Delgado",
    region: "Northern Mozambique",
    population: 9100,
    projects: 2,
    score: 71,
    needs: "Shelter · Health",
    overview: "Conflict-displaced communities receiving drought-resilient seed and shelter kits.",
    economy: { livelihoods: "Cassava · Cashew · Fishing", medianIncome: 980, cooperatives: 2 },
    environment: { climate: "Tropical · monsoon", risks: ["Monsoon delays", "Cyclones"], mitigation: "Seed bank, reinforced shelters" },
    reports: [{ id: "r-cabo-1", date: "2026-05-22", title: "Shelter distribution log", author: "Field team" }],
  },
];

const initialProjects: Project[] = [
  {
    id: "p-solar-water",
    slug: "solar-water-extraction",
    image: solarWater,
    category: "Water & Energy",
    title: "Solar Water Extraction",
    location: "Turkana, Kenya",
    communityId: "c-lodwar",
    desc: "12 solar wells for 2,500 beneficiaries.",
    longDesc:
      "Twelve solar-pump wells across the Lodwar Basin replacing diesel pumps. Each well serves ~210 people and reduces fuel costs by 96%. Sensor telemetry streams to the verification ledger every 15 minutes.",
    raised: 31000,
    goal: 50000,
    verified: 98,
    beneficiaries: 2500,
    donors: 184,
    startedAt: "2025-11-02",
  },
  {
    id: "p-coffee",
    slug: "amani-highland-coffee",
    image: coffee,
    category: "Economic",
    title: "Amani Highland Coffee",
    location: "Chiapas, Mexico",
    communityId: "c-amani",
    desc: "Direct-trade infrastructure for 180 families.",
    longDesc:
      "Funds a community wet-mill, drying patios and a digital traceability layer. Eliminates middlemen and lifts farm-gate price by 38%.",
    raised: 45000,
    goal: 60000,
    verified: 96,
    beneficiaries: 720,
    donors: 312,
    startedAt: "2025-09-14",
  },
  {
    id: "p-lumina",
    slug: "lumina-learning",
    image: education,
    category: "Education",
    title: "Lumina Learning Initiative",
    location: "Omo Valley, Ethiopia",
    communityId: "c-omo",
    desc: "12 community-led classrooms with solar lighting.",
    longDesc:
      "Twelve classrooms run by trained local educators, with solar lighting that extends study hours. Attendance has grown 34% in the first two terms.",
    raised: 22500,
    goal: 40000,
    verified: 94,
    beneficiaries: 2451,
    donors: 271,
    startedAt: "2025-10-20",
  },
  {
    id: "p-mangrove",
    slug: "mangrove-restoration",
    image: solarWater,
    category: "Climate",
    title: "Mangrove Restoration",
    location: "Sundarbans, India",
    communityId: "c-sundarbans",
    desc: "Re-plant 40 hectares of coastal mangrove buffer.",
    longDesc:
      "A community nursery raising 80,000 saplings and replanting eroded coastline. Survival rate verified at 79% via drone surveys.",
    raised: 18900,
    goal: 35000,
    verified: 91,
    beneficiaries: 5400,
    donors: 142,
    startedAt: "2026-01-08",
  },
  {
    id: "p-seedbank",
    slug: "cooperative-seed-bank",
    image: coffee,
    category: "Food Security",
    title: "Cooperative Seed Bank",
    location: "Cabo Delgado, MZ",
    communityId: "c-cabo",
    desc: "Drought-resilient seed distribution network.",
    longDesc: "A regional seed bank stocking 14 climate-resilient varieties, distributed through three community cooperatives.",
    raised: 12200,
    goal: 25000,
    verified: 89,
    beneficiaries: 1840,
    donors: 96,
    startedAt: "2026-02-11",
  },
  {
    id: "p-maternal",
    slug: "maternal-care-outpost",
    image: education,
    category: "Healthcare",
    title: "Maternal Care Outpost",
    location: "Tindouf, W. Sahara",
    communityId: "c-tindouf",
    desc: "Two staffed health outposts serving 6 camps.",
    longDesc: "Two prefab maternal-care outposts staffed with two midwives each, serving six refugee camps with a solar cold-chain.",
    raised: 38400,
    goal: 55000,
    verified: 95,
    beneficiaries: 3120,
    donors: 408,
    startedAt: "2025-08-30",
  },
];

const initialEvidence: Evidence[] = [
  { id: "e1", kind: "GPS", title: "Field team logged at Lodwar Well #4", meta: "2.341°N, 37.892°E", projectId: "p-solar-water", communityId: "c-lodwar", time: "2 min", weight: 0.28 },
  { id: "e2", kind: "IoT", title: "Soil hydration sensor: 92% (target 80%)", meta: "Amani Highlands", projectId: "p-coffee", communityId: "c-amani", time: "14 min", weight: 0.22 },
  { id: "e3", kind: "PHOTO", title: "Solar pump install verified", meta: "Turkana · 12 images", projectId: "p-solar-water", communityId: "c-lodwar", time: "1 hr", weight: 0.18 },
  { id: "e4", kind: "VIDEO", title: "Beneficiary testimony recorded", meta: "Omo Valley · 02:14", projectId: "p-lumina", communityId: "c-omo", time: "3 hr", weight: 0.15 },
  { id: "e5", kind: "REPORT", title: "Independent audit completed", meta: "Cabo Delgado · KPMG", projectId: "p-seedbank", communityId: "c-cabo", time: "Yesterday", weight: 0.24 },
  { id: "e6", kind: "GPS", title: "Aid delivery confirmed at outpost", meta: "Tindouf Camp B", projectId: "p-maternal", communityId: "c-tindouf", time: "Yesterday", weight: 0.26 },
  { id: "e7", kind: "BENEFICIARY", title: "112 beneficiaries acknowledged receipt", meta: "Sundarbans · WhatsApp confirmations", projectId: "p-mangrove", communityId: "c-sundarbans", time: "2 days", weight: 0.2 },
  { id: "e8", kind: "IoT", title: "Solar-pump throughput 4,210 L/day", meta: "Lodwar Well #7", projectId: "p-solar-water", communityId: "c-lodwar", time: "2 days", weight: 0.21 },
  { id: "e9", kind: "PHOTO", title: "Classroom completion photos", meta: "Omo Valley · 8 images", projectId: "p-lumina", communityId: "c-omo", time: "3 days", weight: 0.16 },
  { id: "e10", kind: "REPORT", title: "Mangrove survival 79% (drone survey)", meta: "Sundarbans", projectId: "p-mangrove", communityId: "c-sundarbans", time: "3 days", weight: 0.23 },
];

const initialBeneficiaries: Beneficiary[] = [
  { id: "b1", name: "Ekai L.", age: 34, household: 6, projectId: "p-solar-water", registered: "2025-11-08", acknowledged: true },
  { id: "b2", name: "Akiru N.", age: 42, household: 5, projectId: "p-solar-water", registered: "2025-11-09", acknowledged: true },
  { id: "b3", name: "Maria T.", age: 38, household: 4, projectId: "p-coffee", registered: "2025-09-22", acknowledged: true },
  { id: "b4", name: "Hewan A.", age: 9, household: 7, projectId: "p-lumina", registered: "2025-10-25", acknowledged: true },
  { id: "b5", name: "Banu R.", age: 51, household: 3, projectId: "p-mangrove", registered: "2026-01-12", acknowledged: false },
  { id: "b6", name: "Fatima S.", age: 28, household: 4, projectId: "p-maternal", registered: "2025-09-04", acknowledged: true },
];

let state: State = {
  projects: initialProjects,
  communities: initialCommunities,
  evidence: initialEvidence,
  beneficiaries: initialBeneficiaries,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export const atlasStore = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  fundProject(projectId: string, amount: number) {
    const projects = state.projects.map((p) => {
      if (p.id !== projectId) return p;
      const raised = Math.min(p.goal, p.raised + amount);
      const newBeneficiaries = p.beneficiaries + Math.round(amount / 20);
      return { ...p, raised, donors: p.donors + 1, beneficiaries: newBeneficiaries };
    });
    const project = projects.find((p) => p.id === projectId)!;
    const newEvidence: Evidence = {
      id: `e-${Date.now()}`,
      kind: "REPORT",
      title: `New donation of $${amount.toLocaleString()} received`,
      meta: `${project.title} · ledger entry`,
      projectId,
      communityId: project.communityId,
      time: "just now",
      weight: 0.05,
    };
    state = { ...state, projects, evidence: [newEvidence, ...state.evidence] };
    emit();
  },
};

export function useAtlas<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    atlasStore.subscribe,
    () => selector(atlasStore.get()),
    () => selector(atlasStore.get()),
  );
}
