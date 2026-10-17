/* Pure, deterministic utilities. Usable from Node tests and ordinary script tags. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MiaoheCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clamp = (value, min, max) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  function seededRandom(seed) {
    let state = seed >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  function sceneIndex(scroll, height, count) {
    if (height <= 0 || count < 1) return 0;
    return clamp(Math.round(scroll / height), 0, count - 1);
  }
  const project = Object.freeze({
    name: 'GDMU-NA TokenHub', category: '大模型网关',
    url: 'https://tokenhub-tunnel.apps.gdmuna.com/'
  });
  return Object.freeze({clamp, seededRandom, sceneIndex, project});
});
