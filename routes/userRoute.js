const express = require("express");
const router = express.Router();
const { createUser } = require("../controller/userController");

router.get('/', (req, res) => {
  res.send('Helloooo')
})
router.get('/signup', (req, res) => {
  res.render('users/signup', { title: 'Sign Up' });
});
router.post("/signup", createUser);

module.exports = router;
