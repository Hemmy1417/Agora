import "dotenv/config";
import express from "express";
import cors from "cors";
import walletRouter from "./routes/wallet.js";
import authRouter from "./routes/auth.js";

const app  = express();
const PORT = process.env.PORT || 3001;

function isAllowed(origin: string): boolean {
  if (origin.startsWith("http://localhost")) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".vercel.app")) return true;
    if (host === "localhost" || host === "127.0.0.1") return true;
  } catch {}
  return false;
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || isAllowed(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  allowedHeaders: ["Content-Type", "Authorization"],
  methods:        ["GET", "POST", "OPTIONS"],
}));
app.options("*", cors({ origin: true, allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/wallet", walletRouter);
app.use("/auth", authRouter);

app.listen(PORT, () => console.log(`Agora API on port ${PORT}`));
