import test from 'node:test';
import assert from 'node:assert/strict';
import { injectSeo } from './seo.js';

const content = {
  site: { name: 'کافه صدا', phone: '021', address: 'تهران' },
  seo: { title: 'کافه <صدا>', description: 'قهوه & موسیقی', keywords: 'قهوه', ogImage: '/hero.png' },
};

test('injectSeo renders safe metadata and local OG image URL', () => {
  const html = '<title>__SEO_TITLE__</title><meta content="__SEO_DESCRIPTION__"><meta content="__SEO_KEYWORDS__"><link href="__PUBLIC_URL__"><meta content="__OG_IMAGE__"><!-- STRUCTURED_DATA -->';
  const result = injectSeo(html, content, 'https://cafe.example/');
  assert.match(result, /کافه &lt;صدا&gt;/);
  assert.match(result, /قهوه &amp; موسیقی/);
  assert.match(result, /https:\/\/cafe\.example\/hero\.png/);
  assert.match(result, /CafeOrCoffeeShop/);
  assert.doesNotMatch(result, /__SEO_/);
});
