"use client";

import { catColor, CategorySummary, DayBucket, Theme } from "@/lib/khaata";

type PieProps = {
  data: CategorySummary[];
  theme: Theme;
  size?: number;
  donut?: boolean;
  onHover?: (d: CategorySummary | null) => void;
};

export function PieChart({
  data,
  theme,
  size = 220,
  donut = false,
  onHover,
}: PieProps) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const cx = size / 2,
    cy = size / 2;
  const r = size / 2 - 4;
  const innerR = donut ? r * 0.62 : 0;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme === "dark" ? "#2a2a2e" : "#ececea"}
          strokeWidth="2"
          strokeDasharray="3 5"
        />
      </svg>
    );
  }

  let acc = 0;
  const slices = data.map((d) => {
    const frac = d.total / total;
    const a0 = acc * Math.PI * 2 - Math.PI / 2;
    acc += frac;
    const a1 = acc * Math.PI * 2 - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0),
      y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1),
      y1 = cy + r * Math.sin(a1);
    let path: string;
    if (donut) {
      const ix0 = cx + innerR * Math.cos(a0),
        iy0 = cy + innerR * Math.sin(a0);
      const ix1 = cx + innerR * Math.cos(a1),
        iy1 = cy + innerR * Math.sin(a1);
      path = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix0} ${iy0} Z`;
    } else {
      path = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    }
    return { d, path, frac };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s) => (
        <path
          key={s.d.id}
          d={s.path}
          fill={catColor(s.d.hue, theme)}
          stroke={theme === "dark" ? "#0a0a0c" : "#fafaf7"}
          strokeWidth="1.5"
          onMouseEnter={() => onHover?.(s.d)}
          onMouseLeave={() => onHover?.(null)}
          style={{ cursor: "pointer", transition: "opacity .15s" }}
        />
      ))}
    </svg>
  );
}

type SparkProps = {
  data: DayBucket[];
  theme: Theme;
  height?: number;
  accent: string;
};

export function Sparkline({ data, theme, height = 60, accent }: SparkProps) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const W = 320,
    H = height;
  const stepX = W / (data.length - 1 || 1);
  const points = data.map<[number, number]>((d, i) => [
    i * stepX,
    H - 6 - (H - 12) * (d.total / max),
  ]);
  const path = points
    .map(
      (p, i) =>
        (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1),
    )
    .join(" ");
  const area = path + ` L ${W} ${H} L 0 ${H} Z`;
  const stroke = accent;
  const fill =
    theme === "dark"
      ? "oklch(0.78 0.12 180 / 0.10)"
      : "oklch(0.55 0.12 180 / 0.10)";
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <path d={area} fill={fill} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) =>
        i === points.length - 1 ? (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={stroke} />
        ) : null,
      )}
    </svg>
  );
}
