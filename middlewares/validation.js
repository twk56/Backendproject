const Joi = require("joi");

// สร้าง Schema สำหรับ validate
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  studentId: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

exports.validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
