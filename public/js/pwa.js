/* Service worker registration, install prompt, offline notice. */
(function () {
  'use strict';
  var cfg = window.SILKPATH_CONFIG || {};
  var info = document.getElementById('build-info');
  if (info && cfg.build && cfg.build.indexOf('__') !== 0) info.textContent = 'Build ' + cfg.build;

  var deferred = null, btn = document.getElementById('install');
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (btn) btn.hidden = false; });
  if (btn) btn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; btn.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { if (btn) btn.hidden = true; });

  function say(msg) { var t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 3200); }
  window.addEventListener('offline', function () { say('You are offline. Saved data still works.'); });
  window.addEventListener('online', function () { say('Back online.'); });

  var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && secure) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* app works without it */ });
    });
  }
})();
