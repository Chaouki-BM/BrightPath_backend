const express=require('express');
const Router=express.Router();
const SeanceDirect=require("../Controllers/SeanceDirect.controller")
const VerifyToken=require('../Middleware/VerifToken')
Router.post("/api/meetings",SeanceDirect.createMeeting);
Router.post("/createSeances",SeanceDirect.createSeance);
Router.delete("/:id",SeanceDirect.deleteSeance);
Router.post("/getSeancesForEnseignant",VerifyToken,SeanceDirect.getSeancesForEnseignant);
Router.get("/getTodaySeancesForEnseignant",VerifyToken,SeanceDirect.getTodaySeancesForEnseignant);
Router.get("/getSeancesForEtudiant",VerifyToken,SeanceDirect.getSeancesForEtudiant);

module.exports=Router;