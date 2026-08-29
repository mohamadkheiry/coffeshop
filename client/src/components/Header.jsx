import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Brand from './Brand';

const links = [
  ['خانه', 'home'], ['منو', 'menu'], ['داستان ما', 'story'], ['لحظه‌ها', 'gallery'], ['تماس', 'contact'],
];

export default function Header({ site }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <div className="site-header__inner shell">
        <Brand />
        <nav className={`site-nav${open ? ' site-nav--open' : ''}`} aria-label="ناوبری اصلی">
          {links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
          <a className="site-nav__admin" href="/admin">مدیریت سایت</a>
        </nav>
        <div className="site-header__meta"><span /><small>{site.hours}</small></div>
        <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'بستن منو' : 'باز کردن منو'} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
