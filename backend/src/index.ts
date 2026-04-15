import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "miniapp-backend",
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});
