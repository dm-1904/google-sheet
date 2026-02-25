import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { postsRouter } from "./routes/posts.js";

dotenv.config();

const app = express();
const port = Number(process.env.SERVER_PORT ?? 4000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/posts", postsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
