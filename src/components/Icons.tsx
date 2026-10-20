import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconStar = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.6l-5.1 2.6 1-5.6-4.1-4 5.7-.8z" />
  </Svg>
);
export const IconStarFilled = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.6l-5.1 2.6 1-5.6-4.1-4 5.7-.8z" fill="currentColor" />
  </Svg>
);
export const IconExpand = (p: P) => (
  <Svg {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-7 7" />
    <path d="M10 20H4v-6" />
    <path d="M4 20l7-7" />
  </Svg>
);
export const IconMore = (p: P) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
);
export const IconGrip = (p: P) => (
  <Svg {...p}>
    {[7, 12, 17].map((y) => (
      <g key={y}>
        <circle cx="9" cy={y} r="1.25" fill="currentColor" stroke="none" />
        <circle cx="15" cy={y} r="1.25" fill="currentColor" stroke="none" />
      </g>
    ))}
  </Svg>
);
export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="M20 20l-4.4-4.4" />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const IconChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const IconArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconPencil = (p: P) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);
export const IconBell = (p: P) => (
  <Svg {...p}>
    <path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 004 0" />
  </Svg>
);
export const IconDownload = (p: P) => (
  <Svg {...p}>
    <path d="M12 4v11M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </Svg>
);
export const IconLink = (p: P) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const IconFilter = (p: P) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);
export const IconArrange = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <path d="M16.5 13.5v6M13.5 16.5h6" />
  </Svg>
);
export const IconTable = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="5" width="16" height="14" rx="1" />
    <path d="M4 10h16M10 10v9" />
  </Svg>
);
export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M9 4h6l-1 5 3 3H7l3-3z" />
    <path d="M12 12v8" />
  </Svg>
);
