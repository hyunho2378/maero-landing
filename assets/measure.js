// assets/measure.js
(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'lp_v'];
  window.maeroEvents = window.maeroEvents || [];

  function readParams() {
    var out = {};
    var q;
    try { q = new URLSearchParams(window.location.search); } catch (e) { return out; }
    UTM_KEYS.forEach(function (key) {
      var v = q.get(key);
      if (v) { out[key] = v; }
    });
    return out;
  }

  var params = readParams();

  function track(name, extra) {
    var evt = { event: name, time: new Date().toISOString(), page: window.location.pathname };
    extra = extra || {};
    Object.keys(extra).forEach(function (k) { evt[k] = extra[k]; });
    window.maeroEvents.push(evt);

    var endpoint = window.MAERO_ENDPOINT;
    if (typeof endpoint === 'string' && endpoint !== '' && navigator.sendBeacon) {
      try { navigator.sendBeacon(endpoint, JSON.stringify(evt)); } catch (e) { /* 전송 실패는 무시 */ }
    }
  }

  // page_view: 도착, utm 전체
  track('page_view', params);

  // stay_3s: 3초 머묾, 세션당 1회
  var STAY_KEY = 'maero_stay_3s';
  var stayDone = false;
  try { stayDone = window.sessionStorage.getItem(STAY_KEY) === '1'; } catch (e) { stayDone = false; }
  if (!stayDone) {
    window.setTimeout(function () {
      var extra = {};
      if (params.utm_content) { extra.utm_content = params.utm_content; }
      track('stay_3s', extra);
      try { window.sessionStorage.setItem(STAY_KEY, '1'); } catch (e) { /* 저장 불가는 무시 */ }
    }, 3000);
  }

  // section_view: 섹션이 50% 보임, 섹션당 1회
  if ('IntersectionObserver' in window) {
    var seen = {};
    var thresholds = [];
    for (var i = 0; i <= 20; i++) { thresholds.push(i / 20); }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var name = entry.target.getAttribute('data-section');
        if (!name || seen[name]) { return; }
        var viewH = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
        var enough = entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= viewH * 0.5;
        if (entry.isIntersecting && enough) {
          seen[name] = true;
          io.unobserve(entry.target);
          track('section_view', { section: name });
        }
      });
    }, { threshold: thresholds });

    Array.prototype.forEach.call(document.querySelectorAll('[data-section]'), function (el) {
      io.observe(el);
    });
  }

  // cta_click: 신청 버튼 클릭 (같은 탭 이동은 그대로 둠)
  document.addEventListener('click', function (e) {
    var node = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (node) { track('cta_click', { position: node.getAttribute('data-cta') }); }
  });
})();