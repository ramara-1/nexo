export function progressOf(status?: string | null) {
  if (status === "done") return 100;
  if (status === "progress") return 65;
  if (status === "building") return 40;
  if (status === "idea") return 15;
  return 0;
}

export function badgeClass(kind: string) {
  return `badge-${kind}`;
}
