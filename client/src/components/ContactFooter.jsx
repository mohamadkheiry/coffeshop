import { Clock3, Instagram, MapPin, Phone } from 'lucide-react';
import Brand from './Brand';

export default function ContactFooter({ site }) {
  const telephone = site.phone
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[^0-9+]/g, '');
  return (
    <>
      <section id="contact" className="contact section" aria-labelledby="contact-title">
        <div className="shell contact__grid">
          <div className="contact__heading"><span className="section-number">۰۳</span><h2 id="contact-title">بیا، یک فنجان<br />با هم بنوشیم.</h2><p>برای یک قرار کوتاه، یک گفت‌وگوی طولانی یا چند دقیقه سکوت، میز شما آماده است.</p></div>
          <address className="contact__details">
            <a href={site.mapUrl} target="_blank" rel="noreferrer"><MapPin /><span><small>نشانی</small>{site.address}</span></a>
            <a href={`tel:${telephone}`}><Phone /><span><small>تلفن</small>{site.phone}</span></a>
            <div><Clock3 /><span><small>ساعت کاری</small>{site.hours}</span></div>
            <a href={`https://instagram.com/${site.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"><Instagram /><span><small>اینستاگرام</small>{site.instagram}</span></a>
          </address>
        </div>
      </section>
      <footer className="footer">
        <div className="shell footer__inner"><Brand compact /><p>قهوه، موسیقی و مکث‌های خوب.</p><p>© {new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())} کافه صدا</p></div>
      </footer>
    </>
  );
}
