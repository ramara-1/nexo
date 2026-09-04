import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/home" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember text-white shadow-md shadow-ember/30">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3.5 14.2 9l6 .4-4.7 3.7 1.6 5.7L12 15.8 6.9 18.8l1.6-5.7L3.8 9.4l6-.4L12 3.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {compact ? null : (
        <span>
          <span className="block text-[15px] font-semibold tracking-tight text-cream">Nexo</span>
          <span className="block text-[11px] text-mute">Meu Espaço</span>
        </span>
      )}
    </Link>
  );
}
