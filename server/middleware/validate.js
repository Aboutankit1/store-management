const { validationResult } = require("express-validator");

// Runs after express-validator checks; returns 400 with a clean message list if any failed
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const messages = errors.array().map((e) => e.msg);
    throw new Error(messages.join(", "));
  }
  next();
};

module.exports = validate;
