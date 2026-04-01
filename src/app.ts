import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

import config from "./app/config";
import passport from "./app/config/passport.config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import NotFound from "./app/middlewares/notFound";
import { sanitizeInput } from "./app/middlewares/sanitizer";
import router from "./app/routes";

const app: Application = express();
const normalizeOrigin = (origin: string) => origin.replace(/\/$/, "");

// Trust proxy (important for rate limiting behind reverse proxy like Nginx)
app.set("trust proxy", 1);

// Request logging (only in development)
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Production: Log errors only
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
    })
  );
}

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
); // Set security HTTP headers

// express-mongo-sanitize middleware reassigns req.query, which is incompatible with Express 5.
// Use direct sanitization on mutable objects instead.
app.use((req, _res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }
  next();
}); // Data sanitization against NoSQL query injection

app.use(sanitizeInput); // Input sanitization

app.use(
  hpp({
    whitelist: ["sort", "filter", "page", "limit", "search"], // Allow duplicate query params
  })
); // Prevent HTTP Parameter Pollution

// Global rate limiting (protect all routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // More lenient for all routes
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limit for health check in development
  skip: (req) => config.NODE_ENV === "development" && req.path === "/",
});

app.use(globalLimiter);

// API-specific stricter rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many API requests, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// parsers
app.use(express.json({ limit: "20mb" })); // Body limit
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const allowedOrigins = (
  config.NODE_ENV === "production"
    ? ["https://stockflow-woad.vercel.app", config.frontend_url]
    : ["http://localhost:3000", "http://localhost:3001", config.frontend_url]
)
  .filter(Boolean)
  .map(normalizeOrigin);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in development
      if (config.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(cookieParser());
app.use(compression());

// Session Middleware (Required for Google OAuth state parameter)
app.use(
  session({
    secret: config.jwt_access_token_secret_key, // Using existing secret for simplicity
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
  })
);

// Passport Middleware
app.use(passport.initialize());

// Health Check (secured - don't expose uptime)
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
    },
  });
});

// application routes
app.use("/api/v1", apiLimiter, router);

// global error handler
app.use(globalErrorHandler);

// not found route
app.use(NotFound);

export default app;
