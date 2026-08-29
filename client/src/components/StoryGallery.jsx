import { useEffect, useState } from 'react';
import { ArrowLeft, Pause, Play, X } from 'lucide-react';

function Media({ item, featured = false, onOpen }) {
  const poster = item.poster || item.url;
  return (
    <button className={`gallery-media${featured ? ' gallery-media--featured' : ''}`} onClick={() => onOpen(item)} aria-label={`نمایش ${item.title}`}>
      <img src={poster} alt={item.title} loading="lazy" />
      {item.type === 'video' && <span className="gallery-media__play"><Play fill="currentColor" /></span>}
      <span className="gallery-media__caption">{item.title}</span>
    </button>
  );
}

export default function StoryGallery({ site, media }) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!active) return undefined;
    const close = (event) => event.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [active]);

  const ordered = [...media].sort((a, b) => a.order - b.order);
  return (
    <section id="story" className="story-gallery section" aria-labelledby="story-title">
      <div className="shell story-gallery__grid">
        <div className="story-copy">
          <span className="section-number">۰۲</span>
          <h2 id="story-title">{site.storyTitle}</h2>
          <span className="story-copy__rule" />
          <p>{site.story}</p>
          <a href="#gallery">دیدن همه لحظه‌ها <ArrowLeft size={18} /></a>
        </div>
        <div id="gallery" className="gallery" aria-label="گالری کافه صدا">
          <div className="gallery__title"><span /><h2>لحظه‌های کافه صدا</h2></div>
          {ordered[0] && <Media item={ordered[0]} featured onOpen={setActive} />}
          <div className="gallery__pair">
            {ordered.slice(1, 3).map((item) => <Media key={item.id} item={item} onOpen={setActive} />)}
          </div>
        </div>
      </div>
      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => setActive(null)}>
          <button className="lightbox__close" onClick={() => setActive(null)} aria-label="بستن"><X /></button>
          <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
            {active.type === 'video' ? <video src={active.url} poster={active.poster} controls autoPlay /> : <img src={active.url} alt={active.title} />}
            <p>{active.title} {active.type === 'video' ? <Pause size={15} /> : null}</p>
          </div>
        </div>
      )}
    </section>
  );
}

