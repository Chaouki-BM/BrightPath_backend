const express=require('express');
const Router=express.Router();
const Devoire=require("../Controllers/Devoir.controller")
const VerifyToken=require('../Middleware/VerifToken')
Router.post("/creerDevoir",VerifyToken,Devoire.creerDevoir);
Router.post("/mettreAJourDevoir",VerifyToken,Devoire.mettreAJourDevoir);
Router.delete("/supprimerDevoir/:idDevoir",VerifyToken,Devoire.supprimerDevoir);
Router.post("/GetAllDevoir",VerifyToken,Devoire.GetAllDevoir);
module.exports=Router;