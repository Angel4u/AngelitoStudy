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
      const rot = (h % 13) - 6; // -6..6 deg
      const rawScale = 0.9 + ((h >> 3) % 16) / 100; // 0.90..1.05
      const dy = ((h >> 5) % 7) - 3; // -3..3 px
      const variant = (h >> 7) % 10;

      let variantClass = "";
      // Narrow letters like I or L should never get a solid box background
      // because a rectangle around "I" looks oversized and blocks the letter shape.
      const isNarrow = c === "I" || c === "L" || c === "1";

      if (
        (upper === "ANGELITO" && (c === "G" || c === "T")) ||
        (upper === "STUDY" && c === "D")
      ) {
        variantClass = "box";
      } else if (upper === "DRIVE" && c === "I") {
        variantClass = "red";
      } else if (!isNarrow && variant === 0) {
        variantClass = "box";
      } else if (!isNarrow && variant === 1) {
        variantClass = "boxw";
      } else if (variant === 2) {
        variantClass = "red";
      }

      const finalScale =
        variantClass === "box" || variantClass === "boxw"
          ? Math.min(rawScale, 0.94)
          : isNarrow
            ? Math.min(rawScale, 0.96)
            : rawScale;

      const transform = `rotate(${rot}deg) scale(${finalScale}) translateY(${dy}px)`;

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
