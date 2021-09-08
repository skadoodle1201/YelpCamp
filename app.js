if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express')
const path = require('path');
const app = express();
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride =require('method-override');
const session = require('express-session');
const ExpressErrors = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes= require('./routes/reviews');
const usersRoutes= require('./routes/user');


const flash = require('connect-flash');
const passport = require('passport');
const LocalStrat = require('passport-local');
const User = require('./models/user');


//const Joi  = require('joi'); Error Handling through joi middleware "Schemas.js"

//const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useCreateIndex: true, works for older version of mongo
    //useFindAndModify: false works for older version of mongo
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("database connected");
});

app.engine('ejs',ejsMate)
app.set ('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

const secret =process.env.SECRET ||'thisshouldbebetter';

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //24 hours
});

store.on('error', e => {
    console.log('SESSION STORE ERROR', e);
});

const sessionConfig = { 
    store: store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized : true,
    cookie:{
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7
    }

}

app.use(mongoSanitize());

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/",
    "https://www.bootstrapcdn.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://www.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://www.bootstrapcdn.com/",
    "https://use.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/",
    "https://www.bootstrapcdn.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    
];
const fontSrcUrls = [
    "https://use.fontawesome.com/",
    "https://fonts.googleapis.com/",

];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dw1iqqffc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);






app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrat(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({extented: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/',usersRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);

app.get('/',(req,res)=>{
    res.render('home');
    })


app.all('*' , (req,res,next) =>{
	next(new ExpressErrors('Page Not Found',404))
})

app.use((err,req,res,next) => {
	const {statusCode= 500} = err;
    if(!err.message) err.message='Something Went Wrong';
	res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Serving on ${port}`);

})