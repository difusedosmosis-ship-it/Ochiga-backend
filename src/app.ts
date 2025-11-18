// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth";
import estatesRoutes from "./routes/estates";
import residentsRoutes from "./routes/residents";
import devicesRoutes from "./routes/devices";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────
app.use(helmet()); // Security headers
app.use(cors());   // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev"));  // HTTP request logging

// ─── Health Check ────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Ochiga Backend Connected 🔥",
    timestamp: new Date().toISOString(),
  });
});

// ─── Mount Routes ────────────────────────────
app.use("/auth", authRoutes);
app.use("/estates", estatesRoutes);
app.use("/residents", residentsRoutes);
app.use("/devices", devicesRoutes);

// ─── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// ─── Global Error Handler ────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error", error: err.message });
});

// ─── Start Server ────────────────────────────
app.listen(PORT, () => {
  console.log(`Ochiga backend running on http://localhost:${PORT}`);
});

export default app;
