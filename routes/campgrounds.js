const express = require('express');
const router =  express.Router();
//const Campground =require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateCamp,isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const { Router } = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
        .get(campgrounds.index)
        .post(isLoggedIn,validateCamp,catchAsync(campgrounds.new))


router.get('/new',isLoggedIn,campgrounds.RenderNewForm)



router.route('/:id')
        .get(catchAsync(campgrounds.show))
        .put(isLoggedIn,isAuthor,validateCamp,catchAsync (campgrounds.UpdateRender))
        .delete(isLoggedIn,isAuthor,catchAsync (campgrounds.deleteCampground))
        
router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.edit))

module.exports = router;