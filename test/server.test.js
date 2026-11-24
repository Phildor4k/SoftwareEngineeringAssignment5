import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createAppServer } from "../src/server.js";

async function withServer(run) {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseURL = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(baseURL);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

function sendJSON(baseURL, method, path, body) {
  return fetch(`${baseURL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("HTTP API", () => {
  test("BUG-101: grade request for a deleted student returns 404", async () => {
    await withServer(async (baseURL) => {
      const created = await sendJSON(baseURL, "POST", "/transcripts", { name: "Mira" });
      const { studentID } = await created.json();
      const added = await sendJSON(baseURL, "POST", `/transcripts/${studentID}/CS360`, { grade: 90 });
      assert.equal(added.status, 201);
      assert.equal((await fetch(`${baseURL}/transcripts/${studentID}/CS360`)).status, 200);

      const deleted = await fetch(`${baseURL}/transcripts/${studentID}`, { method: "DELETE" });
      assert.equal(deleted.status, 204);

      const afterDelete = await fetch(`${baseURL}/transcripts/${studentID}/CS360`);
      assert.equal(afterDelete.status, 404);
    });
  });
});
