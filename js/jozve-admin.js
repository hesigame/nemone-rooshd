/* مدیریت جزوه و تکالیف — فقط از طریق لینک مستقیم */
(function () {
  var U = window.JZUI, el = U.el, fa = U.fa, JZ = window.JZ;
  /* base = آخرین نسخه‌ی سایت، ops = تغییرهای منتشرنشده (افزودن/ویرایش/حذف).
     موقع انتشار، اول آخرین نسخه از GitHub خوانده می‌شود و فقط تغییرها رویش اعمال می‌شود،
     پس مطلب‌های قبلی هیچ‌وقت پاک نمی‌شوند. */
  var base = [], ops = [], cfg = loadCfg(), editId = null, fs = 'all', fc = 'all', status = { t: '' }, cur = blank();
  function loadCfg() { try { return JSON.parse(localStorage.getItem('nr-gh') || '{}'); } catch (e) { return {}; } }
  function today() { try { return new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { return ''; } }
  function blank() { return { subject: JZ.subjects[0].id, section: 'takalif', title: '', date: today(), body: '', images: [] }; }
  function norm(s) { return s.replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); }
  function say(t, e) { status = { t: t, e: e }; render(); }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function nameOf(list, id) { var r = list.filter(function (x) { return x.id === id; })[0]; return r ? r.title : id; }
  function toJS(list) { return '/* این فایل را بخش مدیریت (jozve-admin) می‌سازد؛ دستی ویرایش نکن. */\nwindow.JZ_ITEMS = ' + JSON.stringify(list, null, 1) + ';\n'; }
  function parse(t) {
    var a = t.indexOf('['), b = t.lastIndexOf(']');
    if (a < 0 || b < a) throw new Error('فرمت فایل content.js قابل خواندن نیست.');
    return JSON.parse(t.slice(a, b + 1));
  }
  function apply(list, o) {
    var r = list.slice();
    o.forEach(function (p) {
      if (p.del) { r = r.filter(function (x) { return x.id !== p.del; }); return; }
      var i = -1; r.forEach(function (x, k) { if (x.id === p.set.id) i = k; });
      if (i < 0) r.push(p.set); else r[i] = p.set;
    });
    return r;
  }
  function items() { return apply(base, ops); }

  function fld(label, node) { return el('div', { class: 'fld' }, el('label', null, label), node); }
  function sel(opts, val, fn) {
    var s = el('select', { class: 'in' });
    opts.forEach(function (o) { var p = el('option', { value: o.id }, o.title); if (o.id === val) p.selected = true; s.append(p); });
    s.onchange = function () { fn(s.value); };
    return s;
  }
  function inp(key, dir) { var i = el('input', { class: 'in', type: 'text', value: cur[key], dir: dir || 'rtl' }); i.oninput = function () { cur[key] = i.value; }; return i; }

  function shrink(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.72));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }

  function save() {
    if (!cur.title.trim()) return say('موضوع را بنویس.', 1);
    var it = { id: editId || Date.now().toString(36), subject: cur.subject, section: cur.section, title: cur.title.trim(), date: norm(cur.date.trim()), body: cur.body.trim(), images: cur.images };
    ops.push({ set: it });
    var s = cur.subject, c = cur.section; editId = null; cur = blank(); cur.subject = s; cur.section = c;
    say('مطلب اضافه شد. برای دیده شدن توسط بقیه «انتشار روی سایت» را بزن.');
  }

  /* ---- GitHub ---- */
  function ready() { return cfg.owner && cfg.repo && cfg.token; }
  function br() { return cfg.branch || 'main'; }
  function fpath() { return cfg.path || 'jozve/content.js'; }
  function api(p, opt) {
    opt = opt || {}; opt.cache = 'no-store';
    opt.headers = Object.assign({ Authorization: 'Bearer ' + cfg.token, Accept: 'application/vnd.github+json' }, opt.headers || {});
    var q = opt.method ? '' : (p.indexOf('?') < 0 ? '?' : '&') + '_=' + Date.now();
    return fetch('https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + p + q, opt);
  }
  function fail(r) {
    return r.json().then(function (j) { return r.status + (j && j.message ? ' – ' + j.message : ''); }, function () { return String(r.status); })
      .then(function (m) { throw new Error(m); });
  }
  /* آخرین نسخه‌ی فایل از GitHub (بدون کش). اگر خوانده نشود، انتشار انجام نمی‌شود. */
  function fetchRemote() {
    var p = fpath(), i = p.lastIndexOf('/'), dir = i < 0 ? '' : p.slice(0, i), sha = null;
    return api(dir + '?ref=' + br()).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) return fail(r);
      return r.json().then(function (arr) { (Array.isArray(arr) ? arr : []).forEach(function (f) { if (f.path === p) sha = f.sha; }); return sha; });
    }).then(function (s) {
      if (!s) return { list: base.slice(), sha: null };
      return api(p + '?ref=' + br(), { headers: { Accept: 'application/vnd.github.raw+json' } }).then(function (r) {
        if (!r.ok) return fail(r);
        return r.text().then(function (t) { return { list: parse(t), sha: s }; });
      });
    });
  }
  function pull() {
    if (!ready()) return say('اول در بخش «اتصال به GitHub» اطلاعات را وارد کن.', 1);
    fetchRemote().then(function (r) { base = r.list; say('آخرین نسخه از GitHub خوانده شد.'); })
      .catch(function (e) { say('خواندن از GitHub نشد: ' + (e.message || e), 1); });
  }
  function publish() {
    if (!ready()) return say('اول در بخش «اتصال به GitHub» اطلاعات را وارد کن، یا فایل را دانلود کن.', 1);
    if (!ops.length) return say('تغییر جدیدی برای انتشار نیست.');
    say('در حال انتشار…');
    fetchRemote().then(function (r) {
      base = r.list;
      var out = items(), b = { message: 'update jozve content', content: b64(toJS(out)), branch: br() };
      if (r.sha) b.sha = r.sha;
      return api(fpath(), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(function (res) {
        if (!res.ok) return fail(res);
        base = out; ops = [];
        say('منتشر شد. تا یکی دو دقیقه‌ی دیگر روی سایت دیده می‌شود.');
      });
    }).catch(function (e) { say('انتشار نشد: ' + (e.message || e), 1); });
  }
  function download() {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([toJS(items())], { type: 'text/javascript' }));
    a.download = 'content.js'; document.body.append(a); a.click(); a.remove();
  }
  function loadDeployed(cb) {
    var s = document.createElement('script');
    s.src = '../jozve/content.js?t=' + Date.now();
    s.onload = function () { cb((window.JZ_ITEMS || []).slice()); s.remove(); };
    s.onerror = function () { cb([]); s.remove(); };
    document.head.append(s);
  }

  function render() {
    var all = items();
    var form = el('div', { class: 'card' },
      el('h3', null, editId ? 'ویرایش مطلب' : 'مطلب جدید'),
      el('div', { class: 'two' },
        fld('درس', sel(JZ.subjects, cur.subject, function (v) { cur.subject = v; })),
        fld('بخش', sel(JZ.sections, cur.section, function (v) { cur.section = v; render(); }))),
      fld(cur.section === 'dars' ? 'موضوع (بعد از اسم درس نمایش داده می‌شود)' : 'موضوع', inp('title')),
      fld('تاریخ (مثلاً ۱۴۰۵/۰۸/۲۷)', inp('date', 'ltr')));
    var ta = el('textarea', { class: 'in' }, cur.body); ta.oninput = function () { cur.body = ta.value; };
    var file = el('input', { type: 'file', accept: 'image/*', multiple: '', class: 'in' });
    file.onchange = function () {
      var fl = Array.prototype.slice.call(file.files), n = fl.length;
      fl.forEach(function (f) { shrink(f, function (d) { cur.images.push(d); if (!--n) render(); }); });
    };
    var th = el('div', { class: 'thumbs' });
    cur.images.forEach(function (d, i) {
      var x = el('button', { type: 'button', 'aria-label': 'حذف عکس' }, '×'); x.onclick = function () { cur.images.splice(i, 1); render(); };
      th.append(el('div', null, el('img', { src: d, alt: '' }), x));
    });
    var ok = el('button', { type: 'button', class: 'btn' }, editId ? 'ذخیره‌ی ویرایش' : 'افزودن'); ok.onclick = save;
    var row = el('div', { class: 'btns' }, ok);
    if (editId) { var cn = el('button', { type: 'button', class: 'mini' }, 'انصراف'); cn.onclick = function () { editId = null; cur = blank(); render(); }; row.append(cn); }
    form.append(fld('توضیحات', ta), fld('عکس‌ها (اختیاری)', file), th, row);

    var fl2 = el('div', { class: 'two' },
      fld('فیلتر درس', sel([{ id: 'all', title: 'همه' }].concat(JZ.subjects), fs, function (v) { fs = v; render(); })),
      fld('فیلتر بخش', sel([{ id: 'all', title: 'همه' }].concat(JZ.sections), fc, function (v) { fc = v; render(); })));
    var pend = {}; ops.forEach(function (o) { pend[o.set ? o.set.id : o.del] = 1; });
    var list = el('div');
    all.filter(function (x) { return (fs === 'all' || x.subject === fs) && (fc === 'all' || x.section === fc); })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .forEach(function (it) {
        var e1 = el('button', { type: 'button', class: 'mini' }, 'ویرایش'), d1 = el('button', { type: 'button', class: 'mini red' }, 'حذف');
        e1.onclick = function () { editId = it.id; cur = { subject: it.subject, section: it.section, title: it.title, date: it.date, body: it.body || '', images: (it.images || []).slice() }; render(); window.scrollTo(0, 0); };
        d1.onclick = function () { if (confirm('این مطلب حذف شود؟')) { ops.push({ del: it.id }); say('حذف شد. برای اعمال روی سایت «انتشار روی سایت» را بزن.'); } };
        list.append(el('div', { class: 'arow' }, el('div', { class: 'grow' }, el('b', null, it.title), el('br'), el('small', null, nameOf(JZ.subjects, it.subject) + ' · ' + nameOf(JZ.sections, it.section) + ' · ' + fa(it.date) + ((it.images || []).length ? ' · ' + fa(it.images.length) + ' عکس' : '') + (pend[it.id] ? ' · منتشر نشده' : '')), e1, d1)));
      });
    if (!list.children.length) list.append(U.empty('مطلبی نیست.'));

    var pub = el('button', { type: 'button', class: 'btn' }, 'انتشار روی سایت'); pub.onclick = publish;
    var dl = el('button', { type: 'button', class: 'mini' }, 'دانلود content.js'); dl.onclick = download;
    var pl = el('button', { type: 'button', class: 'mini' }, 'خواندن آخرین نسخه'); pl.onclick = pull;
    var act = el('div', { class: 'card' }, el('h3', null, 'انتشار'),
      el('p', { class: 'meta' }, ops.length ? fa(ops.length) + ' تغییر منتشر نشده. موقع انتشار، مطلب‌های قبلی سایت حفظ می‌شوند و فقط تغییرهای جدید اضافه می‌شوند.' : 'همه‌ی تغییرها منتشر شده است.'),
      el('div', { class: 'btns' }, pub, dl, pl));

    var gs = el('details', { class: 'card' }, el('summary', null, 'اتصال به GitHub (برای انتشار مستقیم)'),
      el('p', { class: 'meta' }, 'توکن را در GitHub بساز: Settings ← Developer settings ← Fine-grained tokens، فقط برای همین ریپو و با دسترسی Contents: Read and write. این اطلاعات فقط روی همین دستگاه ذخیره می‌شود و داخل کد سایت نیست.'));
    [['owner', 'نام کاربری GitHub'], ['repo', 'نام ریپو'], ['branch', 'شاخه (پیش‌فرض main)'], ['path', 'مسیر فایل (پیش‌فرض jozve/content.js)'], ['token', 'توکن']].forEach(function (f) {
      var i = el('input', { class: 'in', type: f[0] === 'token' ? 'password' : 'text', value: cfg[f[0]] || '', dir: 'ltr', autocomplete: 'off' });
      i.oninput = function () { cfg[f[0]] = i.value.trim(); };
      gs.append(fld(f[1], f[0] === 'token' ? U.pw(i) : i));
    });
    var sv = el('button', { type: 'button', class: 'mini' }, 'ذخیره در این دستگاه');
    sv.onclick = function () { try { localStorage.setItem('nr-gh', JSON.stringify(cfg)); } catch (e) {} if (ready()) pull(); else say('ذخیره شد.'); };
    gs.append(sv);
    if (!ready()) gs.open = true;

    var st = status.t ? el('div', { class: 'status' + (status.e ? ' err' : ''), role: 'status' }, status.t) : null;
    U.view.replaceChildren(U.head('مدیریت جزوه و تکالیف', 'فقط برای مدیر سایت.'), st, form, el('h3', { class: 'sec-t' }, 'مطلب‌ها'), fl2, list, act, gs);
  }

  U.gate(JZ.admin, 'nr-jza', 'مدیریت جزوه', 'این بخش فقط برای مدیر سایت است.', function () {
    loadDeployed(function (l) { base = l; render(); if (ready()) pull(); });
  });
})();
