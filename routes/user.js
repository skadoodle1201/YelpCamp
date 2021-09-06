const express = require('express');
const router =  express.Router();
const catchAsync = require('../utils/catchAsync')
const users  =require('../controllers/users')

const passport = require('passport');

router.route('/register')
        .get(users.RenderSignUp)
        .post(catchAsync(users.SignUp))

router.route('/login')
        .get(users.RenderLogin)
        .post(passport.authenticate('local',{ failureFlash: true, failureRedirect:'/login'}),catchAsync(users.authenticate))

router.get('/logout', users.logout )

module.exports =router;