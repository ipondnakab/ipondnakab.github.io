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
const navigationView = document.getElementById('navigation-view');
const treeDepth = document.getElementById('tree-depth');
let preferences = { view: 'list', depth: 2 };
try {
  const stored = JSON.parse(
    localStorage.getItem('speckub-reader-navigation') ?? 'null',
  );
  if (stored?.view === 'tree') preferences.view = 'tree';
  if (
    Number.isInteger(stored?.depth) &&
    stored.depth >= 1 &&
    stored.depth <= 12
  )
    preferences.depth = stored.depth;
} catch {
  /* File URLs and privacy settings may block storage. */
}
navigationView.value = preferences.view;
treeDepth.value = String(preferences.depth);
function updateNavigation() {
  preferences = {
    view: navigationView.value === 'tree' ? 'tree' : 'list',
    depth: Math.min(12, Math.max(1, Math.trunc(Number(treeDepth.value)) || 2)),
  };
  treeDepth.value = String(preferences.depth);
  try {
    localStorage.setItem(
      'speckub-reader-navigation',
      JSON.stringify(preferences),
    );
  } catch {
    /* Optional persistence. */
  }
  list(true);
}
const collapsedPaths = new Set();
let treeFiltered = false;
function pathTree(endpoints) {
  const root = { path: '', children: new Map(), endpoints: [], count: 0 };
  for (const endpoint of [...endpoints].sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.method.localeCompare(b.method) ||
      a.id.localeCompare(b.id),
  )) {
    let branch = root;
    branch.count++;
    const segments =
      endpoint.path === '/' ? [] : endpoint.path.slice(1).split('/');
    for (const segment of segments) {
      const path = branch.path + '/' + segment;
      if (!branch.children.has(segment))
        branch.children.set(segment, {
          segment,
          path,
          children: new Map(),
          endpoints: [],
          count: 0,
        });
      branch = branch.children.get(segment);
      branch.count++;
    }
    branch.endpoints.push(endpoint);
  }
  return root;
}
function branchEndpoints(branch) {
  const endpoints = [];
  const pending = [branch];
  while (pending.length) {
    const current = pending.pop();
    endpoints.push(...current.endpoints);
    pending.push(...current.children.values());
  }
  return endpoints.sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.method.localeCompare(b.method) ||
      a.id.localeCompare(b.id),
  );
}
function navigationLabel(path, prefix = '') {
  const relative = prefix ? path.slice(prefix.length) || '/' : path;
  const segments = relative.slice(1).split('/');
  if (segments.length <= 4) return relative;
  const tail = segments.slice(-2).join('/');
  return prefix
    ? '…/' + tail
    : '/' + segments.slice(0, 2).join('/') + '/…/' + tail;
}
function list(revealSelected = false) {
  document.getElementById('tree-depth-setting').hidden =
    preferences.view !== 'tree';
  nav.dataset.view = preferences.view;
  if (!treeFiltered) {
    for (const group of nav.querySelectorAll('details[data-path]')) {
      if (group.open) collapsedPaths.delete(group.dataset.path);
      else collapsedPaths.add(group.dataset.path);
    }
  }
  treeFiltered = Boolean(search.value.trim() || method.value);
  nav.replaceChildren();
  const query = search.value.trim().toLowerCase();
  const selectedId = decodeHash()[0];
  const matches = data.endpoints.filter(
    (e) =>
      (!method.value || e.method === method.value) &&
      (!query || e.search.includes(query)),
  );
  const selectedPath = data.endpoints.find((e) => e.id === selectedId)?.path;
  function renderEndpoint(endpoint, container, prefix = '') {
    const link = node('a', undefined, 'endpoint-link');
    link.href = '#' + encodeURIComponent(endpoint.id);
    if (selectedId === endpoint.id) link.setAttribute('aria-current', 'page');
    const row = node('span', undefined, 'endpoint-row');
    row.append(
      methodBadge(endpoint.method),
      node('span', navigationLabel(endpoint.path, prefix), 'nav-route'),
    );
    link.append(row, node('span', endpoint.summary, 'nav-summary'));
    link.title = endpoint.method + ' ' + endpoint.path;
    link.setAttribute(
      'aria-label',
      endpoint.method + ' ' + endpoint.path + ' ' + endpoint.summary,
    );
    container.append(link);
  }
  function renderBranch(branch, container, level = 0) {
    if (level >= preferences.depth) {
      for (const endpoint of branchEndpoints(branch))
        renderEndpoint(endpoint, container, branch.path);
      return;
    }
    for (const endpoint of branch.endpoints)
      renderEndpoint(endpoint, container, branch.path);
    for (const child of branch.children.values()) {
      if (!child.children.size) {
        for (const endpoint of child.endpoints)
          renderEndpoint(endpoint, container, branch.path);
        continue;
      }
      if (
        revealSelected &&
        (selectedPath === child.path ||
          selectedPath?.startsWith(child.path + '/'))
      ) {
        collapsedPaths.delete(child.path);
      }
      const group = node('details', undefined, 'path-group');
      group.dataset.path = child.path;
      group.dataset.depth = String(level + 1);
      group.open =
        Boolean(query || method.value) || !collapsedPaths.has(child.path);
      const label = node('summary', undefined, 'path-group-label');
      label.title = child.path;
      label.append(
        node('span', child.segment || '/', 'path-segment'),
        node('span', child.count, 'path-count'),
      );
      const children = node('div', undefined, 'path-children');
      renderBranch(child, children, level + 1);
      group.append(label, children);
      container.append(group);
    }
  }
  const tree = pathTree(matches);
  if (preferences.view === 'tree') renderBranch(tree, nav);
  else
    for (const endpoint of branchEndpoints(tree)) renderEndpoint(endpoint, nav);
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
  list(true);
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
    list(true);
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
navigationView.addEventListener('change', updateNavigation);
treeDepth.addEventListener('change', updateNavigation);
search.addEventListener('input', () => list());
method.addEventListener('change', () => list());
window.addEventListener('hashchange', show);
show();
