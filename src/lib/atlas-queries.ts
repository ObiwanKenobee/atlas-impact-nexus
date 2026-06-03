import { queryOptions } from "@tanstack/react-query";
import {
  listCommunities,
  listEvidence,
  listProjects,
  listTransactions,
  listTrustBreakdown,
  getEvidence,
  getReceipt,
} from "./atlas.functions";

export const qk = {
  projects: ["projects"] as const,
  communities: ["communities"] as const,
  evidence: ["evidence"] as const,
  transactions: ["transactions"] as const,
  trust: ["trust"] as const,
  evidenceOne: (id: string) => ["evidence", id] as const,
  receipt: (r: string) => ["receipt", r] as const,
};

export const projectsQuery = queryOptions({
  queryKey: qk.projects,
  queryFn: () => listProjects(),
  staleTime: 30_000,
});
export const communitiesQuery = queryOptions({
  queryKey: qk.communities,
  queryFn: () => listCommunities(),
  staleTime: 60_000,
});
export const evidenceQuery = queryOptions({
  queryKey: qk.evidence,
  queryFn: () => listEvidence(),
  staleTime: 15_000,
});
export const transactionsQuery = queryOptions({
  queryKey: qk.transactions,
  queryFn: () => listTransactions(),
  staleTime: 15_000,
});
export const trustQuery = queryOptions({
  queryKey: qk.trust,
  queryFn: () => listTrustBreakdown(),
  staleTime: 15_000,
});
export const evidenceOneQuery = (id: string) =>
  queryOptions({
    queryKey: qk.evidenceOne(id),
    queryFn: () => getEvidence({ data: { id } }),
  });
export const receiptQuery = (receipt: string) =>
  queryOptions({
    queryKey: qk.receipt(receipt),
    queryFn: () => getReceipt({ data: { receipt } }),
  });
