import { ArrowDownLeft, ArrowLeft } from 'lucide-react';
import SoundWave from './SoundWave';

export default function Hero({ site }) {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero__image" role="img" aria-label="فضای گرم و شبانه کافه صدا" />
      <div className="hero__content shell">
        <div className="hero__copy">
          <div className="hero__micro" dir="ltr"><span>01</span><p>SPECIALTY COFFEE<br />LISTENING BAR</p></div>
          <h1 id="hero-title">{site.heroTitle}</h1>
          <p>{site.heroDescription}</p>
          <div className="hero__actions">
            <a className="button button--primary" href="#menu">دیدن منو <ArrowLeft size={19} /></a>
            <a className="button button--text" href="#gallery">تماشای فضا <ArrowDownLeft size={19} /></a>
          </div>
          <div className="hero__note"><span />آرام‌تر بنوشید؛ دقیق‌تر بشنوید.</div>
        </div>
      </div>
      <div className="hero__wave"><SoundWave label="موج صدای کافه صدا" /><span dir="ltr">LISTEN SLOWLY</span></div>
      <a className="hero__scroll" href="#menu" aria-label="رفتن به منو"><small>SCROLL</small><span /></a>
    </section>
  );
}
