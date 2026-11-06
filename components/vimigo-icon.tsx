"use client";

import type { CSSProperties } from "react";

// 24x24 stroke icon set ported from the Living Web dashboard mockup.
const ICONS: Record<string, string> = {
  overview: "M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zM13 3v6h8V3h-8z",
  analytics: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  history: "M3 4v5h5M3.5 9A9 9 0 1112 21M12 7v5l3.5 2",
  search: "M11 4a7 7 0 105 12 7 7 0 00-5-12zM20 21l-4.3-4.3",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 01-3.4 0",
  plus: "M12 5v14M5 12h14",
  chevron: "M9 6l6 6-6 6",
  check: "M5 13l4 4L19 7",
  settings:
    "M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 13a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V20a2 2 0 01-4 0v-.1A1.6 1.6 0 005.3 18l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 002.6 13H2.5a2 2 0 010-4h.1a1.6 1.6 0 001.1-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 009 4.6V4.5a2 2 0 014 0v.1A1.6 1.6 0 0019 5.3l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0021 11h.1a2 2 0 010 4H21z",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 3 3.5 6 3.5 9s-1 6-3.5 9c-2.5-3-3.5-6-3.5-9s1-6 3.5-9z",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 100-6 3 3 0 000 6z",
  home: "M3 11l9-8 9 8M5 9.5V21h5v-6h4v6h5V9.5",
  pencil: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z",
  image: "M4 5h16v14H4zM4 15l4-4 3 3 4-4 5 5M9 9.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  feather: "M20.2 5.8a4 4 0 00-5.6 0L4 16.4V20h3.6L18.2 9.4a4 4 0 002-3.6zM14 7l3 3M5 19l4-4",
  creditCard: "M3 6h18v12H3zM3 10h18M7 15h4",
  truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7M6.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  tag: "M3 3h7l11 11-7 7L3 10V3zM7.5 7.5h.01",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6",
  upload: "M12 16V4M6 10l6-6 6 6M4 20h16",
  download: "M12 4v12M6 10l6 6 6-6M4 20h16",
  database: "M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3zM4 6v6c0 2 3.6 3 8 3s8-1 8-3V6M4 12v6c0 2 3.6 3 8 3s8-1 8-3v-6",
  link: "M9 15l6-6M10 7l1-1a4 4 0 016 6l-1 1M14 17l-1 1a4 4 0 01-6-6l1-1",
  box: "M12 3l9 5v8l-9 5-9-5V8l9-5zM3 8l9 5 9-5M12 13v9",
  mapPin: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  type: "M4 6V4h16v2M12 4v16M9 20h6",
  dollar: "M12 2v20M17 6.5C17 4.5 14.8 3.5 12 3.5S7 4.8 7 7s2.5 3 5 3.5 5 1.5 5 3.5-2.2 3.5-5 3.5-5-1-5-3",
  megaphone: "M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1zM14 8a4 4 0 010 8M10 14v4a2 2 0 003.5 1.3",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  star: "M12 3l2.6 6.5L21 10l-5 4.3L17.5 21 12 17.5 6.5 21 8 14.3 3 10l6.4-.5L12 3z",
  cart: "M3 4h2l2.5 12h11l2-9H6M9 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z",
  shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3zM9 12l2 2 4-4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  external: "M14 4h6v6M20 4l-9 9M19 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  calendar: "M4 5h16v15H4zM4 9h16M8 3v4M16 3v4",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  box2: "M9 3h6M10 3v5L5.5 17.5A2 2 0 007.3 20.5h9.4a2 2 0 001.8-3L14 8V3M8 14h8",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  arrowCircle: "M12 3a9 9 0 100 18 9 9 0 000-18zM7.5 12h8M12 8l4 4-4 4",
};

export function Icon({
  name,
  size = 20,
  style,
  strokeWidth = 1.7,
  fill = false,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
  strokeWidth?: number;
  fill?: boolean;
}) {
  const d = ICONS[name] || ICONS.overview;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={style}
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export { ICONS };
