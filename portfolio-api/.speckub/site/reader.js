'use strict';
const data = JSON.parse(document.getElementById('spec-data').textContent);
const search = document.getElementById('search');
const method = document.getElementById('method');
const detail = document.getElementById('detail');
const nav = document.getElementById('endpoints');
const toc = document.getElementById('toc');
let renderVersion = 0;
const diagramCache = new Map();
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const methodBadge = (value) =>
  node('span', value, 'method method-' + value.toLowerCase());
document.title = data.title + ' · SpecKub';
document.getElementById('project-name').textContent = data.title;
document.getElementById('total').textContent = data.endpoints.length;
document.getElementById('diagram-count').textContent = data.endpoints.reduce(
  (n, e) => n + (e.html.match(/class="mermaid"/g) || []).length,
  0,
);
for (const name of [...new Set(data.endpoints.map((e) => e.method))].sort()) {
  const option = node('option', name);
  option.value = name;
  method.append(option);
}
if (globalThis.mermaid)
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'neutral',
    fontFamily: 'system-ui, sans-serif',
    flowchart: { htmlLabels: false },
    suppressErrorRendering: true,
    maxTextSize: 50000,
    secure: [
      'securityLevel',
      'startOnLoad',
      'maxTextSize',
      'suppressErrorRendering',
    ],
  });
function list() {
  nav.replaceChildren();
  const query = search.value.trim().toLowerCase();
  const selectedId = decodeHash()[0];
  const matches = data.endpoints.filter(
    (e) =>
      (!method.value || e.method === method.value) &&
      (!query || e.search.includes(query)),
  );
  for (const endpoint of matches) {
    const link = node('a', undefined, 'endpoint-link');
    link.href = '#' + encodeURIComponent(endpoint.id);
    if (selectedId === endpoint.id) link.setAttribute('aria-current', 'page');
    const row = node('span', undefined, 'endpoint-row');
    row.append(
      methodBadge(endpoint.method),
      node('span', endpoint.path, 'nav-route'),
    );
    link.append(row, node('span', endpoint.summary, 'nav-summary'));
    nav.append(link);
  }
  document.getElementById('result-count').textContent = matches.length;
  document.getElementById('no-results').hidden = matches.length > 0;
}
function decodeHash() {
  try {
    return location.hash.slice(1).split('/').map(decodeURIComponent);
  } catch {
    return [];
  }
}
async function show() {
  const version = ++renderVersion;
  const [id, heading] = decodeHash();
  const endpoint = id
    ? data.endpoints.find((e) => e.id === id)
    : data.endpoints[0];
  detail.replaceChildren();
  toc.replaceChildren();
  list();
  if (!endpoint) {
    detail.append(
      node('h2', id ? 'Endpoint not found' : 'No specifications yet'),
      node(
        'p',
        id
          ? 'Choose an endpoint from the navigation.'
          : 'Create valid specs in your docs directory, then rebuild this reader.',
      ),
    );
    return;
  }
  if (!id) {
    history.replaceState(null, '', '#' + encodeURIComponent(endpoint.id));
    list();
  }
  const header = node('div', undefined, 'endpoint-header');
  header.append(
    methodBadge(endpoint.method),
    node('code', endpoint.path, 'endpoint-path'),
  );
  const meta = node(
    'div',
    endpoint.id + ' · ' + endpoint.file,
    'endpoint-meta',
  );
  const copy = node('button', 'Copy route', 'copy-button');
  copy.type = 'button';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(
        endpoint.method + ' ' + endpoint.path,
      );
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Select and copy the route above';
    }
  });
  header.append(copy);
  detail.append(header, meta);
  const article = node('article', undefined, 'prose');
  // HTML is rendered at export time with raw HTML disabled and URL restrictions.
  article.innerHTML = endpoint.html;
  detail.append(article);
  for (const h of article.querySelectorAll('h2, h3')) {
    const a = node('a', h.textContent, h.tagName === 'H3' ? 'toc-sub' : '');
    a.href =
      '#' +
      encodeURIComponent(endpoint.id) +
      '/' +
      encodeURIComponent(h.dataset.anchor);
    toc.append(a);
  }
  if (endpoint.source.length) {
    const section = node('section', undefined, 'source-card');
    section.append(node('h2', 'Source references'));
    for (const file of endpoint.source) section.append(node('code', file));
    section.append(
      node(
        'p',
        'Reference paths only. Source files are not included in this export.',
      ),
    );
    detail.append(section);
  }
  if (heading)
    article.querySelectorAll('[data-anchor]').forEach((h) => {
      if (h.dataset.anchor === heading) h.scrollIntoView();
    });
  let index = 0;
  for (const block of article.querySelectorAll('pre.mermaid')) {
    const source = block.textContent;
    const key = endpoint.id + ':' + index++ + ':' + source;
    if (!globalThis.mermaid) continue;
    try {
      let svg = diagramCache.get(key);
      if (!svg) {
        const result = await mermaid.render(
          'diagram-' + version + '-' + index,
          source,
        );
        svg = result.svg;
        diagramCache.set(key, svg);
      }
      if (version !== renderVersion) return;
      const container = node('div', undefined, 'diagram');
      container.setAttribute('aria-label', 'Request flow diagram');
      container.innerHTML = svg;
      const code = node('details');
      code.append(node('summary', 'View diagram source'), node('pre', source));
      container.append(code);
      block.replaceWith(container);
    } catch {
      if (version !== renderVersion) return;
      block.before(
        node(
          'p',
          'Diagram could not be rendered. Its source is shown below.',
          'diagram-error',
        ),
      );
    }
  }
}
search.addEventListener('input', list);
method.addEventListener('change', list);
window.addEventListener('hashchange', show);
show();
