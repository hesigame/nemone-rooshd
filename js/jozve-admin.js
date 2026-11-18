
  /* ---- GitHub ---- */

  function ready() {
    return !!(cfg.owner && cfg.repo && cfg.token);
  }

  function gh(suffix, opt) {
    opt = opt || {};

    var headers = Object.assign({
      Authorization: 'Bearer ' + cfg.token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }, opt.headers || {});

    var path = (cfg.path || 'jozve/content.js')
      .split('/')
      .map(encodeURIComponent)
      .join('/');

    return fetch(
      'https://api.github.com/repos/' +
      encodeURIComponent(cfg.owner) + '/' +
      encodeURIComponent(cfg.repo) +
      '/contents/' + path + suffix,
      Object.assign({}, opt, { headers: headers })
    );
  }

  function apiJson(response) {
    return response.text().then(function (text) {
      var data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(
          'پاسخ GitHub JSON معتبر نیست: ' + text.slice(0, 200)
        );
      }

      if (!response.ok) {
        throw new Error(
          'GitHub HTTP ' + response.status + ': ' +
          ((data && data.message) || 'Unknown error')
        );
      }

      return data;
    });
  }

  function decodeContent(content) {
    var binary = atob(content.replace(/\s/g, ''));
    var bytes = new Uint8Array(binary.length);

    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new TextDecoder('utf-8').decode(bytes);
  }

  function pull(quiet) {
    if (!ready()) return;

    var branch = cfg.branch || 'main';

    gh('?ref=' + encodeURIComponent(branch))
      .then(apiJson)
      .then(function (file) {
        if (!file.content) {
          throw new Error('محتوای فایل در GitHub پیدا نشد.');
        }

        var source = decodeContent(file.content);
        var marker = 'window.JZ_ITEMS';
        var pos = source.indexOf(marker);

        if (pos === -1) {
          throw new Error('ساختار content.js معتبر نیست.');
        }

        var start = source.indexOf('=', pos) + 1;
        var end = source.lastIndexOf(';');

        if (start === 0 || end < start) {
          throw new Error('ساختار اطلاعات جزوه‌ها نامعتبر است.');
        }

        var data = JSON.parse(
          source.slice(start, end).trim()
        );

        if (!Array.isArray(data)) {
          throw new Error('اطلاعات جزوه‌ها آرایه معتبر نیست.');
        }

        items = data;
        say('آخرین نسخه با موفقیت از GitHub دریافت شد.');
      })
      .catch(function (e) {
        if (!quiet) {
          say('دریافت از GitHub ناموفق بود: ' + e.message, 1);
        }
      });
  }

  function publish() {
    if (!ready()) {
      return say(
        'ابتدا اطلاعات اتصال به GitHub را وارد و ذخیره کن.',
        1
      );
    }

    say('در حال انتشار روی GitHub…');

    var branch = cfg.branch || 'main';

    gh('?ref=' + encodeURIComponent(branch))
      .then(function (response) {
        if (response.status === 404) {
          return null;
        }

        return apiJson(response);
      })
      .then(function (file) {
        var payload = {
          message: 'Update jozve content',
          content: b64(toJS()),
          branch: branch
        };

        if (file && file.sha) {
          payload.sha = file.sha;
        }

        return gh('', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      })
      .then(apiJson)
      .then(function (result) {
        if (!result.content || !result.content.sha) {
          throw new Error('GitHub تغییرات را تأیید نکرد.');
        }

        say(
          'انتشار با موفقیت انجام شد. فایل content.js در GitHub به‌روزرسانی شد.'
        );
      })
      .catch(function (e) {
        say('انتشار ناموفق بود: ' + e.message, 1);
      });
  }
