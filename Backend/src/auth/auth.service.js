import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import { SELF_REGISTER_ROLES, ROLES } from "../utils/constants.js";
import { isValidEmail, isValidPhone, passwordProblem, pick, requireFields } from "../utils/validators.js";

const authPayload = (user) => ({ user, token: generateToken(user) });

function assertContact({ email, phone }) {
  if (email !== undefined && !isValidEmail(email)) throw ApiError.badRequest("Enter a valid email address");
  if (phone && !isValidPhone(phone)) throw ApiError.badRequest("Enter a valid Bangladeshi mobile number, e.g. 01712-345678");
}

function assertPassword(password) {
  const problem = passwordProblem(password);
  if (problem) throw ApiError.badRequest(problem);
}

export async function registerUser(body) {
  requireFields(body, ["name", "email", "password"]);
  const role = body.role || ROLES.CONSUMER;
  if (!SELF_REGISTER_ROLES.includes(role)) throw ApiError.badRequest("Role must be consumer or user");
  assertContact(body);
  assertPassword(body.password);
  if (await User.isEmailTaken(body.email)) throw ApiError.conflict("Email already registered");

  const user = await User.create({ ...pick(body, ["name", "email", "phone"]), password: body.password, role });
  return authPayload(user);
}

export async function loginUser({ email, password } = {}) {
  requireFields({ email, password }, ["email", "password"]);
  const user = await User.findByEmail(email, { withPassword: true });
  // Same message for unknown email and wrong password, so the response does not reveal which emails exist.
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated by an administrator");
  return authPayload(user);
}

export async function updateProfile(userId, body) {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const changes = pick(body, ["name", "email", "phone", "about"]);
  assertContact(changes);
  if (changes.email && (await User.isEmailTaken(changes.email, user._id))) throw ApiError.conflict("Another account already uses this email");
  Object.assign(user, changes);

  if (body.newPassword) {
    assertPassword(body.newPassword);
    user.password = body.newPassword;
  }
  await user.save();
  return user;
}
