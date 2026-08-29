export default function Brand({ compact = false }) {
  return (
    <a className={`brand${compact ? ' brand--compact' : ''}`} href="/#home" aria-label="کافه صدا، صفحه اصلی">
      <svg className="brand__wave" viewBox="0 0 58 24" aria-hidden="true">
        <path d="M1 12h7l3-7 4 14 5-18 5 22 5-17 5 12 5-9 4 6 4-3h5" />
      </svg>
      <span className="brand__lockup"><span className="brand__name">کافه صدا</span><small dir="ltr">CAFE SEDA</small></span>
    </a>
  );
}
