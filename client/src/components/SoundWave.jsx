export default function SoundWave({ className = '', label = 'Cafe Seda sound wave' }) {
  return (
    <svg className={`sound-wave ${className}`} viewBox="0 0 1200 68" preserveAspectRatio="none" role="img" aria-label={label}>
      <path d="M0 34h35l9-2 7 4 8-16 8 30 8-23 8 12 8-6 8 2h48l8-3 8 6 8-19 8 32 8-25 8 14 8-8 8 3h71l8-2 8 4 8-13 8 23 8-38 8 56 8-31 8 18 8-9 8 3h62l8-3 8 6 8-20 8 34 8-24 8 13 8-7 8 2h68l8-4 8 8 8-27 8 43 8-63 8 68 8-42 8 24 8-11 8 4h60l8-2 8 5 8-18 8 31 8-22 8 12 8-6 8 2h77l8-3 8 6 8-21 8 35 8-52 8 59 8-34 8 19 8-9 8 3h55l8-2 8 4 8-14 8 24 8-36 8 43 8-26 8 14 8-7 8 2h63l8-2 8 4 8-12 8 20 8-15 8 8 8-4h48" />
    </svg>
  );
}
