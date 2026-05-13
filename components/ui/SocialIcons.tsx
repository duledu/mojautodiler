// Custom social icons as inline SVGs (not available in all lucide-react versions)

interface IconProps {
  size?: number;
  className?: string;
}

export function FacebookIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export function InstagramIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function ViberIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.79 14.22c-.2.2-.42.33-.67.37-.46.08-.93-.06-1.34-.29-.91-.51-1.77-1.1-2.53-1.79-.73-.67-1.39-1.41-1.96-2.22-.48-.69-.88-1.43-1.08-2.24-.08-.34-.04-.7.13-1.01.17-.31.46-.55.79-.63.08-.02.17-.03.25-.03.24 0 .48.1.64.28.41.44.77.92 1.06 1.43.15.26.12.59-.08.82l-.28.33c-.09.11-.11.27-.04.4.26.51.61.97 1.02 1.37.41.4.87.75 1.38 1.01.12.06.27.05.38-.04l.33-.27c.23-.19.56-.22.82-.07.51.29 1 .65 1.43 1.07.19.18.28.44.26.7-.02.26-.14.5-.31.67z"/>
    </svg>
  );
}
