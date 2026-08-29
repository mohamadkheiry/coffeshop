import { Clock3, Instagram, MapPin, Phone } from 'lucide-react';
import Brand from './Brand';
import SoundWave from './SoundWave';

export default function ContactFooter({ site }) {
  const telephone = site.phone
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[^0-9+]/g, '');
  return (
    <>
      <section id="contact" className="contact section" aria-labelledby="contact-title">
        <div className="shell contact__grid">
          <div className="contact__heading"><span className="contact__number">۰۴</span><h2 id="contact-title">برای شنیدن خوب،<br />جایی خوب لازم است.</h2><p>برای یک قرار کوتاه، یک گفت‌وگوی طولانی یا چند دقیقه سکوت، میز شما آماده است.</p><small dir="ltr">COME AS YOU ARE</small></div>
          <address className="contact__details">
            <a href={site.mapUrl} target="_blank" rel="noreferrer"><MapPin /><span><small>نشانی</small><strong>{site.address}</strong></span><i>↗</i></a>
            <a href={`tel:${telephone}`}><Phone /><span><small>تلفن</small><strong>{site.phone}</strong></span><i>↗</i></a>
            <div><Clock3 /><span><small>ساعت کاری</small><strong>{site.hours}</strong></span></div>
            <a href={`https://instagram.com/${site.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"><Instagram /><span><small>اینستاگرام</small><strong>{site.instagram}</strong></span><i>↗</i></a>
          </address>
        </div>
        <div className="contact__wave"><SoundWave /><div className="contact__seal"><span>صدا</span><small>زبان ماست</small></div></div>
      </section>
      <footer className="footer">
        <div className="shell footer__inner">
          <div className="footer__brand"><Brand /><p>قهوه خوب، موسیقی خوب، حال خوب.</p></div>
          <p className="footer__quote">هر فنجان، یک صدا.<br />هر لحظه، یک خاطره.</p>
          <div className="footer__legal"><a href="/admin">ورود مدیران</a><p>© {new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())} CAFE SEDA</p></div>
        </div>
      </footer>
    </>
  );
}
