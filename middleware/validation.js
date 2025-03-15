const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  studentId: Joi.string().pattern(/^\d{12}-\d$/).required().messages({
    "string.pattern.base": "รหัสนักศึกษาต้องเป็น 12 หลักตามด้วยขีดและ 1 หลัก",
  }),
  password: Joi.string().min(6).required(),
});

exports.validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};