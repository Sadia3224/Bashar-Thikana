import env from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { uploadDir } from "./middleware/uploadMiddleware.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./auth/auth.route.js";
import propertyRoutes from "./property/property.route.js";
import bookingRoutes from "./booking/booking.route.js";
import adminRoutes from "./admin/admin.route.js";
import aiRoutes from "./ai/ai.route.js";
import uploadRoutes from "./upload/upload.route.js";
import paymentRoutes, { webhookRouter } from "./payment/payment.route.js";

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
// Must stay before express.json(): Stripe verifies the webhook against the raw body.
app.use("/api/payments/webhook", webhookRouter);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

app.get("/", (_req, res) => res.json({ app: "Bashar Thikana", message: "API is running", roles: ["consumer", "user", "admin"] }));
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFound);
app.use(errorHandler);

await connectDB();
app.listen(env.port, () => console.log(`Bashar Thikana server: http://localhost:${env.port}`));
