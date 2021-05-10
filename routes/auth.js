const express = require('express');
const router = express.Router();

// MIDDLEWARE
const {
    validateLogIn,
    validateSignUp
} = require('../middleware/is-valid');

const { 
    getLogin,
    postLogin,
    postLogout,
    getSignUp,
    postSignUp,
    getResetEmail,
    postResetEmail,
    getResetPassword,
    postResetPassword
 } = require('../controllers/auth');
 
// LOGIN
router.get('/login', getLogin);
router.post('/login', 
    validateLogIn,
    postLogin);

// PASSWORD RESET
router.get('/reset/:resetToken', getResetPassword);
router.post('/reset-password', postResetPassword);

router.get('/reset', getResetEmail);
router.post('/reset', postResetEmail);

// LOGOUT
router.post('/logout', postLogout);

// SIGNUP
router.get('/signup', getSignUp);
router.post('/signup', 
    validateSignUp,
    postSignUp);


module.exports = router;