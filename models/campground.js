const mongoose = require('mongoose');
const { campgroundSchema } = require('../Schemas');
const review = require('./review');
const Schema = mongoose.Schema;

//https://res.cloudinary.com/demo/image/upload/c_crop,h_200,w_200/docs/models.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    } ,
    reviews : [
    {
        type: Schema.Types.ObjectId,
        ref : 'Review'
    }
    ]
});

CampgroundSchema.post('findOneAndDelete' ,async function(doc){
    if(doc){
        await review.deleteMany({
            _id:{
                $in: doc.reviews
                }
            })
        }
    })


module.exports = mongoose.model('Campground',CampgroundSchema);