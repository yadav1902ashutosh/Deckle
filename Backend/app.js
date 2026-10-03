import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import personaRouter from "./routes/persona.routes.js";
import bookRouter from "./routes/book.routes.js" 
import chapterRouter from "./routes/chapter.routes.js";


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }),
);

app.use(express.json({limit: "16kb"}));

app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());

// Mount User Routes at /api/v1/users
app.use('/api/v1/users', userRouter);
app.use("/api/v1/personas", personaRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/chapters", chapterRouter);

app.get('/api/health', (req, res) => {
    res.json({status: 'ok', message: ' Backend is running!'});
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