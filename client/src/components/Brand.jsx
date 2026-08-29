import LogoMark from './LogoMark';

export default function Brand({ compact = false }) {
  return (
    <a className={`brand${compact ? ' brand--compact' : ''}`} href="/#home" aria-label="کافه صدا، صفحه اصلی">
      <LogoMark className="brand__mark" />
      <span className="brand__lockup"><span className="brand__name">کافه صدا</span><small dir="ltr">CAFE SEDA</small></span>
    </a>
  );
}
