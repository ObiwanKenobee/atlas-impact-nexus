import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  CommunityRow,
  EvidenceKind,
  EvidenceRow,
  ProjectRow,
  TransactionRow,
  TrustBreakdownRow,
} from "./atlas-types";

// -------- Public reads (use admin to be visible to anon visitors) --------

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProjectRow[];
});

export const listCommunities = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("communities")
    .select("*")
    .order("score", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CommunityRow[];
});

export const listEvidence = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("evidence")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EvidenceRow[];
});

export const listTransactions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TransactionRow[];
});

export const listTrustBreakdown = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("project_trust_breakdown")
    .select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TrustBreakdownRow[];
});

export const getEvidence = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("evidence")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as unknown as EvidenceRow | null;
  });

export const getReceipt = createServerFn({ method: "GET" })
  .inputValidator((d: { receipt: string }) =>
    z.object({ receipt: z.string().min(3).max(64) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tx, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("receipt_number", data.receipt)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (tx ?? null) as unknown as TransactionRow | null;
  });

// -------- Authenticated writes --------

const EvidenceInsert = z.object({
  project_id: z.string().min(1).max(64),
  kind: z.enum(["GPS", "IoT", "PHOTO", "VIDEO", "REPORT", "BENEFICIARY"]),
  title: z.string().min(1).max(160),
  meta: z.string().max(280).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  media_url: z.string().max(2048).optional().nullable(),
  iot_payload: z.record(z.string(), z.unknown()).optional().nullable(),
  report_text: z.string().max(8000).optional().nullable(),
  captured_at: z.string().optional().nullable(),
});

export const createEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => EvidenceInsert.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const insertRow = {
      project_id: data.project_id,
      kind: data.kind,
      title: data.title,
      meta: data.meta ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      media_url: data.media_url ?? null,
      iot_payload: (data.iot_payload ?? null) as never,
      report_text: data.report_text ?? null,
      uploader_id: userId,
      captured_at: data.captured_at ?? new Date().toISOString(),
    };
    const { data: row, error } = await (supabase.from("evidence") as never as {
      insert: (r: typeof insertRow) => {
        select: (s: string) => { single: () => Promise<{ data: unknown; error: { message: string } | null }> };
      };
    })
      .insert(insertRow)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as EvidenceRow;
  });

const FundInput = z.object({
  project_id: z.string().min(1).max(64),
  amount_cents: z.number().int().min(100).max(100_000_00),
  donor_name: z.string().min(1).max(120).optional().nullable(),
});

export const fundProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => FundInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: tx, error } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: { message: string } | null }>
    )("fund_project", {
      _project_id: data.project_id,
      _amount_cents: data.amount_cents,
      _donor_name: data.donor_name ?? null,
    });
    if (error) throw new Error(error.message);
    return tx as unknown as TransactionRow;
  });

export type { EvidenceKind };
