const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require('../../models/User');
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

// @route GET api/auth

router.get("/", auth, async (req, res) => {
  try {
    // req.user.id is used here. -password removes the password from the data
    const user = await User.findById(req.user.id).select("-password");
    // sends user
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  PUBLUC

router.post(
  "/",
  [
    check("email", "Email Is Requied").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    // see if user exists
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get users gravatar
    // extract variables through destructuring
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //   check for email and password match with bcrypts method compare
      // //////////////////////////////////this password is the plain text pword user enters on line 43
      const isMatch = await bcrypt.compare(password, user.password);

    //   if no match
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
