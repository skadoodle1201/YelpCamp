const express = require('express');
const router =  express.Router();
const {campgroundSchema } =  require('../Schemas.js');
const Campground =require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const ExpressErrors = require('../utils/ExpressError');


//validating a camp info
const validateCamp = (req,res,next) => {
   
        const {error} = campgroundSchema.validate(req.body);
        if(error){
            const msg = error.details.map(el => el.message).join(',');
            throw new ExpressErrors(msg,400)
        }
        else{
            next();
        }
    }


router.get('/',async (req,res)=>{
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index',{campgrounds});
})

router.get('/new',(req,res)=>{
        res.render('campgrounds/new')

})

router.post('/',validateCamp,catchAsync(async(req,res,next) => {
//if(!req.body.campground) throw new ExpressErrors('Invalid Camoground Data',400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success' , 'Successfully made a new Campground');
        res.redirect(`/campgrounds/${campground._id}`)
}))


router.get('/:id',catchAsync(async(req,res,next)=>{
        const campground = await Campground.findById(req.params.id).populate('reviews');
        if(!campground){
                req.flash('error','Cannot Find the Campground Sorry');
                return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show',{campground});
}))


router.get('/:id/edit',catchAsync(async(req,res,next)=>{
        const campground = await Campground.findById(req.params.id)
        if(!campground){
                req.flash('error','Cannot Find the Campground Sorry');
                return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit',{campground});
}))


router.put('/:id',validateCamp,catchAsync (async(req,res,next)=>{
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
        req.flash('success' , 'Successfully Updated Campground');
        res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete('/:id',catchAsync (async(req,res,next)=>{
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success' , 'Successfully Deleted Campground');
        res.redirect(`/campgrounds`);
}));


module.exports = router;