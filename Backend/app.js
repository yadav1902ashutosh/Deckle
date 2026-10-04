import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import personaRouter from "./routes/persona.routes.js";
import bookRouter from "./routes/book.routes.js";
import chapterRouter from "./routes/chapter.routes.js";
import volumeRouter from "./routes/volume.routes.js";
import genreRouter from "./routes/genre.routes.js";
import readingHistoryRouter from "./routes/readingHistory.routes.js";
import loreRouter from "./routes/chapterLore.routes.js";
import libraryRouter from "./routes/library.routes.js";
import communityRouter from "./routes/community.routes.js";
import studioRouter from "./routes/studio.routes.js";

const app = express();

// Trust reverse proxy (essential for Render / Cloud TLS termination & secure cookies)
app.set("trust proxy", 1);

// Flexible CORS for local dev + production frontend deployments
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Persona-Id"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Mount API Routers
app.use('/api/v1/users', userRouter);
app.use("/api/v1/personas", personaRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/chapters", chapterRouter);
app.use("/api/v1/volumes", volumeRouter);
app.use("/api/v1/genres", genreRouter);
app.use("/api/v1/reading-history", readingHistoryRouter);
app.use("/api/v1/library", libraryRouter);
app.use("/api/v1/community", communityRouter);
app.use("/api/v1/studio", studioRouter);
app.use("/api/v1/lore", loreRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Global error handling middleware (catches ApiError)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export default app;