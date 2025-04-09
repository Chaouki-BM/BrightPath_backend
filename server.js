require('dotenv').config();
const cors = require('cors');
const express =require('express');
const mongoose= require('mongoose');
const app =express();
const port = process.env.PORT;
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


const AuthRoutes=require("./src/Routes/Auth.route")


app.use("/",AuthRoutes)


app.use('/uploads', express.static('uploads'));
mongoose.connect(process.env.MONGO_URI).then(()=>{
    
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("Error conneting to MongoDB:",err);
});


app.listen(port,()=> {
    console.log(`App is running on port :${port}`);
});