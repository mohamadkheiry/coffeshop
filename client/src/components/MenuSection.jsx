import { useMemo, useState } from 'react';

const price = new Intl.NumberFormat('fa-IR');

export default function MenuSection({ categories, items }) {
  const orderedCategories = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);
  const [selected, setSelected] = useState(orderedCategories[0]?.id || '');
  const visible = items.filter((item) => item.categoryId === selected && item.available);

  return (
    <section id="menu" className="menu-section section" aria-labelledby="menu-title">
      <div className="menu-shell shell">
        <aside className="menu-index" aria-hidden="true"><strong>۰۲</strong><span dir="ltr">FRESHLY<br />ROASTED</span></aside>
        <div className="menu-panel">
          <header className="menu-panel__header">
            <div><small dir="ltr">SIGNATURE MENU</small><h2 id="menu-title">منوی کافه صدا</h2></div>
            <p>هر انتخاب با دانه‌های تازه و مواد اولیه باکیفیت، همان لحظه برای شما آماده می‌شود.</p>
          </header>
          <div className="menu-tabs" role="tablist" aria-label="دسته‌بندی منو">
            {orderedCategories.map((category) => (
              <button key={category.id} type="button" role="tab" aria-selected={selected === category.id} onClick={() => setSelected(category.id)}><span>{category.name}</span><small>{price.format(items.filter((item) => item.categoryId === category.id && item.available).length)}</small></button>
            ))}
          </div>
          <div className="menu-layout">
            <figure className="menu-photo">
              <div className="menu-photo__grooves" aria-hidden="true" />
              <img src="/assets/menu-signature-v2.webp" alt="لاته آرت و شیرینی تازه کافه صدا" loading="lazy" width="1122" height="1402" />
              <figcaption><span dir="ltr">CAFE SEDA — LISTENING BAR</span><p>قهوه، دقیقاً همان‌طور که باید باشد.</p></figcaption>
            </figure>
            <div className="menu-list" role="tabpanel" key={selected}>
              {visible.length ? visible.map((item, index) => (
                <article className="menu-item" key={item.id}>
                  <span className="menu-item__index">{price.format(index + 1).padStart(2, '۰')}</span>
                  <div><h3>{item.name}{item.featured && <small>انتخاب صدا</small>}</h3><p>{item.description}</p></div>
                  <strong>{price.format(item.price)} <small>تومان</small></strong>
                </article>
              )) : <p className="menu-empty">به‌زودی انتخاب‌های تازه اینجا قرار می‌گیرند.</p>}
              <div className="menu-list__footer"><span>هر فنجان، بخشی از یک تجربه شنیدنی‌ست.</span><i aria-hidden="true" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
