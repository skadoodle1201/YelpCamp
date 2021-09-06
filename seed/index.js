
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground =require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("database connected");
});
const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i =0;i<50;i++)
    {
        const random1000 = Math.floor(Math.random()*1000);
        const randomP =Math.floor(Math.random()*20) +10;
        const camp =new Campground({
            author: '61355411b11dcd265504903c',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251/1600x900',
            price: randomP,
            description:"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Totam quas hic perferendis facere, et corporis ab recusandae pariatur ipsum maxime aperiam, molestiae minima voluptatum explicabo, ea vel vero eum quisquam"
        })
        await camp.save();
    }
}
seedDB().then(()=> {
    mongoose.connection.close();
})