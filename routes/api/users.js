const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require('../../models/User.js');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

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
  async(req, res) => {
    // see if user exists
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    // Get users gravatar

    const { name, email, password } = req.body;
    try{
        let user = await User.findOne({ email });

        if(user){
           return res.status(400).json({ errors: [{ msg: "User already exits" }] });
        }
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })
        user = new User({
            name,
            email,
            password
        });
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        const payload = {
          user : {
            id: user.id
          }
        }

        jwt.sign(payload, config.get('jwtSecret'),
        {expiresIn:360000},
        (err, token) => {
          if (err) throw err;
          res.json({token});
        })
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
  }
);

module.exports = router;
