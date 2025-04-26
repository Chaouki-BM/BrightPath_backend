const express=require('express');
const Router=express.Router();
const SeanceDirect=require("../Controllers/SeanceDirect.controller")
const VerifyToken=require('../Middleware/VerifToken')
Router.post("/api/meetings",SeanceDirect.createMeeting);



module.exports=Router;