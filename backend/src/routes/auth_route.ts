import express from 'express';
import * as core from 'express-serve-static-core';
import passport from 'passport';
import path from 'path';

const authRouter = express.Router();

authRouter.get('/login', function(req, res, next) {
    res.sendFile('public/login.html', {root: path.join(__dirname, "../")});
});

authRouter.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

authRouter.post('/login/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

export default authRouter;