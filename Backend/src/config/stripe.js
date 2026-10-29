import Stripe from "stripe";
import env from "./env.js";
import ApiError from "../utils/ApiError.js";

let client = null;

// Created on first use, so the API still starts when Stripe keys are not configured.
export function getStripe() {
  if (!env.stripeSecretKey) throw new ApiError(503, "Payments are not configured on the server");
  if (!client) client = new Stripe(env.stripeSecretKey);
  return client;
}
