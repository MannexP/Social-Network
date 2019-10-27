const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require('../../models/User.js');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

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
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

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
        const salt = await bcrypt.hash(password, salt);

        await user.save();
        res.send("User Registered");
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
  }
);

module.exports = router;
