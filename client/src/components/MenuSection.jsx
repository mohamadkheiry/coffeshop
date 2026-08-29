import { useMemo, useState } from 'react';

const price = new Intl.NumberFormat('fa-IR');

export default function MenuSection({ categories, items }) {
  const orderedCategories = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);
  const [selected, setSelected] = useState(orderedCategories[0]?.id || '');
  const visible = items.filter((item) => item.categoryId === selected && item.available);

  return (
    <section id="menu" className="menu-section section" aria-labelledby="menu-title">
      <div className="shell">
        <div className="section-heading menu-section__heading">
          <div><span className="section-number">۰۱</span><h2 id="menu-title">منوی کافه صدا</h2></div>
          <p>هر انتخاب، با دانه‌های تازه و مواد اولیه باکیفیت آماده می‌شود.</p>
        </div>
        <div className="menu-tabs" role="tablist" aria-label="دسته‌بندی منو">
          {orderedCategories.map((category) => (
            <button key={category.id} type="button" role="tab" aria-selected={selected === category.id} onClick={() => setSelected(category.id)}>{category.name}</button>
          ))}
        </div>
        <div className="menu-layout">
          <figure className="menu-photo"><img src="/assets/menu-flat-white.webp" alt="فلت وایت کافه صدا با لاته آرت" loading="lazy" width="1024" height="1280" /><figcaption>قهوه، دقیقاً همان‌طور که باید باشد.</figcaption></figure>
          <div className="menu-list" role="tabpanel">
            {visible.length ? visible.map((item) => (
              <article className="menu-item" key={item.id}>
                <div><h3>{item.name}</h3><p>{item.description}</p></div>
                <strong>{price.format(item.price)} <small>تومان</small></strong>
              </article>
            )) : <p className="menu-empty">به‌زودی انتخاب‌های تازه اینجا قرار می‌گیرند.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
