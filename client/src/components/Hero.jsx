import { ArrowLeft, Volume2 } from 'lucide-react';

export default function Hero({ site }) {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero__image" role="img" aria-label="فضای گرم و شبانه کافه صدا" />
      <div className="hero__content shell">
        <div className="hero__copy">
          <h1 id="hero-title">{site.heroTitle}</h1>
          <div className="sound-rule" aria-hidden="true"><span /><Volume2 /></div>
          <p>{site.heroDescription}</p>
          <div className="hero__actions">
            <a className="button button--primary" href="#menu">دیدن منو <ArrowLeft size={19} /></a>
            <a className="button button--ghost" href="#gallery">تماشای فضا <ArrowLeft size={19} /></a>
          </div>
        </div>
      </div>
      <a className="hero__scroll" href="#menu" aria-label="رفتن به منو"><span /></a>
    </section>
  );
}

