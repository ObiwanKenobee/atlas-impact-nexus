export type EvidenceKind = "GPS" | "IoT" | "PHOTO" | "VIDEO" | "REPORT" | "BENEFICIARY";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  community_id: string;
  location: string;
  description: string;
  long_description: string | null;
  image_key: string | null;
  goal_cents: number;
  raised_cents: number;
  donors: number;
  beneficiaries: number;
  verified_score: number;
  started_at: string | null;
  created_at: string;
};

export type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  region: string;
  population: number;
  score: number;
  needs: string | null;
  overview: string | null;
  economy: { livelihoods?: string; medianIncome?: number; cooperatives?: number };
  environment: { climate?: string; risks?: string[]; mitigation?: string };
  reports: Array<{ id: string; date: string; title: string; author: string }>;
};

export type EvidenceRow = {
  id: string;
  project_id: string;
  uploader_id: string | null;
  kind: EvidenceKind;
  title: string;
  meta: string | null;
  lat: number | null;
  lng: number | null;
  media_url: string | null;
  iot_payload: JsonValue | null;
  media_signed_url?: string | null;
  report_text: string | null;
  captured_at: string;
  created_at: string;
};

export type TransactionRow = {
  id: string;
  project_id: string;
  donor_id: string | null;
  donor_name: string | null;
  amount_cents: number;
  receipt_number: string;
  created_at: string;
};

export type TrustBreakdownRow = {
  project_id: string;
  gps_count: number;
  media_count: number;
  beneficiary_count: number;
  report_count: number;
  gps_points: number;
  media_points: number;
  beneficiary_points: number;
  report_points: number;
};

export const TRUST_WEIGHTS = {
  gps: 28,
  media: 22,
  beneficiary: 26,
  report: 24,
} as const;

export function trustScore(b: TrustBreakdownRow): number {
  return Math.min(
    100,
    Math.round(b.gps_points + b.media_points + b.beneficiary_points + b.report_points),
  );
}
