type IconProps = {
  className?: string;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function SunIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2.2" />
      <path d="M12 18.8V21" />
      <path d="m5.6 5.6 1.6 1.6" />
      <path d="m16.8 16.8 1.6 1.6" />
      <path d="M3 12h2.2" />
      <path d="M18.8 12H21" />
      <path d="m5.6 18.4 1.6-1.6" />
      <path d="m16.8 7.2 1.6-1.6" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 21c-4 0-6.5-2.6-6.5-6 0-2.6 1.6-4 2.4-6 .5 1.4 1.4 2 2.1 1.6-.6-2.6.2-5 3-7.6.3 2.3 1 3.6 2.3 5 1.6 1.7 2.7 3.4 2.7 6C18.5 18.4 16 21 12 21Z" />
      <path d="M12 21c1.8 0 3-1.3 3-3 0-1.6-1-2.4-1.5-3.6-.3.8-.8 1.1-1.3.9.3-1.4-.2-2.6-1.7-4-.2 1.2-.6 1.9-1.3 2.6-.9.9-1.5 1.8-1.5 3.1 0 2.3 1.7 4 4.3 4Z" />
    </svg>
  );
}

export function DropletIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5s6 6.7 6 11a6 6 0 1 1-12 0c0-4.3 6-11 6-11Z" />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20 4c-9 0-15 5-15 13.5 0 .8.6 1.5 1.4 1.5C14.5 19 20 13.5 20 4Z" />
      <path d="M6 19c2-4 4.5-7 9-10" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ChecklistIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 11.5 11 13.5 15.5 9" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M11.5 3.5H8a1 1 0 0 0-.7.3l-4 4a1 1 0 0 0 0 1.4l9.5 9.5a1 1 0 0 0 1.4 0l6.5-6.5a1 1 0 0 0 0-1.4L11.9 3.8a1 1 0 0 0-.4-.3Z" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GaugeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15 15.5 10" />
      <path d="M12 15h.01" />
    </svg>
  );
}

export function FuelIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path d="M4 11h10" />
      <path d="M16 7.5 18.5 10a2 2 0 0 1 .6 1.4V17a1.5 1.5 0 0 0 3 0v-3.5" />
      <path d="M3 20h13" />
    </svg>
  );
}

export function TransmissionIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M5 8h14v8H5z" />
      <path d="M9 12h6" />
    </svg>
  );
}

export function DrivetrainIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3v6.6" />
      <path d="M12 14.4V21" />
      <path d="m5 6 4.6 4.6" />
      <path d="m19 18-4.6-4.6" />
      <path d="m19 6-4.6 4.6" />
      <path d="m5 18 4.6-4.6" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.5-.36 10.6 10.6 0 0 0 3.3.5A1.5 1.5 0 0 1 21.7 17v3.2a1.5 1.5 0 0 1-1.6 1.5A18.3 18.3 0 0 1 3.3 4.9a1.5 1.5 0 0 1 1.5-1.6H8a1.5 1.5 0 0 1 1.5 1.5c0 1.14.18 2.25.5 3.3a1.5 1.5 0 0 1-.37 1.5L6.6 10.8Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 21s-6.7-5.7-6.7-11A6.7 6.7 0 0 1 18.7 10c0 5.3-6.7 11-6.7 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M7 3.5h7l3.5 3.5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3.5" />
      <path d="M8.8 12h6.4" />
      <path d="M8.8 15.4h6.4" />
      <path d="M8.8 8.6h2.8" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4.5 12h15" />
      <path d="m13 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3.5 6.5h17" />
      <path d="M3.5 12h17" />
      <path d="M3.5 17.5h17" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="m5 5 14 14" />
      <path d="m19 5-14 14" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.9" cy="7.1" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M14.5 21v-7.2h2.4l.4-2.9h-2.8V9.1c0-.84.23-1.4 1.44-1.4h1.54V5.1A20.6 20.6 0 0 0 15.2 5c-2.2 0-3.7 1.34-3.7 3.8v2.1H9v2.9h2.5V21" />
    </svg>
  );
}

export function XSocialIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="m4.5 4.5 15 15" />
      <path d="m19.5 4.5-15 15" />
    </svg>
  );
}
