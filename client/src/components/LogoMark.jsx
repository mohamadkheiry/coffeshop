import { useId } from 'react';

export default function LogoMark({ className = '' }) {
  const maskId = useId().replace(/:/g, '');

  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <mask id={maskId}>
        <rect width="64" height="64" fill="white" />
        <path d="M5 32h8c4 0 4-10 7-10s4 20 7.5 20S31 11 34.5 11 38 42 41.5 42 45 22 48 22s4 10 8 10h5" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </mask>
      <g mask={`url(#${maskId})`} fill="currentColor">
        <circle cx="31" cy="32" r="23" />
        <rect x="50" y="26" width="12" height="12" rx="6" />
      </g>
      <circle cx="34.5" cy="32" r="3.5" fill="currentColor" />
    </svg>
  );
}
