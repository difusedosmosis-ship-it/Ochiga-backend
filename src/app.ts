import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import estatesRoutes from "./routes/estates";
import residentsRoutes from "./routes/residents";
import devicesRoutes from "./routes/devices";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ping
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/estates", estatesRoutes);
app.use("/residents", residentsRoutes);
app.use("/devices", devicesRoutes);

export default app;
