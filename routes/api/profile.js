const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route GET api/profile/me
// @desc  GET current users profile
// @access GET Private

router.get("/me", auth, async (req, res) => {
  try {
    const Profile = await Profile.findOne({
      user: req.user.id
    }).populate("user"[("name", "avatar")]);
    if (!profile) {
      return res.status(400).json({
        msg: "There is no profile for this user"
      });
    }
    res.json(profile);
  } catch {
    console.error(err.message);
    res.status(500).send("Server Error from Profile.js");
  }
});

// @route POST api/profile
// @desc  Create or Update user profile
// @access  Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
    //   Check for errors
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //   Pull everything out from the body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //   Build Profile  to insert into data base and check if fields are correct before we set it

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    //  Build Social Object

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // Look for profile by user
    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // return entire profile
        return res.json(profile);
      }
      //   Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route GET api/profile/user/
// @desc  Get All Profiles
// @access  Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET api/profile/user/:user_id
// @desc  Get Profile by user ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile Not Found" });
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route Delete api/profile
// @desc  Delete Profile, user and posts
// @access  Private

router.delete("/", auth, async (req, res) => {
  try {
    // @todo- remove users posts

    //  remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user _idis a field in user model
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route Put api/profile/experience
// @desc  Add Profile Experience
// @access  Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
//
// @route DELETE api/profile/experience/:exp_id   (:exp_id is used because it is a place holder)
// @desc  Delete Experience from  Profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
  // get user by ID
    const profile = await Profile.findOne({user: req.user.id});

    // get remove index
    // create removeIndex variable set to profile.experience and map through it with item reuring ID, chain on indexOf and match it to request.params.exp
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    // take profile we have and use splice to take something out, and we have the value we want to splice in removeIndex
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
    
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
    
  }
});

// @route Put api/profile/education
// @desc  Add Education
// @access  Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
        check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
//
// @route DELETE api/profile/education/:edu_id   (:edu_id is used because it is a place holder)
// @desc  Delete education from  Profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
  // get user by ID
    const profile = await Profile.findOne({user: req.user.id});

    // get remove index
    // create removeIndex variable set to profile.education and map through it with item reuring ID, chain on indexOf and match it to request.params.exp
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

    // take profile we have and use splice to take something out, and we have the value we want to splice in removeIndex
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
    
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
    
  }
})

module.exports = router;
