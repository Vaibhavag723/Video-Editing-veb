import { cn } from "@/lib/cn";

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-lime-400 transition-all duration-700",
          barClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}