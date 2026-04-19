/**
 * Dev mock for TRON_DEPOSIT_WALLET_CREATE_URL: POST { tg_user_id } → { address, privateKey }.
 * Run from backend/:  pnpm run mock:wallet-create
 * In .env: TRON_DEPOSIT_WALLET_CREATE_URL=http://127.0.0.1:4711
 */
import http from "node:http";
import { utils } from "tronweb";

const port = Number(process.env.MOCK_WALLET_PORT ?? 4711);

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "method" }));
    return;
  }
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    let tg = "";
    try {
      const j = JSON.parse(raw || "{}");
      tg = String(j.tg_user_id ?? "").trim();
    } catch {
      /* ignore */
    }
    const acc = utils.accounts.generateAccount();
    const privateKey = String(acc.privateKey)
      .replace(/^0x/i, "")
      .trim()
      .toLowerCase();
    console.log("[mock-deposit-wallet-create]", new Date().toISOString(), "tg_user_id=", tg || "(empty)", "→", acc.address.base58);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        address: acc.address.base58,
        privateKey
      })
    );
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[mock-deposit-wallet-create] listening http://127.0.0.1:${port}`);
});
