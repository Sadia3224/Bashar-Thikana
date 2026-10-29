import "dotenv/config";

// Every setting the API reads from .env, checked once at startup so a missing value fails loudly.
const required = ["MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, ""),
  // Optional: without a secret key the API still runs, but listing payments are disabled.
  stripeSecretKey: process.env.STRIPE_SE_KEY || process.env.STRIPE_SECRET_KEY || "",
  stripePublishableKey: process.env.STRIPE_PUB_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export const isProduction = env.nodeEnv === "production";
export default env;
