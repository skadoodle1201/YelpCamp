const express = require('express');
const router =  express.Router({mergeParams: true});


const Campground =require('../models/campground');
const Review = require('../models/review');

const {reviewSchema} =  require('../Schemas.js');


const catchAsync = require('../utils/catchAsync');
const ExpressErrors = require('../utils/ExpressError');


const validateReview = (req,res,next) => {
        const {error} = reviewSchema.validate(req.body);
        if(error){
            const msg = error.details.map(el => el.message).join(',');
            throw new ExpressErrors(msg,400)
        }
        else{
            next();
        }
}

router.post('/' ,validateReview, catchAsync(async(req,res,next)=>{
        const campground = await Campground.findById(req.params.id);
        const review  = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success' , 'Successfully Posted A Review');
        res.redirect(`/campgrounds/${campground._id}`)
    }))


router.delete('/:reviewId', catchAsync(async(req,res,next) => {
        const {id, reviewId }  = req.params;
        await Campground.findByIdAndUpdate(id, {$pull: { reviews : reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash('success' , 'Successfully Deleted Your Review');
        res.redirect(`/campgrounds/${id}`);
}))



module.exports = router;