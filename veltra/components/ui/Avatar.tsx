import { avatarHue, cn, initials } from "@/lib/cn";

const hueClasses: Record<string, string> = {
  violet: "from-violet-500 to-fuchsia-600",
  lime: "from-lime-400 to-emerald-600",
  cyan: "from-cyan-400 to-blue-600",
  fuchsia: "from-fuchsia-500 to-pink-600",
  amber: "from-amber-400 to-orange-600",
  rose: "from-rose-500 to-red-600",
};

export function Avatar({
  name,
  size = "md",
  ring = false,
  className,
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
}) {
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
    xl: "h-16 w-16 text-xl",
  } as const;
  const hue = avatarHue(name);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white",
        hueClasses[hue],
        sizes[size],
        ring && "ring-2 ring-white/10",
        className
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}