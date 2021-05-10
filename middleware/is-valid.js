const { check, body } = require('express-validator');
const User = require('../models/user');

const validateProduct = [
    check('title')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Title should be at least 3 characters long.')
        .isString()
        .withMessage('Title should contain only letters and numbers.'),
    check('price')
        .trim()
        .isCurrency()
        .withMessage('Please enter a valid price.'),
    check('imageUrl')
        .trim()
        .isURL()
        .withMessage('Please enter a valid URL'),
    check('description')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Please write a description with at least 50 characters.')
        .isLength({ max: 500 })
        .withMessage('The maximum length of the description should be less than 500 characters.')
];

const validateSignUp = [
    check('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(value => {
            return User.findOne({ "email": value })
            .then(user => {
                if (user) {
                    return Promise.reject('This email address has already been registered.')
                }
            })
        }),
    check('password', 'Password must be at least five characters and include only letters and numbers.')
        .trim()
        .isLength({ min: 5})
        .isAlphanumeric(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match.');
            }
            return true;
        })
];

const validateLogIn = [
    body('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Invalid email or password.'),
    body('password', 'Invalid email or password.')
        .trim()
        .isLength({ min: 5 })
        .isAlphanumeric()
];

module.exports = { 
    validateProduct,
    validateSignUp,
    validateLogIn
};