const Svg = ({ children, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const CodeIcon = () => (
  <Svg>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Svg>
);

export const GamepadIcon = () => (
  <Svg>
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
  </Svg>
);

export const LaptopIcon = () => (
  <Svg>
    <rect x="4" y="4" width="16" height="11" rx="2" />
    <path d="M2 19h20" />
  </Svg>
);

export const BulbIcon = () => (
  <Svg>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5A5.5 5.5 0 1 0 6.5 8c0 1.4.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Svg>
);

export const TargetIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </Svg>
);

export const BrainIcon = () => (
  <Svg>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.6 6.5a3 3 0 0 0 .4-1.375" />
    <path d="M6 5.125A3 3 0 0 0 6.4 6.5" />
    <path d="M12 5v13" />
  </Svg>
);

export const ChevronIcon = () => (
  <Svg size={18}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);
