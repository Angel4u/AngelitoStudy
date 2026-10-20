import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span";
}

export function Reveal({
  children,
  delay = 0,
  className,
  as: Component = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      const isReduced = mq.matches;
      setReducedMotion(isReduced);
      if (isReduced) setVisible(true);
    };
    updateMotion();
    mq.addEventListener("change", updateMotion);
    return () => mq.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <Component
      ref={ref}
      style={
        reducedMotion || !visible
          ? undefined
          : delay > 0
            ? { transitionDelay: `${delay}ms` }
            : undefined
      }
      className={cn(
        reducedMotion
          ? "translate-y-0 opacity-100"
          : cn(
              "transition-all duration-700 ease-out will-change-transform",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            ),
        className,
      )}
    >
      {children}
    </Component>
  );
}
