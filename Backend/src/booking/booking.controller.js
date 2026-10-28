import * as bookingService from "./booking.service.js";

export const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  res.status(201).json({ message: "Request sent", booking });
};

export const getMyBookings = async (req, res) => {
  res.json({ bookings: await bookingService.listByConsumer(req.user._id) });
};

export const getOwnerRequests = async (req, res) => {
  res.json({ bookings: await bookingService.listForOwner(req.user._id) });
};

export const updateStatus = async (req, res) => {
  res.json({ booking: await bookingService.updateStatus(req.params.id, req.user._id, req.body.status) });
};

export const withdraw = async (req, res) => {
  res.json({ booking: await bookingService.withdraw(req.params.id, req.user._id) });
};
