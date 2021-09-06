const express = require('express');
const router =  express.Router();
const Campground =require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,validateCamp,isAuthor } = require('../middleware');


//validating a camp info


router.get('/',async (req,res)=>{
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index',{campgrounds});
})

router.get('/new',isLoggedIn,(req,res)=>{
        res.render('campgrounds/new')

})

router.post('/',isLoggedIn,validateCamp,catchAsync(async(req,res,next) => {
//if(!req.body.campground) throw new ExpressErrors('Invalid Camoground Data',400);
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        req.flash('success' , 'Successfully made a new Campground');
        res.redirect(`/campgrounds/${campground._id}`)
}))


router.get('/:id',catchAsync(async(req,res,next)=>{
        const campground =await Campground.findById(req.params.id).populate({
                path:'reviews',
                populate:{
                        path:'author'
                }
        }).populate('author');
        if(!campground){
                req.flash('error','Cannot Find the Campground Sorry');
                return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show',{campground});
}))


router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async(req,res,next)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id)
        if(!campground){
                req.flash('error','Cannot Find the Campground Sorry');
                return res.redirect('/campgrounds');
        }
        //const campground  = await Campground.findById(id);
        
        res.render('campgrounds/edit',{campground});
}))


router.put('/:id',isLoggedIn,isAuthor,validateCamp,catchAsync (async(req,res,next)=>{
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
        req.flash('success' , 'Successfully Updated Campground');
        res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete('/:id',isLoggedIn,isAuthor,catchAsync (async(req,res,next)=>{
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success' , 'Successfully Deleted Campground');
        res.redirect(`/campgrounds`);
}));


module.exports = router;