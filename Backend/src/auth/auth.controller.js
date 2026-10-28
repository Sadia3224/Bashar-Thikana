import * as authService from "./auth.service.js";

// Express 5 forwards rejected promises to errorMiddleware, so controllers only map service results to responses.

export const register = async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json({ message: "Account created", user, token });
};

export const login = async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  res.json({ message: "Logged in", user, token });
};

export const me = (req, res) => res.json({ user: req.user });

export const updateMe = async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ message: "Profile updated", user });
};
