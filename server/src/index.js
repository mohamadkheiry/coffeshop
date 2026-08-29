import path from 'node:path';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import { initializeStore, getContent, getUsers, updateContent, uploadsDir } from './store.js';
import { clearAuthCookie, createToken, requireAuth, setAuthCookie } from './auth.js';
import { injectSeo } from './seo.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const publicUrl = process.env.PUBLIC_URL || `http://localhost:${port}`;
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDist = path.resolve(serverRoot, '..', 'client', 'dist');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const allowed = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    callback(allowed ? null : new Error('فقط فایل تصویر یا ویدیو مجاز است.'), allowed);
  },
});

if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      mediaSrc: ["'self'", 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'تعداد تلاش‌ها زیاد بود؛ کمی بعد دوباره امتحان کنید.' },
});

app.get('/health', (_request, response) => response.json({ status: 'ok', service: 'cafe-seda' }));
app.get('/api/content', async (_request, response, next) => {
  try { response.json(await getContent()); } catch (error) { next(error); }
});
app.get('/robots.txt', (_request, response) => {
  response.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${publicUrl.replace(/\/$/, '')}/sitemap.xml\n`);
});
app.get('/sitemap.xml', (_request, response) => {
  const base = publicUrl.replace(/\/$/, '');
  response.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`);
});

app.post('/api/auth/login', loginLimiter, async (request, response, next) => {
  try {
    const username = String(request.body.username || '').trim();
    const password = String(request.body.password || '');
    const { users } = await getUsers();
    const user = users.find((candidate) => candidate.username === username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ message: 'نام کاربری یا رمز عبور درست نیست.' });
    }
    setAuthCookie(response, createToken(user));
    return response.json({ user: { username: user.username, role: user.role } });
  } catch (error) { return next(error); }
});
app.post('/api/auth/logout', (_request, response) => {
  clearAuthCookie(response);
  response.status(204).end();
});
app.get('/api/auth/me', requireAuth, (request, response) => response.json({ user: request.user }));

app.get('/api/admin/content', requireAuth, async (_request, response, next) => {
  try { response.json(await getContent()); } catch (error) { next(error); }
});

app.put('/api/admin/site', requireAuth, async (request, response, next) => {
  try {
    const allowed = ['name', 'heroTitle', 'heroDescription', 'storyTitle', 'story', 'phone', 'address', 'hours', 'instagram', 'mapUrl'];
    const result = await updateContent((content) => {
      for (const key of allowed) if (typeof request.body[key] === 'string') content.site[key] = request.body[key].trim();
      return content;
    });
    response.json(result.site);
  } catch (error) { next(error); }
});

app.put('/api/admin/seo', requireAuth, async (request, response, next) => {
  try {
    const allowed = ['title', 'description', 'keywords', 'ogImage'];
    const result = await updateContent((content) => {
      for (const key of allowed) if (typeof request.body[key] === 'string') content.seo[key] = request.body[key].trim();
      return content;
    });
    response.json(result.seo);
  } catch (error) { next(error); }
});

app.post('/api/admin/categories', requireAuth, async (request, response, next) => {
  try {
    const name = String(request.body.name || '').trim();
    if (!name) return response.status(400).json({ message: 'نام دسته‌بندی الزامی است.' });
    const category = { id: crypto.randomUUID(), name, order: Number(request.body.order || 99) };
    await updateContent((content) => ({ ...content, categories: [...content.categories, category] }));
    return response.status(201).json(category);
  } catch (error) { return next(error); }
});

app.put('/api/admin/categories/:id', requireAuth, async (request, response, next) => {
  try {
    let updated;
    await updateContent((content) => {
      const index = content.categories.findIndex((item) => item.id === request.params.id);
      if (index < 0) throw Object.assign(new Error('دسته‌بندی پیدا نشد.'), { status: 404 });
      updated = { ...content.categories[index], name: String(request.body.name || content.categories[index].name).trim(), order: Number(request.body.order ?? content.categories[index].order) };
      content.categories[index] = updated;
      return content;
    });
    response.json(updated);
  } catch (error) { next(error); }
});

app.delete('/api/admin/categories/:id', requireAuth, async (request, response, next) => {
  try {
    await updateContent((content) => {
      if (content.menuItems.some((item) => item.categoryId === request.params.id)) throw Object.assign(new Error('ابتدا آیتم‌های این دسته را جابه‌جا کنید.'), { status: 409 });
      content.categories = content.categories.filter((item) => item.id !== request.params.id);
      return content;
    });
    response.status(204).end();
  } catch (error) { next(error); }
});

function normalizeMenuItem(body, current = {}) {
  const item = {
    ...current,
    name: String(body.name ?? current.name ?? '').trim(),
    description: String(body.description ?? current.description ?? '').trim(),
    price: Math.max(0, Number(body.price ?? current.price ?? 0)),
    categoryId: String(body.categoryId ?? current.categoryId ?? ''),
    available: body.available === undefined ? (current.available ?? true) : Boolean(body.available),
    featured: body.featured === undefined ? Boolean(current.featured) : Boolean(body.featured),
  };
  if (!item.name || !item.categoryId || !Number.isFinite(item.price)) throw Object.assign(new Error('نام، دسته‌بندی و قیمت معتبر الزامی است.'), { status: 400 });
  return item;
}

app.post('/api/admin/menu-items', requireAuth, async (request, response, next) => {
  try {
    const item = { id: crypto.randomUUID(), ...normalizeMenuItem(request.body) };
    await updateContent((content) => {
      if (!content.categories.some((category) => category.id === item.categoryId)) throw Object.assign(new Error('دسته‌بندی معتبر نیست.'), { status: 400 });
      content.menuItems.push(item);
      return content;
    });
    response.status(201).json(item);
  } catch (error) { next(error); }
});

app.put('/api/admin/menu-items/:id', requireAuth, async (request, response, next) => {
  try {
    let updated;
    await updateContent((content) => {
      const index = content.menuItems.findIndex((item) => item.id === request.params.id);
      if (index < 0) throw Object.assign(new Error('آیتم منو پیدا نشد.'), { status: 404 });
      updated = { id: content.menuItems[index].id, ...normalizeMenuItem(request.body, content.menuItems[index]) };
      content.menuItems[index] = updated;
      return content;
    });
    response.json(updated);
  } catch (error) { next(error); }
});

app.delete('/api/admin/menu-items/:id', requireAuth, async (request, response, next) => {
  try {
    await updateContent((content) => ({ ...content, menuItems: content.menuItems.filter((item) => item.id !== request.params.id) }));
    response.status(204).end();
  } catch (error) { next(error); }
});

app.post('/api/admin/media', requireAuth, upload.single('file'), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ message: 'یک فایل برای بارگذاری انتخاب کنید.' });
    const id = crypto.randomUUID();
    const isImage = request.file.mimetype.startsWith('image/');
    const extension = isImage ? 'webp' : (path.extname(request.file.originalname).slice(1).toLowerCase() || 'mp4');
    const fileName = `${id}.${extension}`;
    const target = path.join(uploadsDir, fileName);
    if (isImage) {
      await sharp(request.file.buffer).rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(target);
    } else {
      await writeFile(target, request.file.buffer);
    }
    const media = {
      id,
      type: isImage ? 'image' : 'video',
      title: String(request.body.title || request.file.originalname).trim(),
      url: `/uploads/${fileName}`,
      poster: String(request.body.poster || ''),
      order: Number(request.body.order || Date.now()),
    };
    await updateContent((content) => ({ ...content, media: [...content.media, media] }));
    return response.status(201).json(media);
  } catch (error) { return next(error); }
});

app.delete('/api/admin/media/:id', requireAuth, async (request, response, next) => {
  try {
    let removed;
    await updateContent((content) => {
      removed = content.media.find((item) => item.id === request.params.id);
      content.media = content.media.filter((item) => item.id !== request.params.id);
      return content;
    });
    if (removed?.url?.startsWith('/uploads/')) await unlink(path.join(uploadsDir, path.basename(removed.url))).catch(() => {});
    response.status(204).end();
  } catch (error) { next(error); }
});

app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', immutable: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist, { maxAge: '1y', immutable: true, index: false }));
  app.get(/^(?!\/api\/|\/uploads\/|\/health$).*/, async (request, response, next) => {
    try {
      const html = await readFile(path.join(clientDist, 'index.html'), 'utf8');
      const content = await getContent();
      const noIndex = request.path.startsWith('/admin') ? '<meta name="robots" content="noindex,nofollow">' : '';
      response.set('Cache-Control', 'no-cache').send(injectSeo(html.replace('<!-- ADMIN_ROBOTS -->', noIndex), content, publicUrl));
    } catch (error) { next(error); }
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.status || (error instanceof multer.MulterError ? 400 : 500)).json({
    message: error.status || error instanceof multer.MulterError ? error.message : 'خطای پیش‌بینی‌نشده‌ای رخ داد.',
  });
});

await initializeStore();

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => console.log(`Cafe Seda is listening on ${port}`));
}

export default app;
