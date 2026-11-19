/* جزوه و تکالیف (بخش عمومی) + ابزارهای مشترک برای بخش مدیریت */
(function () {
  var JZ = window.JZ, items = window.JZ_ITEMS || [], D = document.body.dataset, UP = D.up || '';
  var view = document.getElementById('view'), crumbs = document.getElementById('crumbs'), mem = {};
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
  var LOCK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var EYE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYEOFF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>';
  /* کادر رمز با دکمه‌ی دیدن/پنهان کردن در گوشه */
  function pw(inp) {
    var b = el('button', { type: 'button', class: 'pw-eye', 'aria-label': 'نمایش رمز', html: EYE });
    b.onclick = function () {
      var show = inp.type === 'password'; inp.type = show ? 'text' : 'password';
      b.innerHTML = show ? EYEOFF : EYE; b.setAttribute('aria-label', show ? 'پنهان کردن رمز' : 'نمایش رمز'); inp.focus();
    };
    return el('div', { class: 'pw-wrap' }, inp, b);
  }
  function sub(id) { return JZ.subjects.filter(function (s) { return s.id === id; })[0]; }
  function sec(id) { return JZ.sections.filter(function (s) { return s.id === id; })[0]; }
  function setCrumbs(list) {
    crumbs.textContent = '';
    list.forEach(function (it, i) {
      if (i) crumbs.append(el('span', { class: 'sep', 'aria-hidden': 'true' }, '›'));
      crumbs.append(it.href ? el('a', { href: it.href }, it.label) : el('span', { class: 'here' }, it.label));
    });
  }
  function head(t, p) { return el('div', { class: 'page-head' }, el('h2', null, t), p ? el('p', null, p) : null); }
  function empty(t) { return el('div', { class: 'empty' }, t); }

  /* ---- صفحه‌ی رمز (برای بخش عمومی و مدیریت) ---- */
  function gate(g, key, title, text, done) {
    try { if (mem[key] || sessionStorage.getItem(key) === '1') return done(); } catch (e) { if (mem[key]) return done(); }
    var inp = el('input', { type: 'password', class: 'pw', placeholder: 'رمز را وارد کن', autocomplete: 'off', dir: 'ltr', 'aria-label': 'رمز' });
    var msg = el('p', { class: 'pw-msg', role: 'alert' });
    var btn = el('button', { type: 'submit', class: 'btn pw-btn' }, 'ورود');
    var form = el('form', { class: 'card lock' }, el('div', { class: 'lock-ico', 'aria-hidden': 'true', html: LOCK }), el('h2', null, title), el('p', { class: 'meta' }, text), pw(inp), msg, btn);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); btn.disabled = true; msg.textContent = '';
      setTimeout(function () {
        if (window.nrHash(inp.value.trim(), g.salt, g.iter) === g.hash) {
          mem[key] = 1; try { sessionStorage.setItem(key, '1'); } catch (x) {}
          done();
        } else {
          msg.textContent = 'رمز اشتباه است.'; inp.value = ''; btn.disabled = false;
          form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); inp.focus();
        }
      }, 400);
    });
    view.replaceChildren(el('div', { class: 'lock-wrap' }, form));
    inp.focus();
  }

  function count(sid, cid) { return items.filter(function (x) { return x.subject === sid && (!cid || x.section === cid); }).length; }
  function lockBtn() {
    var b = el('button', { type: 'button', class: 'vbtn' }, '🔒 قفل کردن');
    b.onclick = function () { mem['nr-jz'] = 0; try { sessionStorage.removeItem('nr-jz'); } catch (e) {} location.href = UP + 'jozve/'; };
    return b;
  }
  function crumbBase() { return [{ label: 'خانه', href: UP + 'index.html' }, { label: 'جزوه و تکالیف', href: UP + 'jozve/' }]; }

  function subjectsView() {
    setCrumbs([{ label: 'خانه', href: UP + 'index.html' }, { label: 'جزوه و تکالیف' }]);
    var grid = el('div', { class: 'grid' });
    JZ.subjects.forEach(function (s) {
      var n = count(s.id);
      grid.append(el('a', { class: 'card ' + s.cls, href: UP + 'jozve/' + s.id + '/' },
        el('div', { class: 'glyph', 'aria-hidden': 'true' }, s.glyph),
        el('h3', null, s.title),
        el('div', { class: 'row' }, el('span', { class: 'meta' }, n ? fa(n) + ' مطلب' : 'هنوز مطلبی نیست'), el('span', { class: 'go', 'aria-hidden': 'true' }, '←'))));
    });
    view.replaceChildren(el('div', { class: 'jz-head' }, head('جزوه و تکالیف', 'درس را انتخاب کن.'), lockBtn()), grid);
  }

  function subjectView(sid) {
    var s = sub(sid); if (!s) return;
    setCrumbs(crumbBase().concat([{ label: s.title }]));
    var grid = el('div', { class: 'grid' });
    JZ.sections.forEach(function (c) {
      var n = count(sid, c.id);
      grid.append(el('a', { class: 'card ' + c.cls, href: UP + 'jozve/' + sid + '/' + c.id + '/' },
        el('div', { class: 'glyph', 'aria-hidden': 'true' }, c.glyph),
        el('h3', null, c.title),
        el('div', { class: 'row' }, el('span', { class: 'meta' }, n ? fa(n) + ' مطلب' : 'هنوز مطلبی نیست'), el('span', { class: 'go', 'aria-hidden': 'true' }, '←'))));
    });
    view.replaceChildren(head(s.title, 'یک بخش را انتخاب کن.'), grid);
  }

  function titleOf(it, s) {
    return it.section === 'dars' ? s.title + ' - ' + it.title : it.section === 'takalif' ? it.title + ' - ' + s.title : it.title;
  }

  function sectionView(sid, cid) {
    var s = sub(sid), c = sec(cid); if (!s || !c) return;
    setCrumbs(crumbBase().concat([{ label: s.title, href: UP + 'jozve/' + sid + '/' }, { label: c.title }]));
    var list = items.filter(function (x) { return x.subject === sid && x.section === cid; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var box = el('div');
    list.forEach(function (it) {
      var body = el('div', { class: 'acc-b', hidden: '' }, it.body ? el('div', null, it.body) : null);
      (it.images || []).forEach(function (src) { body.append(el('img', { src: src, alt: '', loading: 'lazy' })); });
      var h = el('button', { type: 'button', class: 'acc-h', 'aria-expanded': 'false' }, el('span', null, titleOf(it, s)), el('span', { class: 'acc-d' }, fa(it.date)));
      h.onclick = function () { var o = body.hidden; body.hidden = !o; h.setAttribute('aria-expanded', o ? 'true' : 'false'); };
      box.append(el('div', { class: 'acc' }, h, body));
    });
    view.replaceChildren(head(s.title + ' · ' + c.title, list.length ? 'روی هر مورد بزن تا باز شود.' : ''), list.length ? box : empty('هنوز چیزی در این بخش اضافه نشده است.'));
  }

  window.JZUI = { pw: pw, el: el, fa: fa, gate: gate, head: head, empty: empty, view: view };

  /* ---- تم ---- */
  var root = document.documentElement;
  try { var t = localStorage.getItem('nr-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  var tb = document.getElementById('themeBtn');
  if (tb) tb.addEventListener('click', function () {
    var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n); try { localStorage.setItem('nr-theme', n); } catch (e) {}
  });

  var m = D.view;
  if (m === 'subjects' || m === 'subject' || m === 'section') {
    gate(JZ.gate, 'nr-jz', 'جزوه و تکالیف', 'این بخش رمز دارد. برای ورود رمز را وارد کن.', function () {
      if (m === 'subjects') subjectsView(); else if (m === 'subject') subjectView(D.subject); else sectionView(D.subject, D.section);
    });
  }
})();
