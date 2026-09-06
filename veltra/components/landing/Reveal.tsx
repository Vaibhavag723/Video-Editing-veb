"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type RevealProps = {
  /** Tag/element to render (default "div") */
  as?: ElementType;
  /** animation class: "reveal" (default) or "reveal-scale" */
  variant?: "reveal" | "reveal-scale";
  /** entrance delay in seconds, applied via the --d custom property */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * Scroll-reveal wrapper (client component). Adds `in` when the element
 * enters the viewport; `delay` staggers the entrance.
 */
export default function Reveal({
  as = "div",
  variant = "reveal",
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReduced() || !("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      className={`${variant}${shown ? " in" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--d": `${delay}s`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}