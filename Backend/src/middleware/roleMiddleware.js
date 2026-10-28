import ApiError from "../utils/ApiError.js";

// Use after protect: allowRoles("user") lets only owners through, allowRoles("admin") only admins.
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!roles.includes(req.user.role)) throw ApiError.forbidden(`This action requires the ${roles.join(" or ")} role`);
  next();
};

export default allowRoles;
