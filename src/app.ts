import express from "express";
import cors from "cors";
import authRoutes from "./features/auth/auth.route.js";
import usersRoutes from "./features/users/users.route.js";
import generationsRoutes from "./features/generations/generations.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/generations", generationsRoutes);

app.use(errorHandler);

export default app;