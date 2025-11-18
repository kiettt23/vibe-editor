import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoIcon uniColor={uniColor} />
      <span className="text-2xl font-bold tracking-tight">
        <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          Vibe
        </span>
        <span className="text-foreground">Editor</span>
      </span>
    </div>
  );
};

export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 28 28"
      fill="none"
      className={cn("size-10", className)}
    >
      {/* Gemini-style sparkle/star icon */}
      {/* Main star shape (4 points) */}
      <path
        d="M14 2L15.5 10L14 14L12.5 10L14 2Z"
        fill={uniColor ? "currentColor" : "url(#logo-gradient-1)"}
      />
      <path
        d="M26 14L18 12.5L14 14L18 15.5L26 14Z"
        fill={uniColor ? "currentColor" : "url(#logo-gradient-2)"}
      />
      <path
        d="M14 26L12.5 18L14 14L15.5 18L14 26Z"
        fill={uniColor ? "currentColor" : "url(#logo-gradient-3)"}
      />
      <path
        d="M2 14L10 15.5L14 14L10 12.5L2 14Z"
        fill={uniColor ? "currentColor" : "url(#logo-gradient-4)"}
      />

      {/* Center glow circle */}
      <circle
        cx="14"
        cy="14"
        r="3"
        fill={uniColor ? "currentColor" : "url(#logo-gradient-center)"}
        opacity="0.8"
      />

      <defs>
        {/* Multiple gradients for each point (Gemini style) */}
        <linearGradient
          id="logo-gradient-1"
          x1="14"
          y1="2"
          x2="14"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient
          id="logo-gradient-2"
          x1="26"
          y1="14"
          x2="14"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient
          id="logo-gradient-3"
          x1="14"
          y1="26"
          x2="14"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
        <linearGradient
          id="logo-gradient-4"
          x1="2"
          y1="14"
          x2="14"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        <radialGradient
          id="logo-gradient-center"
          cx="14"
          cy="14"
          r="3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#9B99FE" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-7 w-7", className)}
      viewBox="0 0 71 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M61.25 1.625L70.75 1.5625C70.75 4.77083 70.25 7.79167 69.25 10.625C68.2917 13.4583 66.8958 15.9583 65.0625 18.125C63.2708 20.25 61.125 21.9375 58.625 23.1875C56.1667 24.3958 53.4583 25 50.5 25C46.875 25 43.6667 24.2708 40.875 22.8125C38.125 21.3542 35.125 19.2083 31.875 16.375C29.75 14.4167 27.7917 12.8958 26 11.8125C24.2083 10.7292 22.2708 10.1875 20.1875 10.1875C18.0625 10.1875 16.25 10.7083 14.75 11.75C13.25 12.75 12.0833 14.1875 11.25 16.0625C10.4583 17.9375 10.0625 20.1875 10.0625 22.8125L0 22.9375C0 19.6875 0.479167 16.6667 1.4375 13.875C2.4375 11.0833 3.83333 8.64583 5.625 6.5625C7.41667 4.47917 9.54167 2.875 12 1.75C14.5 0.583333 17.2292 0 20.1875 0C23.8542 0 27.1042 0.770833 29.9375 2.3125C32.8125 3.85417 35.7708 5.97917 38.8125 8.6875C41.1042 10.7708 43.1042 12.3333 44.8125 13.375C46.5625 14.375 48.4583 14.875 50.5 14.875C52.6667 14.875 54.5417 14.3125 56.125 13.1875C57.75 12.0625 59 10.5 59.875 8.5C60.7917 6.5 61.25 4.20833 61.25 1.625Z"
        fill="none"
        strokeWidth={0.5}
        stroke="currentColor"
      />
    </svg>
  );
};
