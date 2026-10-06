const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'i18n.js'), 'utf8');

function loadI18n(existingRoutes = []) {
  const requests = [];
  const routes = new Set(existingRoutes);
  const window = {
    location: { pathname: '/manu/blog/', search: '', hash: '', replace() {}, assign() {} },
    localStorage: { getItem() { return null; }, setItem() {} },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: routes.has(url) };
    }
  };
  const document = { readyState: 'loading', addEventListener() {} };
  vm.runInNewContext(source, { window, document, navigator: { languages: ['en'] }, Promise, Object, String, Array, RegExp });
  return { i18n: window.PkLavcI18n, requests };
}

async function run() {
  {
    const { i18n, requests } = loadI18n(['/manu/blog/pt/post-x/']);
    const route = await i18n.resolveLocalizedRoute(i18n.getEnglishRoute('/manu/blog/post-x/'), 'pt');
    assert.equal(route, '/manu/blog/pt/post-x/');
    assert.deepEqual(requests.map((request) => request.url), ['/manu/blog/pt/post-x/']);
    assert.equal(requests[0].options.method, 'HEAD');
  }
  {
    const { i18n } = loadI18n([]);
    const route = await i18n.resolveLocalizedRoute(i18n.getEnglishRoute('/manu/blog/post-x/'), 'pt');
    assert.equal(route, '/manu/blog/pt/');
  }
  {
    const { i18n } = loadI18n([]);
    const englishRoute = i18n.getEnglishRoute('/manu/blog/pt/post-x/');
    assert.equal(await i18n.resolveLocalizedRoute(englishRoute, 'es'), '/manu/blog/es/');
  }
  {
    const { i18n } = loadI18n(['/pt/sobre/']);
    assert.equal(await i18n.resolveLocalizedRoute('/manu/about/', 'pt'), '/pt/sobre/');
    assert.equal(await i18n.resolveLocalizedRoute('https://pklavc.com/projects/missing/', 'pt'), '/pt/');
    assert.doesNotMatch(i18n.getLocalizedRoute('/manu/blog/post-x/', 'en'), /^\/blog\/en\//);
  }
  {
    const { i18n, requests } = loadI18n([]);
    const route = i18n.getEnglishRoute('/manu/blog/post-x/');
    await i18n.resolveLocalizedRoute(route, 'es');
    await i18n.resolveLocalizedRoute(route, 'es');
    assert.equal(requests.length, 1, 'HEAD existence checks are cached per target route');
  }
}

run().then(() => console.log('Language-switch routing tests passed.')).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
