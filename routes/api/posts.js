const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route POST api/posts
// @desc Create a Post
// @access Private

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
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      //  above is the new post made. Save new post in post and send back in response json.
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route GET api/posts
// @desc GET all Post
// @access Private

router.get("/", auth, async (req, res) => {
  try {
    //
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET api/posts/:id
// @desc GET post by ID
// @access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    // error has a kind method
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route Delete api/posts/:id
// @desc Delete post by ID
// @access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // check to see if the user owns post in order to delete
    // req.user.id is a string, and post.user is an object, so we make post.user into a string.
    if (post.user.toString() !== req.user.id) {
      // 401 is not authorizes
      return res.status(401).json({ msg: "User Not Authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by this user
    if (
      // if current user equals req.user.id and if that length is greater than 0, it has already been liked. if so return a 400 req
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    // if not greater than 0 than take that posts like and add to the begining of the array with unshift and add the user with req.user
    post.likes.unshift({ user: req.user.id });

    // save to data base
    await post.save();

    // return posts
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route PUT api/posts/unlike/:id
// @desc Unlike a post
// @access Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by this user
    if (
      // if current user equals req.user.id and if that length is greater than 0, it has already been liked. if so return a 400 req
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not been liked" });
    }

    //  Get remove index, this gets the like
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    // this splices it out of the array
    post.likes.splice(removeIndex, 1);

    // save to data base
    await post.save();

    // return posts
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST api/posts/comment/:id
// @desc  Comment on a post
// @access Private

router.post(
  "/comment/:id",
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

      const post = await Post.findById(req.params.id);

      //   set new post object. Text comes from body, the rest comes from the user model(name, avatar), and user is for just the ID
      //   new Post instantiates a new post from the model
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route DELETE api/posts/comment/:id/:comment_id
// @desc  Delete a comment
// @access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    // get post by id
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // make sure comment exits

    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    // Check if user deleting comment is the user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

     //  Get remove index, this gets the like
     const removeIndex = post.comments
     .map(comment => comment.user.toString())
     .indexOf(req.user.id);

   // this splices it out of the array
   post.comments.splice(removeIndex, 1);

   // save to data base
   await post.save();

   // return comments
   res.json(post.comments);


  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
