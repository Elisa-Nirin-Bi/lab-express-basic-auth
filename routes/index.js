const { Router } = require('express');
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');
const router = Router();

router.get('/', (req, res, next) => {
  console.log(req.session);
  const userId = req.session.userId;
  console.log(userId);
  if (userId) {
    User.findById(userId)
      .then((user) => {
        const message = `Hello ${user.username}`;
        res.render('home', { title: message });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    res.render('home', { title: 'Hello stranger' });
  }
});

router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  bcryptjs
    .hash(password, 10)
    .then((passwordHashAndSalt) => {
      return User.create({
        username,
        passwordHashAndSalt
      });
    })
    .then((user) => {
      console.log('New user created', user);
      req.session.userId = user._id;
      res.redirect('/register');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const { username, password } = req.body;
  let user;
  User.findOne({ username })
    .then((document) => {
      user = document;
      if (!user) {
        throw new Error('ACCOUNT_NOT_FOUND');
      } else {
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((comparisonResult) => {
      if (comparisonResult) {
        console.log('User was authenticated');
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        throw new Error('WRONG_PASSWORD');
      }
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
