const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let core = {};
try { core = require('../js/core.js'); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
test('clamp confines finite values and handles NaN defensively', () => {
  assert.equal(typeof core.clamp, 'function');
  assert.equal(core.clamp(-2,0,1),0); assert.equal(core.clamp(4,0,1),1);
  assert.equal(core.clamp(.4,0,1),.4); assert.equal(core.clamp(NaN,0,1),0);
});
test('seededRandom is reproducible and stays within [0,1)', () => {
  assert.equal(typeof core.seededRandom, 'function');
  const a=core.seededRandom(7), b=core.seededRandom(7);
  for(let i=0;i<100;i++){const n=a();assert.equal(n,b());assert.ok(n>=0&&n<1);}
});
test('scene index never exceeds available scenes', () => {
  assert.equal(typeof core.sceneIndex, 'function');
  assert.equal(core.sceneIndex(0,900,4),0); assert.equal(core.sceneIndex(1000,900,4),1);
  assert.equal(core.sceneIndex(9900,900,4),3); assert.equal(core.sceneIndex(100,0,4),0);
});
test('project details match only the user-provided source', () => {
  assert.ok(core.project);
  assert.equal(core.project.name,'GDMU-NA TokenHub');
  assert.equal(core.project.url,'https://tokenhub-tunnel.apps.gdmuna.com/');
  assert.equal(core.project.category,'大模型网关');
});
test('document has four unique destinations and real project links', () => {
  assert.ok(fs.existsSync(path.join(root,'index.html')),'homepage does not exist yet');
  const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const id of ['home','about','projects','future']){
    assert.equal((h.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
  }
  assert.ok(h.includes('渺见未来，核聚价值'));
  const blankLinks=[...h.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)];
  assert.ok(blankLinks.length>=2);
  for(const [s] of blankLinks) assert.ok(/rel="[^"]*noopener/.test(s));
  assert.ok(!/https?:\/\/.*\.(?:woff2?|ttf|otf)/.test(h));
});
