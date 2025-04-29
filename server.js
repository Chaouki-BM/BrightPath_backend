require('dotenv').config();
const passport = require('passport');
const cors = require('cors');
const express =require('express');
const mongoose= require('mongoose');
const app =express();
const port = process.env.PORT;
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
require('./src/Middleware/PassportStrategy');





const AuthRoutes=require("./src/Routes/Auth.route")
const SeanceDirectRoutes=require("./src/Routes/SeanceDirect.route")
const coursRoutes=require("./src/Routes/Cours.route")
const supportCoursRoutes=require("./src/Routes/SupportCours.route")
app.use("/",AuthRoutes)
app.use("/",SeanceDirectRoutes)
app.use('/api/cours', coursRoutes);
app.use('/api/supports', supportCoursRoutes);

app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI).then(()=>{
    
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("Error conneting to MongoDB:",err);
});


app.listen(port,()=> {
    console.log(`App is running on port :${port}`);
});