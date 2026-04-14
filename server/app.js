import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import applicationRouter from "./routes/applicationRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, "uploads");
const clientBuildDirectory = path.resolve(__dirname, "../client/dist");
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localNetworkOriginPattern = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d+)?$/i;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || localNetworkOriginPattern.test(origin) || origin.endsWith(".onrender.com")) {
        callback(null, true);
        return;
      }

      const corsError = new Error("CORS policy blocked this request.");
      corsError.statusCode = 403;
      callback(corsError);
    },
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use("/uploads", express.static(uploadsDirectory, { maxAge: "1d" }));
app.get("/logo.jpeg", (request, response) => {
  response.sendFile(path.resolve(__dirname, "logo.jpeg"));
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildDirectory, { maxAge: "1y", immutable: true }));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api") || request.path.startsWith("/uploads")) {
      next();
      return;
    }

    response.sendFile(path.join(clientBuildDirectory, "index.html"), (error) => {
      if (error) {
        next(error);
      }
    });
  });
}

app.get("/api/health", (request, response) => {
  response.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", applicationRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
