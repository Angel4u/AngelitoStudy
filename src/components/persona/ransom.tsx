import { useMemo } from "react";
import { cn } from "@/lib/utils";

function hashString(str: string): number {
  let h = 9;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 387420489);
  }
  return (h ^ (h >>> 9)) >>> 0;
}

interface RansomProps {
  text: string;
  className?: string;
}

export function Ransom({ text, className }: RansomProps) {
  const chars = useMemo(() => {
    const upper = text.toUpperCase();
    return [...upper].map((c, i) => {
      if (c === " ") {
        return {
          key: `${i}-space`,
          char: "\u00A0",
          isSpace: true,
          transform: "none",
          variantClass: "",
        };
      }
      const h = hashString(upper + i);
      const rot = (h % 17) - 8; // -8..8 deg
      const scale = 0.88 + ((h >> 3) % 26) / 100; // 0.88..1.13
      const dy = ((h >> 5) % 9) - 4; // -4..4 px
      const transform = `rotate(${rot}deg) scale(${scale}) translateY(${dy}px)`;
      const variant = (h >> 7) % 10;

      let variantClass = "";
      if (
        (upper === "ANGELITO" && (c === "G" || c === "T")) ||
        (upper === "STUDY" && c === "D")
      ) {
        variantClass = "box";
      } else if (variant === 0) {
        variantClass = "box";
      } else if (variant === 1) {
        variantClass = "boxw";
      } else if (variant === 2) {
        variantClass = "red";
      }

      return {
        key: `${i}-${c}`,
        char: c,
        isSpace: false,
        transform,
        variantClass,
      };
    });
  }, [text]);

  return (
    <span className={cn("ransom", className)} aria-label={text}>
      {chars.map((item) =>
        item.isSpace ? (
          <span
            key={item.key}
            aria-hidden="true"
            className="inline-block w-[0.32em]"
          >
            {item.char}
          </span>
        ) : (
          <span
            key={item.key}
            aria-hidden="true"
            className={cn("ch display", item.variantClass)}
            style={
              {
                "--t": item.transform,
                transform: item.transform,
              } as React.CSSProperties
            }
          >
            {item.char}
          </span>
        ),
      )}
    </span>
  );
}
