import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ALL_ROLES, ROLES } from "../utils/constants.js";
import { EMAIL_RE } from "../utils/validators.js";
import { cleanJSON } from "../utils/toJSON.js";

const SALT_ROUNDS = 10;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, minlength: [2, "Name is too short"], maxlength: 80 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_RE, "Enter a valid email address"],
    },
    phone: { type: String, default: "", trim: true },
    about: { type: String, default: "", trim: true, maxlength: 500 },
    // select: false keeps the hash out of every query unless a service asks for it explicitly.
    password: { type: String, required: [true, "Password is required"], select: false },
    role: { type: String, enum: ALL_ROLES, default: ROLES.CONSUMER },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: cleanJSON(["password"]) }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(String(candidate || ""), this.password);
};

userSchema.statics.findByEmail = function findByEmail(email, { withPassword = false } = {}) {
  const query = this.findOne({ email: normalizeEmail(email) });
  return withPassword ? query.select("+password") : query;
};

userSchema.statics.isEmailTaken = async function isEmailTaken(email, excludeId) {
  const filter = { email: normalizeEmail(email) };
  if (excludeId) filter._id = { $ne: excludeId };
  return Boolean(await this.exists(filter));
};

export default mongoose.model("User", userSchema);
