const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export function injectSeo(html, content, publicUrl) {
  const baseUrl = publicUrl.replace(/\/$/, '');
  const seo = content.seo;
  const site = content.site;
  const image = seo.ogImage?.startsWith('http') ? seo.ogImage : `${baseUrl}${seo.ogImage}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: site.name,
    description: seo.description,
    url: baseUrl,
    image,
    telephone: site.phone,
    address: { '@type': 'PostalAddress', streetAddress: site.address, addressCountry: 'IR' },
    servesCuisine: ['قهوه تخصصی', 'صبحانه', 'کیک و دسر'],
    priceRange: '$$',
  };

  return html
    .replaceAll('__SEO_TITLE__', escapeHtml(seo.title))
    .replaceAll('__SEO_DESCRIPTION__', escapeHtml(seo.description))
    .replaceAll('__SEO_KEYWORDS__', escapeHtml(seo.keywords))
    .replaceAll('__PUBLIC_URL__', escapeHtml(baseUrl))
    .replaceAll('__OG_IMAGE__', escapeHtml(image))
    .replace('<!-- STRUCTURED_DATA -->', `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>`);
}

