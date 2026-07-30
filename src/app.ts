import express from "express";
import cors from "cors";
import authRoutes from "./features/auth/auth.route.js";
import usersRoutes from "./features/users/users.route.js";
import generationsRoutes from "./features/generations/generations.route.js";
import applicationsRoutes from "./features/applications/applications.routes.js";
import interviewRoutes from "./features/interviews/interviews.routes.js";
import cvCheckerRoutes from "./features/cv-checker/cv-checker.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/generations", generationsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/cv", cvCheckerRoutes);

app.use(errorHandler);

export default app;