// Auth
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const User = require("../models/user");

// Mail
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "669448207c0c6a",
    pass: "0ee9b352079138",
  },
});

// LOGIN
const getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    input: null,
    validationErrors: [],
  });
};

const postLogin = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.locals.errorMessage = [errors.array()[0]];
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      input: { email },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.locals.errorMessage = [
          { msg: "No account found with this email address." },
        ];
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          input: { email },
          validationErrors: [{ param: "email" }],
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            req.session.isLoggedIn = true;
            req.session.userId = user._id;
            req.flash("success", "Welcome back!");
            return req.session.save((err) => {
              err ? console.log(err) : "";
              res.redirect("/");
            });
          }
          res.locals.errorMessage = [{ msg: "Invalid email or password." }];
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            input: { email },
            validationErrors: [{ param: "email" }, { param: "password" }],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(() => {
      const error = new Error("Failed login.");
      error.httpStatusCode = 500;
      return next(error);
    });
};

const postLogout = (req, res) => {
  req.session.destroy((err) => {
    err ? console.log(err) : "";
    res.redirect("/");
  });
};

// RESET PASSWORD

const getResetEmail = (req, res) => {
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
  });
};

const postResetEmail = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account found with this email.");
          res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        req.flash(
          "success",
          "A password reset email has been sent to your inbox."
        );
        res.redirect("/");
        return transporter.sendMail({
          to: req.body.email,
          from: "shop@node-ecommerce.com",
          subject: "Reset Password",
          html: `
                            <p>You requested a password reset</p>
                            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>
                        `,
        });
      })
      .catch(() => {
        const error = new Error("Failed to sent sent password reset email.");
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

const getResetPassword = (req, res) => {
  User.findOne({ resetToken: req.params.resetToken })
    .then((user) => {
      if (!user) {
        req.flash("error", "This password reset link does not exist.");
        return res.redirect("/reset");
      }
      if (user.resetTokenExpiration < Date.now()) {
        req.flash("error", "Your password reset link has expired.");
        return res.redirect("/reset");
      }
      res.render("auth/reset-password", {
        pageTitle: "Reset Password",
        path: "/reset-password",
        userId: user._id.toString(),
        resetToken: req.params.resetToken,
      });
    })
    .catch(() => {
      const error = new Error("Failed to find user. Please try again.");
      error.httpStatusCode = 500;
      return next(error);
    });
};

const postResetPassword = (req, res) => {
  const { password, confirmPassword, userId, resetToken } = req.body;
  if (password !== confirmPassword) {
    req.flash("error", "Passwords must match.");
    return res.redirect(`reset/${resetToken}`);
  }

  User.findById(userId)
    .then((user) => {
      if (user.resetTokenExpiration < Date.now()) {
        req.flash("error", "Your password reset link has expired.");
        return res.redirect("/reset");
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = null;
          user.resetTokenExpiration = null;
          return user.save();
        })
        .then(() => {
          req.flash("success", "Your password has been reset.");
          req.session.isLoggedIn = true;
          req.session.userId = user._id;
          return req.session.save((err) => {
            err ? console.log(err) : "";
            res.redirect("/");
            return transporter.sendMail({
              to: user.email,
              from: "shop@node-ecommerce.com",
              subject: "Password Reset Successfully",
              html: "<p>Your password has been successfully reset.</p>",
            });
          });
        });
    })
    .catch(() => {
      const error = new Error("Password reset failed.");
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Sign Up
const getSignUp = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: "/signup",
    input: null,
    validationErrors: [],
  });
};

const postSignUp = (req, res) => {
  const { email, password, sellerName } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errorMessage = errors.array();
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign Up",
      path: "/signup",
      input: { email, sellerName },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
        sellerName,
      });
      return newUser.save();
    })
    .then((user) => {
      req.flash("success", "Welcome to the site!");
      req.session.isLoggedIn = true;
      req.session.userId = user._id;
      return req.session.save((err) => {
        err ? console.log(err) : "";
        res.redirect("/");
        transporter.sendMail({
          to: email,
          from: "shop@node-ecommerce.com",
          subject: "Sign Up",
          html: "<h1>You successfully signed up.</h1>",
        });
      });
    })
    .catch(() => {
      const error = new Error("Sign up failed.");
      error.httpStatusCode = 500;
      return next(error);
    });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getResetEmail,
  postResetEmail,
  getResetPassword,
  postResetPassword,
};
