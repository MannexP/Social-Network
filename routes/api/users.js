const express = require('express');
const router = express.Router();

// @route GET api/users

router.get('/', (req,res) => res.send ('User Route'));

module.exports = router;