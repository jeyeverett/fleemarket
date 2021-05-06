// Auth
const bcrypt = require('bcryptjs');

const User = require('../models/user');

// LOGIN
const getLogin = (req ,res) => {
    res.render('auth/login', 
        { 
            pageTitle: 'Login', 
            path: '/login',
            isAuthenticated: false,
            csrfToken: req.csrfToken()
        });
}

const postLogin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ "email": email })
    .then(user => {
        if (!user) return res.redirect('/login');
        bcrypt
            .compare(password, user.password)
            .then(match => {
                if (match) {
                    req.session.isLoggedIn = true;
                    req.session.userId = user._id;
                    return req.session.save(err => {
                        err ? console.log(err) : '';
                        res.redirect('/');
                    });
                }
                res.redirect('/login');
            })
            .catch(err => { 
                console.log(err);
                res.redirect('/login'); 
            });
    })
    .catch(err => console.log(err));
}

const postLogout = (req, res) => {
    req.session.destroy(err => {
        err ? console.log(err) : '';
        res.redirect('/');
    });
}

// Sign Up
const getSignUp = (req, res) => {
    res.render('auth/signup', 
    { 
        pageTitle: 'Sign Up', 
        path: '/signup',
        isAuthenticated: false,
        csrfToken: req.csrfToken()
    });
}

const postSignUp = (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/signup'); //Redirect for now, will add error message later
    }

    User.findOne({ "email": email })
        .then(user => {
            if (user) {
                return res.redirect('/signup'); //Redirect for now, will add error message later
            }
            return bcrypt
            .hash(password, 12)
            .then(hashedPassword => {
                const newUser = new User({ 
                        email,
                        password: hashedPassword, 
                        cart: { items: [] } 
                    });
                return newUser.save();
            })
            .then(() => res.redirect('/'))
        })
        .catch(err => console.log(err));
}

module.exports = {
    getLogin,
    postLogin,
    postLogout,
    getSignUp,
    postSignUp
} 