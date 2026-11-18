(function () {
  var S = window.SITE;
  var view = document.getElementById('view');
  var crumbs = document.getElementById('crumbs');
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  function fa(n) { return String(n).replace(/\d/g, function (d) { return FA[d]; }); }

  function el(tag, attrs) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c !== null && c !== undefined && c !== false) e.append(c);
    }
    return e;
  }

  var SPROUTS = {
    1: '<svg viewBox="0 0 64 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M32 76V42"/><path d="M32 44C32 32 22 27 11 30C11 41 20 46 32 44Z" fill="currentColor" stroke="none" opacity=".55"/><path d="M32 40C32 29 40 24 52 26C52 37 44 42 32 40Z" fill="currentColor" stroke="none"/></svg>',
    2: '<svg viewBox="0 0 64 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M32 96V30"/><path d="M32 72C32 60 21 55 9 58C9 69 19 74 32 72Z" fill="currentColor" stroke="none" opacity=".5"/><path d="M32 60C32 48 43 43 55 46C55 57 45 62 32 60Z" fill="currentColor" stroke="none" opacity=".75"/><path d="M32 44C32 32 22 27 11 30C11 41 20 46 32 44Z" fill="currentColor" stroke="none" opacity=".75"/><path d="M32 34C32 22 40 15 52 17C52 29 44 36 32 34Z" fill="currentColor" stroke="none"/></svg>',
    3: '<svg viewBox="0 0 90 130" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M45 126V62M45 98L28 80M45 88L62 72"/><circle cx="45" cy="38" r="26" fill="currentColor" stroke="none"/><circle cx="22" cy="62" r="17" fill="currentColor" stroke="none" opacity=".7"/><circle cx="68" cy="60" r="19" fill="currentColor" stroke="none" opacity=".85"/></svg>'
  };

  function poo(id) { return S.pooyesh.filter(function (p) { return p.id === id; })[0]; }
  function sub(id) { return S.subjects.filter(function (s) { return s.id === id; })[0]; }
  function worksOf(p, s) { return S.works.filter(function (w) { return w.pooyesh === p && w.subject === s; }); }
  function studentsOf(p, s) {
    var seen = {}, out = [];
    worksOf(p, s).forEach(function (w) { if (!seen[w.name]) { seen[w.name] = 1; out.push(w.name); } });
    return out;
  }

  function setCrumbs(items) {
    crumbs.textContent = '';
    items.forEach(function (it, i) {
      if (i) crumbs.append(el('span', { class: 'sep', 'aria-hidden': 'true' }, '›'));
      crumbs.append(it.href ? el('a', { href: it.href }, it.label) : el('span', { class: 'here' }, it.label));
    });
  }

  function head(title, text) {
    return el('div', { class: 'page-head' }, el('h2', null, title), text ? el('p', null, text) : null);
  }
  function empty(msg) { return el('div', { class: 'empty' }, msg); }

  function home() {
    setCrumbs([]);
    var hero = el('section', { class: 'hero' },
      el('div', { class: 'hero-inner' },
        el('div', { class: 'hero-text' },
          el('h1', null, S.schoolName),
          el('p', null, 'پویش خودت را انتخاب کن و درس‌ها و کارهای دانش‌آموزان را ببین.')),
        el('div', { class: 'hero-logo' }, el('img', { src: 'img/logo.jpg', alt: 'آرم مدرسه نمونه رشد', width: '640', height: '640' })))
    );
    var grid = el('div', { class: 'grid three home-cards' });
    S.pooyesh.forEach(function (p) {
      grid.append(el('a', { class: 'card pooyesh', href: '#/p/' + p.id, 'data-stage': p.id },
        el('div', { class: 'stage', 'aria-hidden': 'true', html: SPROUTS[p.id] }),
        el('div', { class: 'txt' }, el('div', null, el('h3', null, p.title), el('span', { class: 'meta' }, fa(S.subjects.length) + ' درس')), el('span', { class: 'go', 'aria-hidden': 'true' }, '←'))
      ));
    });
    var jz = el('a', { class: 'card wide', href: 'jozve/' },
      el('div', { class: 'glyph jz', 'aria-hidden': 'true', html: LOCK }),
      el('div', { class: 'txt2' }, el('h3', null, 'جزوه و تکالیف'), el('span', { class: 'meta' }, 'ورود با رمز')),
      el('span', { class: 'go', 'aria-hidden': 'true' }, '←'));
    view.replaceChildren(hero, grid, jz);
  }

  function pooyeshPage(pid) {
    var p = poo(pid); if (!p) return notFound();
    setCrumbs([{ label: 'خانه', href: '#/' }, { label: p.title }]);
    var grid = el('div', { class: 'grid' });
    S.subjects.forEach(function (s) {
      var n = studentsOf(pid, s.id).length;
      grid.append(el('a', { class: 'card s-' + s.id, href: '#/p/' + pid + '/' + s.id },
        el('div', { class: 'glyph', 'aria-hidden': 'true' }, s.glyph),
        el('h3', null, s.title),
        el('div', { class: 'row' }, el('span', { class: 'meta' }, n ? fa(n) + ' دانش‌آموز' : 'هنوز دانش‌آموزی نیست'), el('span', { class: 'go', 'aria-hidden': 'true' }, '←'))));
    });
    view.replaceChildren(head(p.title, 'یک درس را انتخاب کن.'), grid);
  }

  function subjectPage(pid, sid) {
    var p = poo(pid), s = sub(sid); if (!p || !s) return notFound();
    setCrumbs([{ label: 'خانه', href: '#/' }, { label: p.title, href: '#/p/' + pid }, { label: s.title }]);
    var names = studentsOf(pid, sid), node;
    if (!names.length) node = empty('هنوز دانش‌آموزی در این درس ثبت نشده است.');
    else {
      node = el('div', { class: 'grid' });
      names.forEach(function (n) {
        var c = worksOf(pid, sid).filter(function (w) { return w.name === n; }).length;
        node.append(el('a', { class: 'card', href: '#/p/' + pid + '/' + sid + '/' + encodeURIComponent(n) },
          el('div', { class: 'avatar', 'aria-hidden': 'true' }, n.charAt(0)),
          el('h3', null, n),
          el('div', { class: 'row' }, el('span', { class: 'meta' }, fa(c) + ' کار'), el('span', { class: 'go', 'aria-hidden': 'true' }, '←'))));
      });
    }
    view.replaceChildren(head('درس ' + s.title, 'دانش‌آموزی را انتخاب کن.'), node);
  }

  function studentPage(pid, sid, name) {
    var p = poo(pid), s = sub(sid); if (!p || !s) return notFound();
    var list = worksOf(pid, sid).filter(function (w) { return w.name === name; });
    if (!list.length) return notFound();
    setCrumbs([{ label: 'خانه', href: '#/' }, { label: p.title, href: '#/p/' + pid }, { label: s.title, href: '#/p/' + pid + '/' + sid }, { label: name }]);
    var grid = el('div', { class: 'grid' });
    list.forEach(function (w, i) {
      grid.append(el('div', { class: 'card work' },
        list.length > 1 ? el('span', { class: 'num', 'aria-hidden': 'true' }, fa(i + 1)) : null,
        el('h3', null, w.description || w.file),
        el('span', { class: 'file' }, w.file),
        el('a', { class: 'btn', href: '#/p/' + pid + '/' + sid + '/' + encodeURIComponent(name) + '/' + (i + 1) }, 'باز کردن')));
    });
    view.replaceChildren(head(name, 'کارهای ' + s.title + ' در ' + p.title), grid);
  }

  function viewerPage(pid, sid, name, idx) {
    var p = poo(pid), s = sub(sid); if (!p || !s) return notFound();
    var list = worksOf(pid, sid).filter(function (w) { return w.name === name; });
    var w = list[idx - 1]; if (!w) return notFound();
    var back = '#/p/' + pid + '/' + sid + '/' + encodeURIComponent(name);
    var src = S.filesFolder + encodeURI(w.file);
    var label = (list.length > 1 ? fa(idx) + '. ' : '') + (w.description || w.file);
    setCrumbs([]);
    shell(label, src, back, '← کارها');
    document.title = w.description + ' | ' + S.schoolName;
  }

  var LOCK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  function shell(label, src, back, backText) {
    view.replaceChildren(el('div', { class: 'viewer' },
      el('div', { class: 'vbar' },
        el('a', { class: 'vbtn home', href: '#/' }, '⌂ خانه'),
        el('a', { class: 'vbtn', href: back }, backText),
        el('span', { class: 'vtitle' }, label),
        el('a', { class: 'vbtn ghost', href: src, target: '_blank', rel: 'noopener', title: 'باز کردن در تب جدید', 'aria-label': 'باز کردن در تب جدید' }, '↗')),
      el('iframe', { class: 'vframe', src: src, title: label, allow: 'fullscreen' })));
  }

  function notFound() {
    setCrumbs([{ label: 'خانه', href: '#/' }]);
    view.replaceChildren(empty('این صفحه پیدا نشد. از خانه دوباره شروع کن.'));
  }

  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(function (x) {
      try { return decodeURIComponent(x); } catch (e) { return x; }
    });
    document.body.classList.toggle('viewing', (parts[0] === 'p' && parts.length === 5));
    if (parts[0] !== 'p') home();
    else if (parts.length === 2) pooyeshPage(+parts[1]);
    else if (parts.length === 3) subjectPage(+parts[1], parts[2]);
    else if (parts.length === 4) studentPage(+parts[1], parts[2], parts[3]);
    else if (parts.length === 5) viewerPage(+parts[1], parts[2], parts[3], +parts[4]);
    else home();
    view.classList.remove('fade'); void view.offsetWidth; view.classList.add('fade');
    window.scrollTo(0, 0);
    var last = crumbs.lastChild ? crumbs.lastChild.textContent : '';
    if (!document.body.classList.contains('viewing')) document.title = (last ? last + ' | ' : '') + S.schoolName;
  }
  window.addEventListener('hashchange', route);
  route();

  var modal = document.getElementById('makerModal');
  function openMaker() { modal.hidden = false; document.getElementById('makerClose').focus(); }
  function closeMaker() { modal.hidden = true; document.getElementById('makerBtn').focus(); }
  document.getElementById('makerBtn').addEventListener('click', openMaker);
  document.getElementById('makerClose').addEventListener('click', closeMaker);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeMaker(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeMaker(); });

  var root = document.documentElement;
  try { var t = localStorage.getItem('nr-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  document.getElementById('themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('nr-theme', next); } catch (e) {}
  });
})();
