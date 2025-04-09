const express=require('express');
const Router=express.Router();
const EtudiantController=require("../Controllers/Etudiant.controller")
const VerifyToken=require('../Middleware/VerifToken')
const upload = require('../Middleware/Multer');
Router.post("/ERegister",EtudiantController.register);
Router.get("/verification",EtudiantController.Verif_Mail);
Router.post("/ELogin",EtudiantController.LoginEtudiant);
Router.post("/buy",EtudiantController.buy);
module.exports=Router;