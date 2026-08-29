import { useEffect, useState } from 'react';
import { ArrowLeft, Pause, Play, X } from 'lucide-react';
import SoundRail from './SoundRail';

function Media({ item, featured = false, onOpen }) {
  const poster = item.poster || item.url;
  return (
    <button className={`gallery-media${featured ? ' gallery-media--featured' : ''}`} onClick={() => onOpen(item)} aria-label={`نمایش ${item.title}`}>
      <img src={poster} alt={item.title} loading="lazy" />
      <span className={`gallery-media__play${item.type !== 'video' ? ' gallery-media__play--image' : ''}`}><Play fill="currentColor" /></span>
      <span className="gallery-media__caption"><small>{item.type === 'video' ? 'VIDEO' : 'STORY'}</small>{item.title}</span>
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
      <div className="story-gallery__word" aria-hidden="true">کافه صدا</div>
      <div className="story-grooves" aria-hidden="true" />
      <div className="shell story-gallery__grid">
        <div className="story-copy">
          <div className="story-copy__label"><span>۰۳</span><small>داستان ما</small><i /></div>
          <h2 id="story-title">{site.storyTitle}</h2>
          <p>{site.story}</p>
          <a href="#gallery">دیدن همه لحظه‌ها <ArrowLeft size={18} /></a>
        </div>
        <div id="gallery" className="gallery" aria-label="گالری کافه صدا">
          <div className="gallery__title"><span dir="ltr">STORIES IN SOUND</span><i /><h2>لحظه‌های صدا</h2></div>
          <div className="gallery__mosaic">
            {ordered[0] && <div className="gallery__cell gallery__cell--wide"><Media item={ordered[0]} featured onOpen={setActive} /><small>۰۱ — لحظه</small></div>}
            {ordered[1] && <div className="gallery__cell gallery__cell--tall"><Media item={ordered[1]} onOpen={setActive} /><small>۰۲ — مهارت</small></div>}
            {ordered[2] && <div className="gallery__cell gallery__cell--small"><Media item={ordered[2]} onOpen={setActive} /><small>۰۳ — فنجان</small></div>}
          </div>
        </div>
      </div>
      <SoundRail />
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
