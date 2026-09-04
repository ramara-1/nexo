export function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}
