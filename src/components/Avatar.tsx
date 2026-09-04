import type { PublicUser } from "@/lib/serialize";

export function Avatar({
  user,
  size = 40,
}: {
  user: Pick<PublicUser, "name" | "avatarHue" | "avatarUrl">;
  size?: number;
}) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-ink"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(145deg, hsl(${user.avatarHue} 62% 58%), hsl(${(user.avatarHue + 40) % 360} 48% 38%))`,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
