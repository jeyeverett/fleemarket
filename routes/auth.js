const express = require('express');
const router = express.Router();

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
router.post('/login', postLogin);

// PASSWORD RESET
router.get('/reset/:resetToken', getResetPassword);
router.post('/reset-password', postResetPassword);

router.get('/reset', getResetEmail);
router.post('/reset', postResetEmail);

// LOGOUT
router.post('/logout', postLogout);

// SIGNUP
router.get('/signup', getSignUp);
router.post('/signup', postSignUp);


module.exports = router;