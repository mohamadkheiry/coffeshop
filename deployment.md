# راهنمای استقرار و عملیات کافه صدا

روش پیشنهادی Production، اجرای برنامه در Docker و استفاده از Nginx میزبان به‌عنوان Reverse Proxy است. این راهنما برای Ubuntu 24.04/26.04 و دسترسی کاربر عضو گروه Docker نوشته شده است.

## ۱. آماده‌سازی سرور

```bash
docker --version
docker compose version
nginx -v
```

پورت‌های ۸۰ و ۴۴۳ باید در Firewall باز باشند. برنامه داخل Container روی ۳۰۰۰ اجرا می‌شود و فقط روی Loopback میزبان با `127.0.0.1:8088` در دسترس Nginx است.

## ۲. دریافت کد و تنظیم محیط

```bash
sudo mkdir -p /opt/cafe-seda
sudo chown "$USER":"$USER" /opt/cafe-seda
git clone https://github.com/mohamadkheiry/coffeshop.git /opt/cafe-seda
cd /opt/cafe-seda
cp .env.example .env
```

فایل `.env` را تنظیم کنید:

```dotenv
NODE_ENV=production
PORT=3000
PUBLIC_URL=http://192.168.10.111
JWT_SECRET=یک-رشته-تصادفی-بلند-حداقل-۳۲-کاراکتر
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
TRUST_PROXY=1
COOKIE_SECURE=false
BIND_ADDRESS=127.0.0.1
APP_PORT=8088
```

برای ساخت Secret امن:

```bash
openssl rand -hex 32
```

> رمز `admin123` مطابق محیط تست فعلی است. پیش از دسترسی اینترنتی، مقدار آن را تغییر دهید. فایل `.env` هرگز نباید Commit شود.

## ۳. ساخت و اجرای سرویس

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 cafe-seda
curl --fail http://127.0.0.1:8088/health
```

خروجی Health Check باید شامل `"status":"ok"` باشد.

اگر سرور از قبل روی پورت ۸۰ سرویس‌های دیگری دارد و فقط انتشار آزمایشی شبکه داخلی لازم است، Nginx را تغییر ندهید و در `.env` مقدار `BIND_ADDRESS=0.0.0.0` قرار دهید. آدرس تست در این حالت `http://SERVER_IP:8088` است. این پورت را فقط در شبکه مورد اعتماد باز کنید.

## ۴. Nginx

```bash
sudo cp nginx/cafe-seda.conf /etc/nginx/sites-available/cafe-seda
sudo ln -sfn /etc/nginx/sites-available/cafe-seda /etc/nginx/sites-enabled/cafe-seda
sudo nginx -t
sudo systemctl reload nginx
```

اگر Virtual Host دیگری `default_server` است، آن را با توجه به سرویس‌های موجود غیرفعال کنید؛ بدون بررسی، فایل‌های سایت‌های دیگر را حذف نکنید.

تست نهایی:

```bash
curl -I http://192.168.10.111/
curl http://192.168.10.111/health
```

## ۵. HTTPS و دامنه

پس از اتصال دامنه و تنظیم `server_name`، `PUBLIC_URL` را به آدرس HTTPS تغییر دهید و با Certbot گواهی بگیرید:

```bash
sudo certbot --nginx -d cafe.example.com
```

سپس `PUBLIC_URL` و Cookie امن را فعال کنید:

```bash
sed -i 's|PUBLIC_URL=.*|PUBLIC_URL=https://cafe.example.com|' .env
sed -i 's|COOKIE_SECURE=.*|COOKIE_SECURE=true|' .env
docker compose up -d
```

در شبکه آزمایشی HTTP مقدار `COOKIE_SECURE=false` اجازه ورود می‌دهد. به‌محض فعال‌سازی HTTPS آن را حتماً `true` کنید تا Cookie نشست فقط روی اتصال رمزگذاری‌شده ارسال شود.

## ۶. به‌روزرسانی بدون از دست‌رفتن محتوا

```bash
cd /opt/cafe-seda
git pull --ff-only
docker compose build --pull
docker compose up -d
docker image prune -f
curl --fail http://127.0.0.1:8088/health
```

داده و آپلودها در Volumeهای `cafe_seda_data` و `cafe_seda_uploads` نگهداری می‌شوند و با Build مجدد حذف نمی‌شوند. از اجرای `docker compose down -v` خودداری کنید؛ گزینه `-v` داده‌های پایدار را حذف می‌کند.

## ۷. پشتیبان‌گیری

یک مسیر امن خارج از پروژه بسازید:

```bash
sudo mkdir -p /var/backups/cafe-seda
```

پشتیبان‌گیری از Volumeها:

```bash
docker run --rm \
  -v cafe-seda_cafe_seda_data:/source:ro \
  -v /var/backups/cafe-seda:/backup \
  alpine tar czf /backup/data-$(date +%F-%H%M).tar.gz -C /source .

docker run --rm \
  -v cafe-seda_cafe_seda_uploads:/source:ro \
  -v /var/backups/cafe-seda:/backup \
  alpine tar czf /backup/uploads-$(date +%F-%H%M).tar.gz -C /source .
```

نام واقعی Volume را با `docker volume ls` بررسی کنید؛ Prefix معمولاً نام پوشه Compose است.

بازگردانی را فقط پس از توقف سرویس و با یک Backup تأییدشده انجام دهید:

```bash
docker compose stop
# آرشیو را داخل Volume متناظر استخراج کنید.
docker compose start
curl --fail http://127.0.0.1:8088/health
```

فرآیند Restore را حداقل هر فصل در محیط غیر Production آزمایش کنید.

## ۸. مشاهده وضعیت و لاگ

```bash
docker compose ps
docker compose logs -f --tail=200 cafe-seda
docker stats cafe-seda
curl -s http://127.0.0.1:8088/health
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

پایش پیشنهادی: درخواست دوره‌ای `/health` هر یک دقیقه، هشدار پس از سه خطای متوالی، کنترل فضای دیسک و تاریخ آخرین Backup.

## ۹. بازیابی خودکار بعد از قطع برق

Compose برای سرویس سیاست `restart: unless-stopped` دارد؛ بنابراین پس از بالا آمدن Docker، Container بدون اجرای دستی برمی‌گردد. Docker را در Boot سیستم فعال و وضعیت را کنترل کنید:

```bash
sudo systemctl enable --now docker
systemctl is-enabled docker
docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' cafe-seda
```

دو خروجی مورد انتظار به‌ترتیب `enabled` و `unless-stopped` هستند. برای شبیه‌سازی امن Restart میزبان، ابتدا از پنل مدیریت یک تغییر آزمایشی ذخیره کنید، سپس در یک بازه نگهداری سرور را Restart و این موارد را بررسی کنید:

```bash
sudo reboot
# پس از اتصال مجدد
systemctl is-active docker
docker compose -f /home/mr-kheiry/apps/cafe-seda/docker-compose.yml ps
curl --fail http://127.0.0.1:8088/health
```

حفظ تغییر آزمایشی بعد از Restart ثابت می‌کند هر دو Volume داده و آپلود نیز درست Mount شده‌اند. اگر Container پیش از Restart با دستور دستی `docker stop` متوقف شده باشد، رفتار `unless-stopped` عمداً آن را خودکار بالا نمی‌آورد؛ با `docker compose up -d` دوباره فعالش کنید.

## ۱۰. بازگشت نسخه (Rollback)

1. شناسه Commit پایدار قبلی را مشخص کنید.
2. از داده و آپلودها Backup بگیرید.
3. کد را روی همان Tag/Commit قرار دهید.
4. `docker compose up -d --build` را اجرا کنید.
5. Health، صفحه عمومی، ورود پنل و یک عملیات خواندن محتوا را تست کنید.

هیچ‌گاه برای Rollback از `git reset --hard` روی نسخه‌ای با تغییرات محلی ناشناخته استفاده نکنید. از Checkout یک Tag یا Worktree جداگانه استفاده کنید.

## ۱۱. چک‌لیست انتشار

- [ ] `npm run check` موفق است.
- [ ] `npm audit --omit=dev` آسیب‌پذیری High/Critical ندارد.
- [ ] `.env` معتبر و Secretها غیرپیش‌فرض‌اند.
- [ ] `PUBLIC_URL` دقیقاً با دامنه نهایی برابر است.
- [ ] Build و Health Check Container موفق است.
- [ ] Nginx Config با `nginx -t` تأیید شده است.
- [ ] صفحه اصلی در دسکتاپ و موبایل بررسی شده است.
- [ ] تعویض دسته‌های منو و گالری کار می‌کند.
- [ ] ورود، ویرایش منو، آپلود رسانه و Logout تست شده است.
- [ ] `robots.txt`، `sitemap.xml`، Meta و Structured Data بررسی شده‌اند.
- [ ] آخرین Backup قابل خواندن است و زمان آن ثبت شده است.
- [ ] سرویس Docker در Boot فعال و Restart Policy کانتینر `unless-stopped` است.
