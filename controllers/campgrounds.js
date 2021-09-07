const Campground =require('../models/campground');
//const { isLoggedIn,validateCamp,isAuthor } = require('../middleware');
const { cloudinary } = require("../cloudinary");



module.exports.index = async (req,res)=>{
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index',{campgrounds});
}


module.exports.RenderNewForm = (req,res)=>{
        res.render('campgrounds/new')
}

module.exports.new = async(req,res,next) => {
        //if(!req.body.campground) throw new ExpressErrors('Invalid Camoground Data',400);
        const campground = new Campground(req.body.campground);
        campground.images = req.files.map(f => ({ url: f.path , filename: f.filename}));
        campground.author = req.user._id;
        await campground.save();
        //console.log(campground);
        req.flash('success' , 'Successfully made a new Campground');
        res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.show = async(req,res,next)=>{
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
}

module.exports.edit = async(req,res,next)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id)
        if(!campground){
                req.flash('error','Cannot Find the Campground Sorry');
                return res.redirect('/campgrounds');
        }
        //const campground  = await Campground.findById(id);
        
        res.render('campgrounds/edit',{campground});
}


module.exports.UpdateRender = async(req,res,next)=>{
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
        const imgs = req.files.map(f => ({ url: f.path , filename: f.filename}))
        campground.images.push(...imgs);
        await campground.save();
        if (req.body.deleteImages) {
                for (let filename of req.body.deleteImages) {
                    await cloudinary.uploader.destroy(filename);
                }
                await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        req.flash('success' , 'Successfully Updated Campground');
        res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteCampground = async(req,res,next)=>{
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success' , 'Successfully Deleted Campground');
        res.redirect(`/campgrounds`);
}