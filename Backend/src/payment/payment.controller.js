import * as paymentService from "./payment.service.js";

export const getFees = (req, res) => res.json(paymentService.getFeeTable());

export const createCheckout = async (req, res) => {
  const checkout = await paymentService.createCheckout(req.body.propertyId, req.user);
  res.status(201).json({ message: "Checkout started", ...checkout });
};

export const confirmCheckout = async (req, res) => {
  const property = await paymentService.confirmCheckout(req.body.sessionId, req.user);
  res.json({ message: "Payment confirmed. The listing is now waiting for admin review.", property });
};

export const webhook = async (req, res) => {
  res.json(await paymentService.handleWebhook(req.body, req.headers["stripe-signature"]));
};
