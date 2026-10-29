import Property from "../models/Property.js";
import env from "../config/env.js";
import { getStripe } from "../config/stripe.js";
import ApiError from "../utils/ApiError.js";
import { LISTING_FEE_CURRENCY, LISTING_FEES } from "../utils/constants.js";
import { assertObjectId } from "../utils/validators.js";

const TYPE_NAMES = { bed: "Bed-wise rental", "shared-room": "Shared room", "single-room": "Single room", "full-flat": "Full flat" };

export const getFeeTable = () => ({ currency: LISTING_FEE_CURRENCY, fees: LISTING_FEES, testMode: env.stripeSecretKey.startsWith("sk_test_") });

async function findOwned(propertyId, ownerId) {
  assertObjectId(propertyId, "Property");
  const property = await Property.findById(propertyId);
  if (!property || !property.isOwnedBy(ownerId)) throw ApiError.notFound("Property not found");
  return property;
}

// Starts a Stripe Checkout page for one listing's fee. The amount always comes from the server's fee table.
export async function createCheckout(propertyId, owner) {
  const property = await findOwned(propertyId, owner._id);
  if (property.isPaid()) throw ApiError.badRequest("The listing fee for this property is already paid");

  const fee = property.listingFee();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: owner.email,
    client_reference_id: String(property._id),
    metadata: { propertyId: String(property._id), ownerId: String(owner._id) },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: LISTING_FEE_CURRENCY,
          // Stripe takes the smallest unit (poisha), so 200 Taka is 20000.
          unit_amount: fee * 100,
          product_data: { name: `Listing fee: ${TYPE_NAMES[property.type]}`, description: property.title },
        },
      },
    ],
    success_url: `${env.clientUrl}/owner/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/owner/properties?payment=cancelled`,
  });

  property.payment.checkoutSessionId = session.id;
  property.payment.amount = fee;
  await property.save();
  return { url: session.url, sessionId: session.id, amount: fee, currency: LISTING_FEE_CURRENCY };
}

// Marks the listing paid only if Stripe itself says this session was paid.
async function applyPaidSession(session) {
  const propertyId = session.metadata?.propertyId;
  if (!propertyId || session.payment_status !== "paid") return null;
  const property = await Property.findById(propertyId);
  if (!property) return null;
  const changed = property.markPaid({
    checkoutSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    amount: session.amount_total / 100,
  });
  if (changed) await property.save();
  return property;
}

// Called by the frontend after Stripe redirects back to the success page.
export async function confirmCheckout(sessionId, owner) {
  if (!sessionId || typeof sessionId !== "string") throw ApiError.badRequest("sessionId is required");
  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (error) {
    if (error.statusCode) throw ApiError.notFound("Payment session not found");
    throw error;
  }
  if (session.metadata?.ownerId !== String(owner._id)) throw ApiError.notFound("Payment session not found");
  if (session.payment_status !== "paid") throw ApiError.badRequest("This payment has not been completed");
  return applyPaidSession(session);
}

// Stripe webhook: a backup for owners who close the tab before returning to the site.
export async function handleWebhook(rawBody, signature) {
  if (!env.stripeWebhookSecret) throw new ApiError(503, "Stripe webhook secret is not configured");
  let event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch {
    throw ApiError.badRequest("Invalid Stripe signature");
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await applyPaidSession(event.data.object);
  }
  return { received: true };
}
