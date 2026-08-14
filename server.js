import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

app.get("/health", (_request, response) => {
  response.status(200).json({
    ok: true,
    app: "Aashi Dreams",
    time: new Date().toISOString(),
  });
});

app.use(express.static(distPath));

app.get("*", (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Aashi Dreams running on port ${port}`);
});
