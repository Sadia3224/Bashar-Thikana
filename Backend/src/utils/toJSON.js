// Shared toJSON transform: expose `id` instead of `_id`, drop `__v` and any listed private fields.
export const cleanJSON = (hidden = []) => ({
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    hidden.forEach((key) => delete ret[key]);
    return ret;
  },
});
