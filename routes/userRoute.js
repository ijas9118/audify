const express = require("express");
const router = express.Router();
const { createUser, loginUser } = require("../controller/userController");

router.get('/', (req, res) => {
  res.send('Helloooo')
})
router.get('/signup', (req, res) => {
  res.render('users/signup', { title: 'Sign Up' });
}); 
router.post("/signup", createUser);

router.get('/login', (req, res) => {
  res.render('users/login', { title: 'Login' });
})
router.post('/login', loginUser)

module.exports = router;
