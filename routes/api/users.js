const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// @route POST api/users

router.post(
  "/",
  [
    check("name", "Name Is Required")
      .not()
      .isEmpty(),
    check("email", "Email Is Requied").isEmail(),
    check("password", "Please enter Password").isLength({ min: 5 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    res.send("User Route");
  }
);

module.exports = router;
