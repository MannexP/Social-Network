const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route POST api/posts
// @desc Create a Post
// @Private

router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    //   since we are using error checking we set it first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //                                       errors has array method, this will return the errors
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //                       logged in protected route, giving access to token and ID in req.user. using select to not send back password in json
      const user = await User.findById(req.user.id).select("-password");

      //   set new post object. Text comes from body, the rest comes from the user model(name, avatar), and user is for just the ID
    //   new Post instantiates a new post from the model
      const newPost = new Post( {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

    //  above is the new post made. Save new post in post and send back in response json.
      const post = await newPost.save();
      res.json(post)
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
