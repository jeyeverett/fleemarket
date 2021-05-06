const express = require('express');
const router = express.Router();

const { 
    getLogin,
    postLogin,
    postLogout,
    getSignUp,
    postSignUp
 } = require('../controllers/auth');
 
// LOGIN
router.get('/login', getLogin);
router.post('/login', postLogin);

// LOGOUT
router.post('/logout', postLogout);

// SIGNUP
router.get('/signup', getSignUp);
router.post('/signup', postSignUp);


module.exports = router;