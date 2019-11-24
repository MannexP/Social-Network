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

router.post("/", [
  auth,
  [
    check("status", "Status is required")
      .not()
      .isEmpty(),
    check("skills", "Skills is required").not().isEmpty()
  ]
//   Check for errors
], async (req,res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({errors:errors.array()});
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
        profileFields.skills = skills.split(',').map(skill => skill.trim());
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
         let profile = await Profile.findOne({user : req.secure.id});
        //  if found
         if(profile) {
            //  update
            profile = await Profile.findOneAndUpdate({user : req.user.id }, { $set: profileFields }, { new : true}
                );
                return res.json(profile)
         }
        //  if not then Create
        profile = new Profile(profileFields);
        // save
         await profile.save();
        //  send
         res.json(profile);
     } catch (err) {
         console.error(err.sessage);
         res.status(500).send('Server Error');
     }
}
);


module.exports = router;
