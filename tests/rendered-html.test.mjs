import assert from "node:assert/strict";
import test from "node:test";
import { preview } from "vite";

test("production site serves its page and bundled assets", async () => {
  const server = await preview({
    configFile: false,
    preview: { host: "127.0.0.1", port: 0, strictPort: true },
  });

  try {
    const address = server.httpServer.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;

    const response = await fetch(origin);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/i);

    const html = await response.text();
    assert.match(html, /<html lang="zh-CN">/);
    assert.match(html, /<title>渺核科技｜渺见未来，核聚价值<\/title>/);
    assert.match(html, /<div id="root"><\/div>/);

    const script = html.match(/<script[^>]+src="([^"]+)"/);
    const stylesheet = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/);
    assert.ok(script, "production JavaScript entry is present");
    assert.ok(stylesheet, "production stylesheet is present");

    for (const asset of [script[1], stylesheet[1], "/miaokernel-logo.svg"]) {
      const assetResponse = await fetch(new URL(asset, origin));
      assert.equal(assetResponse.status, 200, `${asset} should be served`);
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
