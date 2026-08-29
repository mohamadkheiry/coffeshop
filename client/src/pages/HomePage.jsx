import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../api';
import Header from '../components/Header';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import StoryGallery from '../components/StoryGallery';
import ContactFooter from '../components/ContactFooter';

export default function HomePage() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api('/api/content').then((data) => active && setContent(data)).catch((requestError) => active && setError(requestError.message));
    return () => { active = false; };
  }, []);

  if (error) return <main className="load-state"><h1>کافه صدا</h1><p>{error}</p><button onClick={() => window.location.reload()}>تلاش دوباره</button></main>;
  if (!content) return <main className="load-state" aria-live="polite"><span className="loader" /><p>در حال آماده‌کردن میز شما…</p></main>;

  return (
    <div className="site-page">
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
        <meta name="keywords" content={content.seo.keywords} />
      </Helmet>
      <Header />
      <main>
        <Hero site={content.site} />
        <MenuSection categories={content.categories} items={content.menuItems} />
        <StoryGallery site={content.site} media={content.media} />
        <ContactFooter site={content.site} />
      </main>
    </div>
  );
}
