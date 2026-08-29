import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, Coffee, FileText, Gauge, Image, LogOut, Menu, Pencil, Plus, Search, Settings2, Trash2, Upload, X } from 'lucide-react';
import Brand from '../components/Brand';
import { api } from '../api';

const sections = [
  ['overview', 'نمای کلی', Gauge], ['menu', 'منو', Coffee], ['media', 'رسانه‌ها', Image], ['content', 'محتوای سایت', FileText], ['seo', 'تنظیمات سئو', Settings2],
];
const money = new Intl.NumberFormat('fa-IR');

function Field({ label, children, wide = false }) { return <label className={wide ? 'field field--wide' : 'field'}><span>{label}</span>{children}</label>; }

function MenuEditor({ content, refresh, notify }) {
  const empty = { name: '', description: '', price: '', categoryId: content.categories[0]?.id || '', available: true, featured: false };
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const filtered = content.menuItems.filter((item) => (category === 'all' || item.categoryId === category) && item.name.includes(query));
  const categoryMap = useMemo(() => new Map(content.categories.map((item) => [item.id, item.name])), [content.categories]);

  function openEditor(item) { setEditing(item || { id: null }); setForm(item ? { ...item } : empty); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      await api(editing.id ? `/api/admin/menu-items/${editing.id}` : '/api/admin/menu-items', { method: editing.id ? 'PUT' : 'POST', body: JSON.stringify({ ...form, price: Number(form.price) }) });
      await refresh(); setEditing(null); notify('آیتم منو با موفقیت ذخیره شد.');
    } catch (error) { notify(error.message, true); } finally { setSaving(false); }
  }
  async function remove(id) {
    if (!window.confirm('این آیتم از منو حذف شود؟')) return;
    try { await api(`/api/admin/menu-items/${id}`, { method: 'DELETE' }); await refresh(); notify('آیتم منو حذف شد.'); } catch (error) { notify(error.message, true); }
  }
  async function addCategory(event) {
    event.preventDefault(); if (!newCategory.trim()) return;
    try { await api('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name: newCategory }) }); setNewCategory(''); await refresh(); notify('دسته‌بندی اضافه شد.'); } catch (error) { notify(error.message, true); }
  }

  return <div className="admin-panel">
    <div className="admin-panel__header"><div><h1>مدیریت منو</h1><p>آیتم‌ها، قیمت‌ها و موجودی منوی کافه را به‌روز نگه دارید.</p></div><button className="admin-primary-button admin-primary-button--fit" onClick={() => openEditor()}><Plus /> افزودن آیتم</button></div>
    <div className="admin-toolbar"><label className="admin-search"><Search /><input placeholder="جستجو در آیتم‌ها…" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">همه دسته‌بندی‌ها</option>{content.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><form className="category-add" onSubmit={addCategory}><input placeholder="دسته جدید" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} /><button aria-label="افزودن دسته‌بندی"><Plus /></button></form></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>نام آیتم</th><th>دسته‌بندی</th><th>قیمت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.description}</small></td><td>{categoryMap.get(item.categoryId)}</td><td>{money.format(item.price)} تومان</td><td><span className={`status ${item.available ? 'status--on' : 'status--off'}`}>{item.available ? 'موجود' : 'ناموجود'}</span></td><td><div className="row-actions"><button onClick={() => openEditor(item)} aria-label={`ویرایش ${item.name}`}><Pencil /></button><button className="danger" onClick={() => remove(item.id)} aria-label={`حذف ${item.name}`}><Trash2 /></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-admin">آیتمی با این مشخصات پیدا نشد.</div>}</div>
    {editing && <div className="drawer-backdrop" onMouseDown={() => setEditing(null)}><form className="admin-drawer" onSubmit={save} onMouseDown={(e) => e.stopPropagation()}><div className="admin-drawer__header"><h2>{editing.id ? 'ویرایش آیتم' : 'افزودن آیتم'}</h2><button type="button" onClick={() => setEditing(null)}><X /></button></div><div className="admin-form-grid"><Field label="نام آیتم" wide><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field><Field label="توضیحات" wide><textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field><Field label="قیمت (تومان)"><input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></Field><Field label="دسته‌بندی"><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{content.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><label className="checkbox-field"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> موجود و قابل نمایش</label><label className="checkbox-field"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> انتخاب ویژه</label></div><div className="admin-drawer__footer"><button type="button" className="admin-secondary-button" onClick={() => setEditing(null)}>لغو</button><button className="admin-primary-button" disabled={saving}>{saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</button></div></form></div>}
  </div>;
}

function MediaManager({ content, refresh, notify }) {
  const [file, setFile] = useState(null); const [title, setTitle] = useState(''); const [busy, setBusy] = useState(false);
  async function uploadFile(event) {
    event.preventDefault(); if (!file) return;
    setBusy(true); const formData = new FormData(); formData.append('file', file); formData.append('title', title || file.name);
    try { await api('/api/admin/media', { method: 'POST', body: formData }); setFile(null); setTitle(''); event.currentTarget.reset(); await refresh(); notify('رسانه جدید بارگذاری شد.'); } catch (error) { notify(error.message, true); } finally { setBusy(false); }
  }
  async function remove(id) { if (!window.confirm('این رسانه حذف شود؟')) return; try { await api(`/api/admin/media/${id}`, { method: 'DELETE' }); await refresh(); notify('رسانه حذف شد.'); } catch (error) { notify(error.message, true); } }
  return <div className="admin-panel"><div className="admin-panel__header"><div><h1>رسانه‌ها</h1><p>تصاویر و ویدیوهای گالری عمومی را مدیریت کنید.</p></div></div><form className="media-upload" onSubmit={uploadFile}><Upload /><div><strong>تصویر یا ویدیو تازه</strong><small>تصاویر تا عرض ۱۹۲۰ پیکسل به WebP بهینه می‌شوند؛ حداکثر حجم ۵۰ مگابایت.</small></div><input type="text" placeholder="عنوان رسانه" value={title} onChange={(e) => setTitle(e.target.value)} /><label className="admin-secondary-button">انتخاب فایل<input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} hidden required /></label><button className="admin-primary-button admin-primary-button--fit" disabled={!file || busy}>{busy ? 'بارگذاری…' : 'انتشار'}</button>{file && <span className="selected-file">{file.name}</span>}</form><div className="media-grid">{[...content.media].sort((a,b) => a.order-b.order).map((item) => <article key={item.id}><div>{item.type === 'video' ? <video src={item.url} poster={item.poster} /> : <img src={item.url} alt={item.title} />}</div><span><strong>{item.title}</strong><small>{item.type === 'video' ? 'ویدیو' : 'تصویر'}</small></span><button onClick={() => remove(item.id)} aria-label={`حذف ${item.title}`}><Trash2 /></button></article>)}</div></div>;
}

function SettingsForm({ title, description, values, endpoint, fields, refresh, notify }) {
  const [form, setForm] = useState(values); const [busy, setBusy] = useState(false);
  useEffect(() => setForm(values), [values]);
  async function save(event) { event.preventDefault(); setBusy(true); try { await api(endpoint, { method: 'PUT', body: JSON.stringify(form) }); await refresh(); notify('تغییرات با موفقیت ذخیره شد.'); } catch (error) { notify(error.message, true); } finally { setBusy(false); } }
  return <div className="admin-panel"><div className="admin-panel__header"><div><h1>{title}</h1><p>{description}</p></div></div><form className="settings-form" onSubmit={save}>{fields.map((field) => <Field key={field.key} label={field.label} wide={field.wide}>{field.multiline ? <textarea rows={field.rows || 4} value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} /> : <input value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />}</Field>)}<div className="settings-form__actions"><button className="admin-primary-button admin-primary-button--fit" disabled={busy}>{busy ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</button></div></form></div>;
}

const siteFields = [
  { key:'name', label:'نام کافه' }, { key:'heroTitle', label:'عنوان اصلی', wide:true }, { key:'heroDescription', label:'توضیح بخش اول', multiline:true, wide:true }, { key:'storyTitle', label:'عنوان داستان' }, { key:'story', label:'متن داستان کافه', multiline:true, rows:6, wide:true }, { key:'phone', label:'تلفن' }, { key:'address', label:'نشانی', wide:true }, { key:'hours', label:'ساعت کاری' }, { key:'instagram', label:'اینستاگرام' }, { key:'mapUrl', label:'پیوند نقشه', wide:true },
];
const seoFields = [
  { key:'title', label:'عنوان سئو', wide:true }, { key:'description', label:'توضیحات متا', multiline:true, wide:true }, { key:'keywords', label:'کلمات کلیدی', multiline:true, wide:true }, { key:'ogImage', label:'تصویر اشتراک‌گذاری', wide:true },
];

export default function AdminPage() {
  const navigate = useNavigate(); const [content, setContent] = useState(null); const [active, setActive] = useState('menu'); const [mobileNav, setMobileNav] = useState(false); const [toast, setToast] = useState(null);
  const refresh = useCallback(async () => { try { setContent(await api('/api/admin/content')); } catch { sessionStorage.removeItem('cafe-seda-auth'); navigate('/admin/login', { replace: true }); } }, [navigate]);
  useEffect(() => { refresh(); }, [refresh]);
  function notify(message, error = false) { setToast({ message, error }); window.setTimeout(() => setToast(null), 3500); }
  async function logout() { await api('/api/auth/logout', { method: 'POST' }).catch(() => {}); sessionStorage.removeItem('cafe-seda-auth'); navigate('/admin/login', { replace: true }); }
  if (!content) return <div className="route-loading">در حال بارگذاری مدیریت…</div>;
  const contentPanel = active === 'menu' || active === 'overview' ? <MenuEditor content={content} refresh={refresh} notify={notify} /> : active === 'media' ? <MediaManager content={content} refresh={refresh} notify={notify} /> : active === 'content' ? <SettingsForm title="محتوای سایت" description="متن‌های اصلی و اطلاعات تماس سایت را ویرایش کنید." values={content.site} endpoint="/api/admin/site" fields={siteFields} refresh={refresh} notify={notify} /> : <SettingsForm title="تنظیمات سئو" description="نحوه نمایش کافه صدا در موتورهای جست‌وجو و شبکه‌های اجتماعی را کنترل کنید." values={content.seo} endpoint="/api/admin/seo" fields={seoFields} refresh={refresh} notify={notify} />;
  return <div className="admin-shell" dir="rtl"><Helmet><title>مدیریت سایت | کافه صدا</title><meta name="robots" content="noindex,nofollow" /></Helmet><aside className={`admin-sidebar${mobileNav ? ' admin-sidebar--open' : ''}`}><div className="admin-sidebar__brand"><Brand /><small>پنل مدیریت</small></div><nav>{sections.map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => { setActive(id === 'overview' ? 'menu' : id); setMobileNav(false); }}><Icon />{label}</button>)}</nav><div className="admin-sidebar__bottom"><a href="/" target="_blank">نمایش سایت</a><button onClick={logout}><LogOut />خروج</button></div></aside><main className="admin-main"><div className="admin-mobile-header"><button onClick={() => setMobileNav((value) => !value)}>{mobileNav ? <X /> : <Menu />}</button><Brand compact /></div>{contentPanel}</main>{toast && <div className={`admin-toast${toast.error ? ' admin-toast--error' : ''}`}><Check />{toast.message}</div>}</div>;
}
