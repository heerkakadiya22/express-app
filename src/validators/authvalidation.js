const { body } = require("express-validator");

exports.reValidation = [
  body(["name", "email", "password"])
    .notEmpty()
    .withMessage("All field are required"),
  body("name")
    .matches(/^[a-zA-Z]+$/)
    .withMessage("Name must contain only letters"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be at least 6, max 10 char.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .withMessage("Password must include upper, lower, number & special char"),
];

exports.loginValidation = [
  body(["email", "password"]).notEmpty().withMessage("All field are required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required."),
];
