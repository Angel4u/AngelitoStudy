import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span";
}

type ObserverCallback = (isIntersecting: boolean) => void;

let sharedObserver: IntersectionObserver | null = null;
const observedElements = new Map<Element, ObserverCallback>();

function getSharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = observedElements.get(entry.target);
          if (cb) cb(entry.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );
  }
  return sharedObserver;
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
    const observer = getSharedObserver();
    if (!el || !observer) {
      setVisible(true);
      return;
    }

    observedElements.set(el, setVisible);
    observer.observe(el);
    return () => {
      observedElements.delete(el);
      observer.unobserve(el);
    };
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
              "transition-all duration-700 ease-out",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 will-change-transform",
            ),
        className,
      )}
    >
      {children}
    </Component>
  );
}
